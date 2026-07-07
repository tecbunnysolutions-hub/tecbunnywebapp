import { NextRequest, NextResponse } from 'next/server';
import { logger } from "@tecbunny/core";
import { BaseSupabaseClient, SupabaseUserRepository } from "@tecbunny/infra";
import { verifySuperadminSessionToken } from "@tecbunny/core/server";
import { UserService } from "@tecbunny/core";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_ANON_KEY);
}

function getAdminBaseClient() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured');
  }
  return new BaseSupabaseClient({
    url: SUPABASE_URL!,
    key: SUPABASE_SERVICE_ROLE_KEY!,
  });
}

function getAnonBaseClient() {
  return new BaseSupabaseClient({
    url: SUPABASE_URL!,
    key: SUPABASE_ANON_KEY!,
  });
}

const parseCsvParam = (value: string | null) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

async function getEffectiveUserRole(user: any) {
  return user?.app_metadata?.role || 'customer';
}

async function createAuthenticatedClient(request: NextRequest) {
  const superadminCookie = request.cookies.get('superadmin-session')?.value;
  const superadminPayload = await verifySuperadminSessionToken(superadminCookie);
  if (superadminPayload) {
    return {
      session: { user: { id: 'superadmin-root-id', email: superadminPayload.email } },
      role: 'superadmin'
    };
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const baseClient = getAnonBaseClient();
      const { data, error } = await baseClient.rawClient.auth.getUser(token);
      if (!error && data?.user) {
        const role = await getEffectiveUserRole(data.user);
        return { session: { user: data.user }, role };
      }
    }
  }

  return { session: null, role: null };
}

// GET /api/users - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const { session, role } = await createAuthenticatedClient(request);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!role || !['admin', 'manager', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);

    const pageParam = Number(searchParams.get('page'));
    const pageSizeParam = Number(searchParams.get('pageSize'));
    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
    const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.min(Math.floor(pageSizeParam), 100) : 25;
    const search = (searchParams.get('search') || '').trim();
    const roles = parseCsvParam(searchParams.get('role'));
    const sortFieldParam = searchParams.get('sortField') || 'name';
    const sortDirectionParam = searchParams.get('sortDirection') === 'desc' ? 'desc' : 'asc';
    const includeCounts = searchParams.get('includeCounts') !== 'false';

    const SORTABLE_COLUMNS: Record<string, string> = {
      name: 'full_name',
      email: 'email',
      role: 'role',
      created_at: 'created_at',
      updated_at: 'updated_at'
    };

    const sortColumn = SORTABLE_COLUMNS[sortFieldParam] || SORTABLE_COLUMNS.name;

    const baseClient = getAdminBaseClient();
    const userRepository = new SupabaseUserRepository(baseClient);
    const userService = new UserService(userRepository);

    const result = await userService.getUsers({
      page,
      pageSize,
      search,
      roles,
      sortColumn,
      sortDirection: sortDirectionParam,
      operatorRole: role
    });

    if (includeCounts && result.success) {
      const totalsResult = await userService.getTotals(role);
      result.data.totals = totalsResult.success ? totalsResult.data : null;
    }

    return NextResponse.json(result.success ? result.data : { error: result.error.message }, { status: result.success ? 200 : 400 });
  } catch (error) {
    logger.error('Error in GET /api/users:', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Service configuration error' }, { status: 503 });
    }
    const { session, role } = await createAuthenticatedClient(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!role || !['admin', 'manager', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    const baseClient = getAdminBaseClient();
    const userRepository = new SupabaseUserRepository(baseClient);
    const userService = new UserService(userRepository);

    try {
      const user = await userService.createUser({
        email: body.email,
        name: body.name,
        role: body.role,
        mobile: body.mobile,
        password: body.password,
        operatorRole: role,
        operatorId: session.user.id
      });

      return NextResponse.json({
        message: 'User created successfully',
        user
      });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
  } catch (error) {
    logger.error('Error in POST /api/users:', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/users - Update user (admin only)
export async function PUT(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Service configuration error' }, { status: 503 });
    }
    const { session, role } = await createAuthenticatedClient(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!role || !['admin', 'manager', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, updates } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const baseClient = getAdminBaseClient();
    const userRepository = new SupabaseUserRepository(baseClient);
    const userService = new UserService(userRepository);

    try {
      await userService.updateUser({
        userId,
        updates,
        operatorRole: role,
        operatorId: session.user.id
      });

      return NextResponse.json({ message: 'User updated successfully' });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }

  } catch (error) {
    logger.error('Error in PUT /api/users:', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users - Delete user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Service configuration error' }, { status: 503 });
    }
    const { session, role } = await createAuthenticatedClient(request);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!role || !['admin', 'superadmin'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const baseClient = getAdminBaseClient();
    const userRepository = new SupabaseUserRepository(baseClient);
    const userService = new UserService(userRepository);

    try {
      await userService.deleteUser({
        userId,
        operatorRole: role,
        operatorId: session.user.id
      });
      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
  } catch (error) {
    logger.error('Error in DELETE /api/users:', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
