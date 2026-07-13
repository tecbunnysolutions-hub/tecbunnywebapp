import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, logger } from '@tecbunny/core/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, guestId, cartItems, pricing } = body;

    // We need at least one identifier and some cart data
    if (!userId && !guestId) {
      return NextResponse.json({ error: 'Missing userId or guestId' }, { status: 400 });
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
