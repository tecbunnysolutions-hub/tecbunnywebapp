import { createSupabaseClient as createClient } from '@tecbunny/database/server';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, logger } from '@tecbunny/core/server';
import { rateLimit } from '@tecbunny/core/rate-limit';
import { z } from 'zod';

const MAX_CART_ITEMS = 100;

const cartSyncSchema = z.object({
  userId: z.string().uuid().nullish(),
  guestId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/).nullish(),
  cartItems: z.array(z.record(z.string(), z.unknown())).max(MAX_CART_ITEMS),
  pricing: z.record(z.string(), z.unknown()).nullish(),
}).refine((v) => Boolean(v.userId || v.guestId), { message: 'Missing userId or guestId' })
  .refine((v) => JSON.stringify(v.cartItems).length <= 100_000 && JSON.stringify(v.pricing ?? {}).length <= 10_000, {
    message: 'Payload too large',
  });

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const rl = await rateLimit(`cart-sync:${clientIP}`, 60, 60000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const raw = await request.json().catch(() => null);
    const parsed = cartSyncSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    const { userId, guestId, cartItems, pricing } = parsed.data;

    // A client-supplied userId is a privileged claim: verify it matches the
    // session before writing with the admin DB client (which bypasses RLS).
    // Guest-only syncs (guestId without userId) are intentionally allowed without auth.
    if (userId) {
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || session.user.id !== userId) {
        logger.warn('cart_sync.unauthorized_user_id_claim', { claimed: userId });
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const db = getAdminDb();
    const isGuest = !userId;

    // Find if there is an existing ACTIVE cart for this user/guest
    let existingCart = null;
    try {
      let query = db.from('carts').select('id').eq('status', 'active');
      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.eq('guest_id', guestId);
      }
      const { data, error } = await query.order('updated_at', { ascending: false }).limit(1).maybeSingle();
      if (!error && data) {
        existingCart = data;
      }
    } catch (dbError) {
      // Table might not exist yet if user hasn't run the SQL script
      logger.warn('Failed to query carts table (might not exist)', { error: dbError });
      return NextResponse.json({ success: false, message: 'Table might not exist' }, { status: 200 });
    }

    try {
      if (existingCart) {
        // Update existing active cart
        await db.from('carts').update({
          items: cartItems,
          pricing: pricing,
          updated_at: new Date().toISOString()
        }).eq('id', existingCart.id);
      } else {
        // Create new active cart
        await db.from('carts').insert({
          user_id: userId || null,
          guest_id: guestId || null,
          items: cartItems,
          pricing: pricing,
          status: 'active'
        });
      }
    } catch (upsertError) {
      logger.error('Failed to upsert cart', { error: upsertError });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    logger.error('Cart sync API error', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
