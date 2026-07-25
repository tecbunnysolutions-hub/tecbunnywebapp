import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireApiRole } from '@tecbunny/core/server-role-guard';
import { prisma } from '@/lib/prisma';
import { canAccessConversationSender, canManageUserInScope, resolveActorScope } from '@/lib/authorization-scope';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request) {
  try {
    const auth = await requireApiRole();
    if (auth.error) return auth.error;
    if (auth.role === 'customer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const scope = await resolveActorScope(auth.session.user.id, auth.role);
    if (!scope) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { sender_number, contact_name, status, tags, notes, assigned_to, department, ai_active, deal_value, active_flow } = body;

    if (!sender_number) {
      return NextResponse.json({ error: 'Missing sender_number' }, { status: 400 });
    }

    const allowed = await canAccessConversationSender(scope, String(sender_number));
    if (!allowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (assigned_to !== undefined && assigned_to !== null) {
      const assignee = await prisma.user.findUnique({
        where: { id: String(assigned_to) },
        select: { organization_id: true, branch_id: true },
      });
      if (!assignee) {
        return NextResponse.json({ error: 'Invalid assigned_to user' }, { status: 400 });
      }
      if (!canManageUserInScope(scope, assignee)) {
        return NextResponse.json({ error: 'Forbidden: assignee outside allowed scope' }, { status: 403 });
      }
    }

    // Build the update object dynamically
    const updateData: Record<string, unknown> = {};
    if (contact_name !== undefined) updateData.contact_name = contact_name;
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;
    if (notes !== undefined) updateData.notes = notes;
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to;
    if (department !== undefined) updateData.department = department;
    if (ai_active !== undefined) updateData.ai_active = Boolean(ai_active);
    if (deal_value !== undefined) updateData.deal_value = deal_value;
    if (active_flow !== undefined) updateData.active_flow = active_flow;

    const { data, error } = await supabase
      .from('Conversation')
      .update(updateData)
      .eq('sender_number', sender_number)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, conversation: data });
  } catch (error) {
    console.error('Failed to update conversation:', error);
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 });
  }
}
