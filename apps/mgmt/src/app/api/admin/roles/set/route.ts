import { UserRole, normalizeRole } from "@tecbunny/core";
import { withAuditEvent } from "@tecbunny/core/enterprise-analytics";
import { createClient } from '@tecbunny/database';
import { createServiceClient, isSupabaseServiceConfigured } from "@tecbunny/database/admin";
import { NextResponse } from 'next/server';

import { requireRole } from "@tecbunny/core/auth/guard";



interface Body {
  userId: string;
  newRole: UserRole;
  note?: string;
}

// POST /api/admin/roles/set
export async function POST(req: Request) {
  const ctx = await requireRole('superadmin');
  if ('error' in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  try {
    const body = (await req.json()) as Body;
    if (!body?.userId || !body?.newRole) {
      return NextResponse.json({ error: 'userId and newRole required' }, { status: 400 });
    }

    const { userId, note } = body;
    const newRole = normalizeRole(body.newRole);
    if (!newRole) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Block self-demotion or self-promotion patterns as needed (optional)
    if (ctx.user.id === userId && newRole !== ctx.role) {
      return NextResponse.json({ error: 'Self role change not permitted' }, { status: 400 });
    }

    if (newRole === 'superadmin') {
      return NextResponse.json({ error: 'The root Superadmin role is not assignable' }, { status: 403 });
    }

    const supabase = isSupabaseServiceConfigured ? createServiceClient() : await createClient();
    const { data: targetProfile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
    if (!targetProfile) {
      return NextResponse.json({ error: 'Target user profile not found' }, { status: 404 });
    }
    const previousRole = normalizeRole(targetProfile.role);
    if (previousRole === 'superadmin') {
      return NextResponse.json({ error: 'The root Superadmin role cannot be modified' }, { status: 403 });
    }

    await withAuditEvent({
      application: 'mgmt',
      module: 'roles',
      screen: '/api/admin/roles/set',
      action: 'staff_role_change',
      description: `Changed staff role for ${userId} from ${previousRole ?? 'unknown'} to ${newRole}`,
      entityType: 'profile',
      entityId: userId,
      oldValue: { role: previousRole ?? targetProfile.role },
      newValue: { role: newRole },
      reason: note ?? 'mgmt_staff_role_change',
      context: { userId: ctx.user.id, userEmail: ctx.user.email, role: ctx.role },
      apiEndpoint: '/api/admin/roles/set',
      httpMethod: 'POST',
      databaseTable: 'profiles',
      priority: 'critical',
    }, async () => {
      // Update profiles.role via RPC for audit (preferred) else fallback
      const { error: rpcError } = await supabase.rpc('admin_set_user_role', { p_user_id: userId, p_role: newRole, p_note: note ?? null });
      if (rpcError) {
        throw new Error(`Role update failed: ${rpcError.message}`);
      }

      // Log the role alteration to security audit log
      await supabase
        .from('security_audit_log')
        .insert({
          event_type: 'role_alteration',
          user_id: userId,
          event_data: {
            action: 'set',
            previous_role: targetProfile.role,
            new_role: newRole,
            modified_by: ctx.user.id,
            note: note ?? null
          },
          severity: 'high'
        });

      if (isSupabaseServiceConfigured) {
        const { error: metadataError } = await supabase.auth.admin.updateUserById(userId, {
          app_metadata: { role: newRole }
        });
        if (metadataError) {
          throw new Error(`Role metadata sync failed: ${metadataError.message}`);
        }
      }

      return null;
    });

    return NextResponse.json({ success: true, userId, newRole });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
