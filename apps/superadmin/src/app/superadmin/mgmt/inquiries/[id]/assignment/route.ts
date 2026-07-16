import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireSuperadminContext, AdminAuthError } from "@tecbunny/core/server";
import { improvedEmailService } from "@tecbunny/core/server";
import { logger } from "@tecbunny/core";

const assignmentSchema = z.object({
  assignedUserId: z.string().uuid(),
}).strict();

type AssignmentResult = {
  changed?: boolean;
  inquiry?: Record<string, unknown>;
  assignee?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
};

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: 'Valid inquiry ID is required' }, { status: 400 });
    }

    const parsed = assignmentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Valid assignee is required' }, { status: 400 });
    }

    const { serviceSupabase, user } = await requireSuperadminContext();
    const assignedByLabel = user.email || 'Superadmin';
    const { data, error } = await serviceSupabase.rpc('superadmin_assign_inquiry', {
      p_inquiry_id: id,
      p_assigned_user_id: parsed.data.assignedUserId,
      p_assigned_by_label: assignedByLabel,
    });

    if (error) {
      logger.warn('superadmin_inquiry_assignment_rejected', { inquiryId: id, error: error.message });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const result = (data || {}) as AssignmentResult;
    const inquiry = result.inquiry || {};
    const assignee = result.assignee || {};

    if (result.changed && assignee.email) {
      const category = inquiry.inquiry_category === 'Services' ? 'Services' : 'Sales';
      const centralEmail = category === 'Services'
        ? (process.env.SUPPORT_TEAM_EMAIL || 'support@tecbunny.com')
        : (process.env.SALES_TEAM_EMAIL || 'sales@tecbunny.com');
      const customerName = escapeHtml(inquiry.name || 'Customer');
      const subject = escapeHtml(inquiry.subject || `${category} inquiry`);
      const emailSubject = String(inquiry.subject || inquiry.id || id).replace(/[\r\n]+/g, ' ').trim();

      const emailResult = await improvedEmailService.sendEmail({
        to: assignee.email,
        cc: centralEmail,
        replyTo: centralEmail,
        skipRateLimit: true,
        subject: `[ASSIGNED ${category.toUpperCase()} INQUIRY] ${emailSubject}`,
        html: `
          <h2>New ${escapeHtml(category)} inquiry assigned</h2>
          <p>Hi ${escapeHtml(assignee.name || 'Team Member')},</p>
          <p>A Superadmin assigned this inquiry to you.</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Email:</strong> ${escapeHtml(inquiry.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(inquiry.phone || 'Not provided')}</p>
          <p><strong>Origin:</strong> ${escapeHtml(inquiry.origin_key || 'general_contact')}</p>
          <p><strong>Message:</strong><br>${escapeHtml(inquiry.message)}</p>
          <p>Please open the TecBunny Superadmin inquiry pipeline to review the record.</p>
        `,
        text: [
          `New ${category} inquiry assigned`,
          `Customer: ${String(inquiry.name || 'Customer')}`,
          `Subject: ${String(inquiry.subject || category + ' inquiry')}`,
          `Email: ${String(inquiry.email || '')}`,
          `Phone: ${String(inquiry.phone || 'Not provided')}`,
          `Origin: ${String(inquiry.origin_key || 'general_contact')}`,
          `Message: ${String(inquiry.message || '')}`,
        ].join('\n'),
      });

      if (!emailResult.success) {
        logger.warn('superadmin_inquiry_assignment_email_failed', {
          inquiryId: id,
          assigneeId: assignee.id,
          error: emailResult.error,
        });
      }
    }

    return NextResponse.json({
      inquiry,
      assignee,
      changed: Boolean(result.changed),
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('superadmin_inquiry_assignment_failed', { error });
    return NextResponse.json({ error: 'Failed to assign inquiry' }, { status: 500 });
  }
}
