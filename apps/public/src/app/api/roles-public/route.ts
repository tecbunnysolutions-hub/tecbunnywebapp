import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// GET /api/roles-public - Get available user roles (public endpoint for UI)
export async function GET(_: NextRequest) {
  try {
    // Public-safe roles only. Privileged role details are available through /api/roles after auth.
    const roles = [
      {
        id: 'customer',
        name: 'Customer',
        description: 'Regular customer with basic access',
        level: 1
      },
      {
        id: 'sales-agent-applicant',
        name: 'Sales Agent Applicant',
        description: 'Apply for sales agent review',
        level: 2
      }
    ];

    return NextResponse.json({
      roles,
      total: roles.length,
      message: 'Roles retrieved successfully'
    });

  } catch (error) {
    logger.error('roles_public.unhandled', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
