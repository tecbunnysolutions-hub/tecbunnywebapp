import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@tecbunny/database';
import { logger } from '@tecbunny/core';
import { rateLimit } from '@tecbunny/core/rate-limit';

/**
 * GET /api/user/gdpr/export
 * GDPR Article 20 — Right to data portability.
 * Returns a JSON dump of all personal data held for the authenticated user.
 * Rate limited to 3 exports per hour to prevent abuse.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rlResult = await rateLimit(`gdpr_export:${user.id}`, 3, 3_600_000);
    if (!rlResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. You may export your data at most 3 times per hour.' },
        { status: 429 }
      );
    }

    // Collect all personal data in parallel
    const [profileRes, ordersRes, wishlistRes, addressRes, reviewsRes, notifRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('orders').select('id, total, status, payment_status, created_at, items, delivery_address').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('wishlists').select('product_id, added_at').eq('user_id', user.id),
      supabase.from('addresses').select('*').eq('user_id', user.id),
      supabase.from('product_reviews').select('product_id, rating, review_text, created_at').eq('user_id', user.id),
      supabase.from('notification_preferences').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    const exportPayload = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        metadata: user.user_metadata,
      },
      profile: profileRes.data,
      orders: ordersRes.data ?? [],
      wishlist: wishlistRes.data ?? [],
      addresses: addressRes.data ?? [],
      reviews: reviewsRes.data ?? [],
      notification_preferences: notifRes.data,
    };

    logger.info('gdpr.export_requested', { userId: user.id });

    return new NextResponse(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="tecbunny-data-export-${user.id.slice(0, 8)}.json"`,
        'Cache-Control': 'no-store, no-cache',
      },
    });
  } catch (err: any) {
    logger.error('gdpr.export_failed', { error: err.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
