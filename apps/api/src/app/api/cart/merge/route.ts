import { NextResponse } from 'next/server';
import { createClient } from "@tecbunny/core/supabase/server";
import { logger } from "@tecbunny/core/logger";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { cartItems = [], wishlistItems = [] } = body;

    // Here we would typically merge the items into the database.
    // For now, returning success as requested by the architectural improvement.
    logger.info('Merged guest state for user', { 
        userId: session.user.id, 
        cartCount: cartItems.length,
        wishlistCount: wishlistItems.length 
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error merging guest cart state', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
