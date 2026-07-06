import { NextResponse } from 'next/server';
import { PrismaClient, Role } from '@/generated/client';
import { LeadService } from '@/services/leadService';

const prisma = new PrismaClient();

// PATCH /api/leads/:id/assign
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const leadId = resolvedParams.id;
    const body = await req.json();
    const { assigned_to } = body;

    // In a real app, you would extract the acting user's ID from the auth session (e.g., Supabase Auth)
    // For this demonstration, we'll extract it from the headers or assume a SUPERADMIN is calling it.
    const actingUserId = req.headers.get('x-user-id');
    
    if (!actingUserId) {
      return NextResponse.json({ error: 'Unauthorized: Missing x-user-id header' }, { status: 401 });
    }

    // Verify acting user is SUPERADMIN
    const actingUser = await prisma.user.findUnique({
      where: { id: actingUserId },
      select: { role: true }
    });

    if (!actingUser || actingUser.role !== Role.SUPERADMIN) {
      return NextResponse.json({ error: 'Forbidden: Only SUPERADMIN can manually reassign leads' }, { status: 403 });
    }

    // Validate the target user exists and is a manager
    if (assigned_to !== null) {
      const targetUser = await prisma.user.findUnique({
        where: { id: assigned_to }
      });

      if (!targetUser || (targetUser.role !== Role.SERVICE_MANAGER && targetUser.role !== Role.SALES_MANAGER)) {
        return NextResponse.json({ error: 'Bad Request: Target user is not a valid manager' }, { status: 400 });
      }
    }

    // Update the lead
    const updatedLead = await LeadService.updateLead(actingUserId, leadId, { assigned_to });

    return NextResponse.json({ status: 'success', data: updatedLead }, { status: 200 });

  } catch (error: any) {
    console.error('[API] Manual lead assignment failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
