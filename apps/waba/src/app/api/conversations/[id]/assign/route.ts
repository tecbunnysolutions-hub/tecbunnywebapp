import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiRole, hasServerPermission } from '@tecbunny/core/server-role-guard';
import { PERMS } from '@tecbunny/core/roles';

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
    const { session, error } = await requireApiRole();
    if (error) return error;

    // Verify acting user has the right permission via policy engine
    const isAllowed = await hasServerPermission(PERMS.CRM_ASSIGN_AREA);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to assign conversations' }, { status: 403 });
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
