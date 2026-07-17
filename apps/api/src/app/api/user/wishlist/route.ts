import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { logger } from '@tecbunny/core';
import { z } from 'zod';

const ToggleSchema = z.object({
  product_id: z.string().uuid(),
  action: z.enum(['add', 'remove']),
});

/**
 * GET /api/user/wishlist
 * Returns the authenticated user's persisted wishlist items.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ wishlist: [] });

    const { data, error } = await supabase
      .from('wishlists')
      .select('product_id, added_at, products(id, title, name, price, image, image_url, status)')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) {
      logger.error('wishlist.fetch_failed', { error: error.message, userId: user.id });
      return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 });
    }

    return NextResponse.json({ wishlist: data ?? [] });
  } catch (err: any) {
    logger.error('wishlist.get_uncaught', { error: err.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/user/wishlist
 * Toggle a product in/out of the authenticated user's wishlist.
 * Body: { product_id: string, action: 'add' | 'remove' }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

    const parsed = ToggleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });
    }

    const { product_id, action } = parsed.data;

    if (action === 'add') {
      const { error } = await supabase
        .from('wishlists')
        .upsert({ user_id: user.id, product_id, added_at: new Date().toISOString() }, { onConflict: 'user_id,product_id' });
      if (error) {
        logger.error('wishlist.add_failed', { error: error.message, userId: user.id, productId: product_id });
        return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
      }
      return NextResponse.json({ success: true, action: 'added' });
    }

    if (action === 'remove') {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product_id);
      if (error) {
        logger.error('wishlist.remove_failed', { error: error.message, userId: user.id, productId: product_id });
        return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 });
      }
      return NextResponse.json({ success: true, action: 'removed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    logger.error('wishlist.post_uncaught', { error: err.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/user/wishlist
 * Clear entire wishlist for the authenticated user.
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      logger.error('wishlist.clear_failed', { error: error.message, userId: user.id });
      return NextResponse.json({ error: 'Failed to clear wishlist' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    logger.error('wishlist.delete_uncaught', { error: err.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
