import { NextRequest, NextResponse } from 'next/server';

import { logger } from "@tecbunny/core";
import { AdminAuthError, requireAdminContext } from "@tecbunny/core/auth/admin-guard";

// Only these event types may be written via the admin API.
// System-generated events (auth failures, webhook errors, etc.) are inserted by server code directly.
const ALLOWED_ADMIN_EVENT_TYPES = new Set([
  'admin_note',
  'manual_review',
  'policy_exception',
  'access_revoked',
  'data_correction',
]);

function getRequestIp(request: NextRequest): string {
  return request.headers.get('cf-connecting-ip')?.trim()
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown';
}

export async function GET(request: NextRequest) {
  try {
    const { serviceSupabase } = await requireAdminContext();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const severity = searchParams.get('severity');
    const eventType = searchParams.get('eventType');

    let query = serviceSupabase
      .from('security_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (severity) {
      query = query.eq('severity', severity);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data: auditLogs, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get total count
    let countQuery = serviceSupabase
      .from('security_audit_log')
      .select('*', { count: 'exact', head: true });

    if (severity) {
      countQuery = countQuery.eq('severity', severity);
    }

    if (eventType) {
      countQuery = countQuery.eq('event_type', eventType);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      auditLogs,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('Error fetching audit logs:', { error });
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, serviceSupabase } = await requireAdminContext();

    const body = await request.json();
    const { eventType, eventData } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: 'eventType is required' },
        { status: 400 }
      );
    }

    if (!ALLOWED_ADMIN_EVENT_TYPES.has(eventType)) {
      return NextResponse.json(
        { error: `eventType must be one of: ${[...ALLOWED_ADMIN_EVENT_TYPES].join(', ')}` },
        { status: 400 }
      );
    }

    // Actor identity, IP, and UA are always server-derived — never client-supplied.
    const { data, error } = await serviceSupabase
      .from('security_audit_log')
      .insert({
        event_type: eventType,
        user_id: user.id,
        ip_address: getRequestIp(request),
        user_agent: request.headers.get('user-agent') ?? null,
        event_data: eventData ?? null,
        severity: 'low',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      auditLog: data
    });

  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('Error creating audit log:', { error });
    return NextResponse.json(
      { error: 'Failed to create audit log' },
      { status: 500 }
    );
  }
}
