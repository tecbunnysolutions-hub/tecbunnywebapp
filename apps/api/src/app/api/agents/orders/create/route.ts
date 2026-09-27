import { createSupabaseClient as createClient } from '@tecbunny/database/server';
import { isSupabaseServiceConfigured, requireSupabaseServiceEnv } from '@tecbunny/database';
import { createClient as createSupabaseServiceRoleClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server'
import { z } from 'zod';

import { rateLimit } from '@tecbunny/core/rate-limit';
import { logger } from '@tecbunny/core/logger';
import { checkoutEngine } from '@tecbunny/core/checkout-engine';



// export const dynamic = 'force-dynamic'

type OrderItem = {
  productId: string
  quantity: number
  price: number
  name?: string
  gstRate?: number
  hsnCode?: string
  serialNumbers?: string[]
}

type CustomerInput = {
  email?: string
  mobile?: string
  name?: string
}

const orderItemSchema = z.object({
  productId: z.string().trim().min(1).max(128),
  quantity: z.number().int().min(1).max(100),
  price: z.number().nonnegative().max(1_000_000),
  name: z.string().max(200).optional(),
  gstRate: z.number().min(0).max(100).optional(),
  hsnCode: z.string().max(32).optional(),
  serialNumbers: z.array(z.string().max(120)).max(100).optional(),
});

const customerSchema = z.object({
  email: z.string().email().max(160).optional(),
  mobile: z.string().trim().min(6).max(20).optional(),
  name: z.string().trim().min(1).max(120).optional(),
});

const configPayloadSchema = z.object({
  cameraCount: z.number().int().min(0).max(200).optional(),
  systemType: z.string().max(120).optional(),
}).passthrough();

const createOrderPayloadSchema = z.object({
  customer: customerSchema.optional(),
  items: z.array(orderItemSchema).max(50).optional(),
  notes: z.string().max(2000).optional(),
  type: z.string().trim().max(80).optional(),
  referralCode: z.string().trim().min(3).max(80).regex(/^[A-Za-z0-9_-]+$/).optional(),
  configPayload: configPayloadSchema.optional(),
});

function requesterKey(request: Request) {
  const ip = request.headers.get('cf-connecting-ip')?.trim()
    || request.headers.get('x-real-ip')?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
  const ua = request.headers.get('user-agent')?.trim() || 'unknown';
  return `${ip}|${ua}`.slice(0, 240);
}

function createSupabaseServiceClient() {
  const { url, serviceKey } = requireSupabaseServiceEnv();
  return createSupabaseServiceRoleClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// POST /api/agents/orders/create
// Body: { customer: { email|mobile, name? }, items: OrderItem[], notes?, type?, referralCode?, configPayload? }
export async function POST(request: Request) {
  const anon = await createClient()
  const svc = isSupabaseServiceConfigured ? createSupabaseServiceClient() : await createClient()
  const rawBody = await request.json().catch(() => null)

  const parsedBody = createOrderPayloadSchema.safeParse(rawBody)
  if (!parsedBody.success) {
    return NextResponse.json({ error: 'Invalid request payload', details: parsedBody.error.flatten() }, { status: 400 })
  }

  const body = parsedBody.data
  const referralCode: string | undefined = body.referralCode
  const configPayload = body.configPayload

  const limitCheck = await rateLimit(
    referralCode
      ? `agents_order_referral:${referralCode}:${requesterKey(request)}`
      : `agents_order_authenticated:${requesterKey(request)}`,
    referralCode ? 20 : 60,
    10 * 60 * 1000,
  )

  if (!limitCheck.allowed) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  let agentId: string | null = null;
  let user = null;

  // 1. Resolve Attribution Context (Auth or Referral)
  if (referralCode) {
    // Lead coming from Embedded Widget
    const { data: refAgent, error: refError } = await svc
      .from('sales_agents')
      .select('id, status, user_id, profiles:user_id(name, mobile)')
      .eq('referral_code', referralCode)
      .single();

    if (refError || !refAgent || refAgent.status !== 'approved') {
      return NextResponse.json({ error: 'Invalid or inactive referral context' }, { status: 403 });
    }
    agentId = refAgent.id;
    // For widget leads, we don't necessarily have a logged-in agent user
    // We attach the lead to refAgent.id
  } else {
    // Traditional Agent Dashboard Creation (Requires Auth)
    const { data: { user: authUser } } = await anon.auth.getUser()
    user = authUser;
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const { data: authAgent, error: authAgentErr } = await anon
      .from('sales_agents')
      .select('id, status')
      .eq('user_id', user.id)
      .maybeSingle()

    if (authAgentErr || !authAgent || authAgent.status !== 'approved') {
      return NextResponse.json({ error: 'Approved agent context required' }, { status: 403 });
    }
    agentId = authAgent.id;
  }

  const customer: CustomerInput = body.customer || {}
  const items: OrderItem[] = body.items || []
  const notes: string | undefined = body.notes
  const type: string = body.type || 'Delivery'

  // If it's a widget lead (configPayload exists), we might not have 'items' yet, just a 'Setup' type
  const isWidgetLead = !!configPayload;

  if (isWidgetLead) {
    const serializedConfig = JSON.stringify(configPayload || {});
    if (serializedConfig.length > 4000) {
      return NextResponse.json({ error: 'Configuration payload is too large' }, { status: 400 });
    }
    if (!customer.email && !customer.mobile) {
      return NextResponse.json({ error: 'Customer email or mobile is required for referral leads' }, { status: 400 });
    }
  }

  if (!isWidgetLead && referralCode) {
    // Referral links attribute configuration leads only; priced orders must be
    // placed by the approved agent's own authenticated session.
    return NextResponse.json({ error: 'Referral links can only submit configuration leads' }, { status: 403 })
  }

  if (!isWidgetLead && ((!customer.email && !customer.mobile) || items.length === 0)) {
    return NextResponse.json({ error: 'Provide customer email or mobile and at least one item' }, { status: 400 })
  }

  // 2. High-Tier Enterprise Lead Detection & WhatsApp Notification
  if (isWidgetLead && configPayload) {
    const isHighTier = (configPayload.cameraCount ?? 0) >= 16 || configPayload.systemType?.includes('IP') === true;
    
    if (isHighTier) {
      try {
        const { WhatsAppService } = await import('@tecbunny/core/whatsapp-service');
        const { logger } = await import('@tecbunny/core');
        const whatsapp = new WhatsAppService();

        // Fetch agent info for notification if not already in memory
        const { data: agentData } = await svc
          .from('sales_agents')
          .select('profiles:user_id(name, mobile)')
          .eq('id', agentId)
          .single();

        const agentProfile = agentData?.profiles as any;
        
        if (agentProfile?.mobile) {
          await whatsapp.sendMessage(agentProfile.mobile, `🚀 *NEW HIGH-TIER LEAD* \n\nCustomer: ${customer.name || 'Inquiry'}\nConfig: ${configPayload.cameraCount}x Nodes\nCheck your dashboard for details.`);
        }

        const INSIDE_SALES_LINE = process.env.INSIDE_SALES_WHATSAPP || '919604136010';
        await whatsapp.sendMessage(INSIDE_SALES_LINE, `🔥 *URGENT ENTERPRISE LEAD* \n\nAgent: ${agentProfile?.name || 'Widget'}\nCustomer: ${customer.name || 'Inquiry'} (${customer.mobile || 'No Phone'})\nPriority: Immediate outreach.`);
        
      } catch (err) {
        console.error('Lead notification trigger failed', err);
      }
    }
  }

  // Handle lead creation or full order
  let result;
  if (isWidgetLead) {
    // Create as a lead/order in 'Pending' status
    const { data: lead, error: leadError } = await svc
      .from('orders')
      .insert([{
        customer_name: customer.name || 'Web Lead',
        customer_phone: customer.mobile || null,
        customer_email: customer.email || null,
        status: 'Pending',
        type: 'Setup',
        agent_id: agentId,
        notes: `EMBEDDED_WIDGET | Config: ${JSON.stringify(configPayload)} | ${notes || ''}`,
        subtotal: 0,
        total: 0,
        gst_amount: 0
      }])
      .select()
      .single();
    
    if (leadError) return NextResponse.json({ error: leadError.message }, { status: 500 });
    result = lead;
  } else {
    // Existing logic for full order creation
    const customerId = await ensureCustomerUser(svc, customer)
    if (!customerId) return NextResponse.json({ error: 'Failed to resolve customer' }, { status: 500 })

    // Price from the catalogue, never from the request.
    let checkout;
    try {
      checkout = await checkoutEngine.calculate({
        items: items.map((item) => ({ id: item.productId, quantity: item.quantity, price: 0 })) as any,
        userId: customerId,
        salesAgentId: agentId || undefined,
      });
    } catch (pricingError) {
      return NextResponse.json({ error: pricingError instanceof Error ? pricingError.message : 'Unable to price order' }, { status: 400 })
    }
    const pricedItems = new Map(checkout.itemPrices.map((line: any) => [String(line.product_id), line]));
    const atomicItems = items.map((item) => {
      const line: any = pricedItems.get(item.productId);
      return { ...item, id: item.productId, price: line?.unit_price ?? 0, total_price: line?.total_price ?? 0 };
    })

    const { data: atomicOrder, error: atomicOrderError } = await svc.rpc('allocate_order_inventory_atomic', {
      p_customer_name: customer.name || customer.email || customer.mobile || 'Customer',
      p_customer_id: customerId,
      p_customer_email: customer.email || null,
      p_customer_phone: customer.mobile || null,
      p_delivery_address: null,
      p_notes: notes || null,
      p_payment_method: null,
      p_subtotal: checkout.subtotal,
      p_gst_amount: checkout.gstAmount,
      p_total: checkout.finalTotal,
      p_discount_amount: checkout.totalDiscount,
      p_shipping_amount: 0,
      p_payment_status: 'pending',
      p_order_type: type,
      p_items: atomicItems,
      p_agent_id: agentId,
    })

    if (atomicOrderError) return NextResponse.json({ error: atomicOrderError.message }, { status: 400 })
    result = atomicOrder;
    // Commission is awarded by /api/orders/commission once the order completes.
  }

  const response = NextResponse.json({ 
    success: true, 
    order: result,
    redirectUrl: isWidgetLead ? `/commerce/setup/confirmation?id=${result.id}&ref=${referralCode}` : undefined
  })

  if (referralCode) {
    response.cookies.set('tecbunny_attribution', referralCode, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax'
    });
  }

  return response
}

async function ensureCustomerUser(svc: ReturnType<typeof createSupabaseServiceClient>, c: CustomerInput): Promise<string | null> {
  const normalizedMobile = c.mobile ? c.mobile.replace(/\D/g, '') : null;
  const mobileWithPrefix = normalizedMobile ? (normalizedMobile.startsWith('91') && normalizedMobile.length === 12 ? normalizedMobile : (normalizedMobile.length === 10 ? `91${normalizedMobile}` : normalizedMobile)) : null;
  const email = c.email ? c.email.trim().toLowerCase() : undefined;

  // 1) Try creating the user immediately. This prevents the classic "read then create" race condition.
  const createReq: any = {
    email: email,
    phone: mobileWithPrefix || undefined,
    email_confirm: true,
    phone_confirm: !!mobileWithPrefix,
    user_metadata: { name: c.name, mobile: mobileWithPrefix },
    app_metadata: { role: 'customer' }
  };
  
  const { data: created, error } = await svc.auth.admin.createUser(createReq);

  const userId: string | null = created?.user?.id || null;

  // 2) Existing account: reuse it as-is. Its profile (role, contact details)
  //    belongs to that user and is never modified by an agent order.
  if (!userId && error) {
    const byEmail = email
      ? await svc.from('profiles').select('id').eq('email', email).limit(1).maybeSingle()
      : { data: null };
    const byMobile = !byEmail.data && mobileWithPrefix
      ? await svc.from('profiles').select('id').eq('mobile', mobileWithPrefix).limit(1).maybeSingle()
      : { data: null };
    return (byEmail.data?.id ?? byMobile.data?.id ?? null) as string | null;
  }

  if (!userId) return null;

  // 3) New account: create its customer profile.
  await svc
    .from('profiles')
    .upsert(
      { id: userId, name: c.name || '', email: email || null, mobile: mobileWithPrefix, role: 'customer' },
      { onConflict: 'id', ignoreDuplicates: true }
    );

  return userId;
}
