import { NextRequest, NextResponse } from 'next/server';

import { getSessionWithRole } from '@/lib/auth/server-role';
import {
  EFFECTIVE_PERMISSIONS,
  ROLE_DESCRIPTION,
  ROLE_DISPLAY_NAME,
  USER_ASSIGNABLE_ROLES,
} from '@/lib/roles';
import { logger } from '@/lib/logger';

// GET /api/roles - Return the canonical roles the current operator may assign.
export async function GET(request: NextRequest) {
  try {
    const { session, role } = await getSessionWithRole(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const roles = USER_ASSIGNABLE_ROLES.map((roleName) => ({
      id: roleName,
      name: ROLE_DISPLAY_NAME[roleName],
      description: ROLE_DESCRIPTION[roleName],
      permissions: Array.from(EFFECTIVE_PERMISSIONS[roleName]).sort(),
    }));

    return NextResponse.json({ roles, total: roles.length });
  } catch (error) {
    logger.error('roles.list_failed', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    error: 'Custom roles are disabled. Assign one of the canonical staff roles.',
  }, { status: 405 });
}
