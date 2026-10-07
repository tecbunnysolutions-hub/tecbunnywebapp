import { NextResponse } from 'next/server';

import { logger } from '@tecbunny/core/logger';
import { isSuperadmin, isSuperadminSession } from '@tecbunny/core/permissions';
import { createSupabaseClient } from '@tecbunny/database/server';

export async function requireSuperadminApi(context: string) {
  try {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    const authorized = await isSuperadminSession() || await isSuperadmin(user);

    if (!authorized) {
      return { authorized: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }) };
    }

    return { authorized: true as const, user };
  } catch (error) {
    logger.warn(`${context}.auth_failed`, { error });
    return { authorized: false as const, response: NextResponse.json({ error: 'Unauthorized' }, { status: 403 }) };
  }
}