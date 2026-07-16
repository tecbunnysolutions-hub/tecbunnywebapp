import { createClient } from '@tecbunny/database';
import { NextRequest, NextResponse } from 'next/server';


import { twoFactorManager } from "@tecbunny/core/two-factor-manager";
import { logger } from "@tecbunny/core";

// Force dynamic rendering for this route
// export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

  const status = await twoFactorManager.getTwoFactorStatus(user.id, supabase);

    if (!status) {
      return NextResponse.json(
        { error: 'Failed to retrieve 2FA status' },
        { status: 500 }
      );
    }

    return NextResponse.json(status);

  } catch (error) {
    logger.error('two_factor.status.error', { error });
    return NextResponse.json(
      { error: 'Failed to retrieve 2FA status' },
      { status: 500 }
    );
  }
}
