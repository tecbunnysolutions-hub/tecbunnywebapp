import { createClient as createServerClient } from '@tecbunny/database';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from "@tecbunny/core";
import { OrderService } from "@tecbunny/core/server";
import { envConfig } from "@tecbunny/core/environment-validator";
import { BaseSupabaseClient, SupabaseOrderRepository } from "@tecbunny/infra";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json().catch(() => ({})));

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    const role = (profile?.role)
      ?? ((user.app_metadata as any)?.role)
      ?? 'customer';

    const baseClient = new BaseSupabaseClient({
      url: envConfig.supabase.url,
      key: envConfig.supabase.serviceRoleKey || envConfig.supabase.anonKey
    });
    
    const orderRepo = new SupabaseOrderRepository(baseClient);
    const orderService = new OrderService(orderRepo, null as any);

    const result = await orderService.updateOrderStatus(user.id, role, payload);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (error.message === 'Invalid orderId' || error.message === 'Invalid status' || error.message.includes('Status not allowed') || error.message === 'Order can no longer be cancelled') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.message === 'Order not found or failed to load') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    logger.error('order_update_status_unhandled', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
