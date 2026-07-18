import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { LeadService } from '@/services/leadService';
import { requireApiRole, hasServerPermission } from '@tecbunny/core/server-role-guard';
import { PERMS } from '@tecbunny/core/roles';

// PATCH /api/leads/:id/assign
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const leadId = resolvedParams.id;
    const body = await req.json();
    const { assigned_to } = body;

    // Extract user session via proper server-side authentication
    const { session, error } = await requireApiRole();
    if (error) return error;

    const actingUserId = session.user.id;

    // Verify acting user has the right permission via policy engine
    const isAllowed = await hasServerPermission(PERMS.CRM_ASSIGN_AREA);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions to reassign leads' }, { status: 403 });
    }

    // Validate the target user exists and is a manager
    if (assigned_to !== null) {
      const targetUser = await prisma.user.findUnique({
        where: { id: assigned_to },
        include: { role: true }
      });

      if (!targetUser || !targetUser.role || !targetUser.role.name.includes('manager')) {
        return NextResponse.json({ error: 'Bad Request: Target user is not a valid manager' }, { status: 400 });
      }
    }

    // Update the lead (LeadService now assumes the identity check was performed)
    const updatedLead = await LeadService.updateLead(actingUserId, leadId, { assigned_to });

    return NextResponse.json({ status: 'success', data: updatedLead }, { status: 200 });

  } catch (error: unknown) {
    console.error('[API] Manual lead assignment failed:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
