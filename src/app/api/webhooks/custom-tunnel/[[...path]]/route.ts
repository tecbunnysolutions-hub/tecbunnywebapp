import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path?: string[] }> }
) {
  const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
  
  // Security checks: Disable in production and require tunnel secret
  if (process.env.NODE_ENV === 'production') {
    logger.warn('custom_tunnel.production_access_attempt', { correlationId });
    return new NextResponse(null, { status: 404 });
  }

  const expectedSecret = process.env.TUNNEL_SECRET;
  const providedSecret = req.headers.get('x-tunnel-secret');
  
  if (!expectedSecret || providedSecret !== expectedSecret) {
    logger.warn('custom_tunnel.unauthorized_access', { correlationId });
    return NextResponse.json({ error: 'Unauthorized access to webhook tunnel' }, { status: 401 });
  }

  try {
    // 1. Resolve path parameter
    const resolvedParams = await params;
    const pathParts = resolvedParams.path || [];
    const targetPath = pathParts.join('/');

    if (!targetPath) {
      logger.warn('custom_tunnel.missing_target_path', { correlationId });
      return NextResponse.json({ error: 'Missing target subpath in URL' }, { status: 400 });
    }

    // 2. Capture custom headers
    const signature = req.headers.get('x-webhook-signature') || req.headers.get('stripe-signature');
    const source = req.headers.get('x-webhook-source') || 'unknown';

    // 3. Read raw payload
    const rawBody = await req.text();
    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      logger.warn('custom_tunnel.invalid_json', { correlationId, targetPath });
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // 4. Initialize Supabase Client with service role key to bypass RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseKey) {
      logger.error('custom_tunnel.missing_env_credentials', { correlationId });
      return NextResponse.json({ error: 'Server configuration missing credentials' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 5. Insert the custom webhook into the database queue table
    const { error } = await supabase
      .from('custom_webhook_tunnel_queue')
      .insert({
        target_path: targetPath,
        signature,
        source,
        payload
      });

    if (error) {
      logger.error('custom_tunnel.database_insert_failed', { correlationId, targetPath, error: error.message });
      return NextResponse.json({ error: 'Failed to queue custom webhook in tunnel' }, { status: 500 });
    }

    logger.info('custom_tunnel.queued_successfully', { correlationId, targetPath, source });
    return NextResponse.json({ success: true, message: `Webhook event queued for local path: /api/webhooks/${targetPath}` }, { status: 200 });

  } catch (error: any) {
    logger.error('custom_tunnel.error', { correlationId, error: error.message });
    return NextResponse.json(
      { error: 'Custom tunnel processing failed', details: error.message },
      { status: 500 }
    );
  }
}
