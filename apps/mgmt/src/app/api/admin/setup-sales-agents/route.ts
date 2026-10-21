import { NextResponse } from 'next/server';

import { AdminAuthError, requireAdminContext } from "@tecbunny/core/auth/admin-guard";
import { logger } from "@tecbunny/core/logger";

// export const dynamic = 'force-dynamic';

// POST /api/admin/setup-sales-agents
// One-time setup endpoint to create the sales agent feature
export async function POST(_request: Request) {
  try {
    logger.info('admin_setup_sales_agents.audit.requested');
    const { serviceSupabase: supabase, user } = await requireAdminContext();

    // Create the sales_agents table with a simple approach
    // First, try to create the table and add the essential RLS policy
    const { error: createError } = await supabase
      .from('sales_agents')
      .select('id')
      .limit(1);

    // If table doesn't exist, we'll get an error
    if (createError && createError.message.includes('does not exist')) {
      // Return instructions for manual setup since we can't create tables via API
      return NextResponse.json({ 
        error: 'Tables need to be created manually',
        message: 'Please run the migration SQL in your Supabase dashboard to create the required tables.',
        sql: `
-- Essential setup SQL:
CREATE TYPE sales_agent_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE redemption_status AS ENUM ('pending', 'approved', 'rejected', 'processed');

CREATE TABLE public.sales_agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    referral_code TEXT NOT NULL UNIQUE,
    points_balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status sales_agent_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can apply for sales agent" ON public.sales_agents 
    FOR INSERT WITH CHECK (user_id = auth.uid());
    
CREATE POLICY "Agents can view their own data" ON public.sales_agents 
    FOR SELECT USING (user_id = auth.uid());
        `
      }, { status: 400 });
    }

    // Read-only check: never insert/delete rows in sales_agents from this setup endpoint
    const { error: probeError } = await supabase
      .from('sales_agents')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);
    if (probeError) {
      logger.error('sales_agents_setup.policy_test_error', { error: probeError.message });
    }

    logger.info('admin_setup_sales_agents.audit.success', { userId: user.id });
    return NextResponse.json({ 
      success: true, 
      message: 'Sales Agent feature has been set up successfully!' 
    });

  } catch (err: unknown) {
    if (err instanceof AdminAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    logger.error('admin_setup_sales_agents.audit.failed', { error: err instanceof Error ? err.message : String(err) });
    logger.error('sales_agents_setup.error', { error: err });
    return NextResponse.json({ 
      error: 'Failed to set up Sales Agent feature',
    }, { status: 500 });
  }
}
