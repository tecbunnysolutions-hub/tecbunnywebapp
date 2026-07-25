import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiRole, hasServerPermission } from '@tecbunny/core/server-role-guard';
import { PERMS } from '@tecbunny/core/roles';
import { canAccessConversationSender, canManageUserInScope, resolveActorScope } from '@/lib/authorization-scope';

// PATCH /api/conversations/:id/assign
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const conversationId = parseInt(resolvedParams.id, 10);

    if (isNaN(conversationId)) {
      return NextResponse.json({ error: 'Bad Request: Invalid conversation ID' }, { status: 400 });
    }

    const body = await req.json();
    const { assigned_to, department, priority } = body;

    // Extract user session via proper server-side authentication
    const { session, role, error } = await requireApiRole();
    if (error) return error;

    const scope = await resolveActorScope(session.user.id, role);
    if (!scope) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify acting user has the right permission via policy engine
    const isAllowed = await hasServerPermission(PERMS.CRM_ASSIGN_AREA);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to assign conversations' }, { status: 403 });
    }

    const existingConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { sender_number: true },
    });

    if (!existingConversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const canAccess = await canAccessConversationSender(scope, existingConversation.sender_number);
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (assigned_to !== undefined && assigned_to !== null) {
      const assignee = await prisma.user.findUnique({
        where: { id: String(assigned_to) },
        select: { organization_id: true, branch_id: true },
      });
      if (!assignee) {
        return NextResponse.json({ error: 'Bad Request: assignee does not exist' }, { status: 400 });
      }
      if (!canManageUserInScope(scope, assignee)) {
        return NextResponse.json({ error: 'Forbidden: assignee outside allowed scope' }, { status: 403 });
      }
    }

    // Update the conversation
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...(assigned_to !== undefined && { assigned_to }),
        ...(department !== undefined && { department }),
        ...(priority !== undefined && { priority }),
        status: assigned_to ? 'ASSIGNED' : 'OPEN',
      }
    });

    return NextResponse.json({ status: 'success', data: updatedConversation }, { status: 200 });

  } catch (error: unknown) {
    console.error('[API] Manual conversation assignment failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
