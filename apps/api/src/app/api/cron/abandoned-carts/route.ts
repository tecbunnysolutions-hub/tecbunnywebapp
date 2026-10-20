import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, logger, improvedEmailService } from '@tecbunny/core/server';
import { verifyCronSecret } from '@tecbunny/core/cron-guard';

import { getInternalToken } from '../../../../lib/internal-auth';

export async function GET(request: NextRequest) {
  const deny = verifyCronSecret(request);
  if (deny) return deny;

  try {
    const db = getAdminDb();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    // Query for carts that are 'active', have a user_id, and haven't been updated in 2 hours
    const { data: abandonedCarts, error: fetchError } = await db
      .from('carts')
      .select('*')
      .eq('status', 'active')
      .not('user_id', 'is', null)
      .lt('updated_at', twoHoursAgo)
      .limit(50); // Process in batches

    if (fetchError) {
      // Table might not exist
      logger.warn('Failed to fetch abandoned carts (table might not exist)', { error: fetchError });
      return NextResponse.json({ success: false, message: 'Table might not exist' }, { status: 200 });
    }

    if (!abandonedCarts || abandonedCarts.length === 0) {
      return NextResponse.json({ success: true, message: 'No abandoned carts found' }, { status: 200 });
    }

    let processedCount = 0;

    for (const cart of abandonedCarts) {
      try {
        // Fetch user email from Supabase Auth
        const { data: { user }, error: userError } = await db.auth.admin.getUserById(cart.user_id);
        
        if (userError || !user || !user.email) {
          logger.warn(`Could not find user for cart ${cart.id}`, { error: userError });
          continue;
        }

        // Send email
        const cartItems = cart.items || [];
        if (cartItems.length > 0) {
          // The route reads the phone, name and cart from the database; only the user id is sent.
          const internalToken = getInternalToken();
          if (!internalToken) {
            logger.warn('Abandoned carts: INTERNAL_API_TOKEN is not set, reminder skipped');
          } else {
            await fetch(new URL('/api/email/abandoned-cart', request.url), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-internal-api-token': internalToken },
              body: JSON.stringify({ userId: cart.user_id }),
            });
          }
        }

        // Mark as abandoned so we don't send again
        await db.from('carts').update({ status: 'abandoned', updated_at: new Date().toISOString() }).eq('id', cart.id);
        processedCount++;
        
      } catch (err: any) {
        logger.error(`Failed to process cart ${cart.id}`, { error: err.message });
      }
    }

    return NextResponse.json({ success: true, processedCount }, { status: 200 });

  } catch (error: any) {
    logger.error('Abandoned carts cron error', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
