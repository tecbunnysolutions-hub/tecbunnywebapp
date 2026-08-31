/**
 * Sales Lead Notification System
 * Sends real-time alerts to sales team when new leads arrive
 */

import { logger } from '@tecbunny/core';
import { scoreLeadPriority, formatLeadScore, type LeadScoreBreakdown } from '@tecbunny/core/lead-scoring';

export interface LeadNotificationPayload {
  leadId: string;
  name: string;
  email: string;
  phone?: string;
  company_name?: string;
  service: string;
  industry: string;
  scale: string;
  businessType?: string;
  projectStage?: string;
  projectSize?: string;
  city: string;
  timeline: string;
  budget?: string;
  currentProblem?: string;
  documentUrl?: string;
  documentFilename?: string;
  sourceContext?: string;
}

/**
 * Build rich notification email content
 */
export function buildLeadNotificationEmail(
  payload: LeadNotificationPayload,
  score: LeadScoreBreakdown
): {
  subject: string;
  html: string;
  text: string;
} {
  const scoreDisplay = formatLeadScore(score);
  const priority = score.priority;
  const priorityColor =
    priority === 'HOT'
      ? '#ef4444'
      : priority === 'WARM'
        ? '#f97316'
        : '#6b7280';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .priority-badge {
      display: inline-block;
      background: ${priorityColor};
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .section { background: #f9fafb; padding: 16px; margin-bottom: 16px; border-radius: 6px; border-left: 4px solid ${priorityColor}; }
    .section-title { font-weight: bold; color: #1f2937; margin-bottom: 8px; }
    .field { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb; }
    .field-label { color: #6b7280; font-size: 12px; text-transform: uppercase; }
    .field-value { font-weight: 500; }
    .signals { background: white; padding: 12px; border-radius: 4px; margin-top: 8px; font-size: 13px; }
    .signal-item { padding: 4px 0; }
    .cta-button {
      display: inline-block;
      background: #3b82f6;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 16px;
    }
    .document-link {
      display: inline-block;
      background: #10b981;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      text-decoration: none;
      font-size: 12px;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="priority-badge">${scoreDisplay}</div>
      <h2 style="margin: 10px 0;">New Technology Assessment Lead</h2>
      <p style="margin: 0; opacity: 0.9; font-size: 14px;">${payload.name} • ${payload.company_name || 'Company not specified'}</p>
    </div>

    <div class="section">
      <div class="section-title">📋 Contact Details</div>
      <div class="field">
        <span class="field-label">Name</span>
        <span class="field-value">${payload.name}</span>
      </div>
      <div class="field">
        <span class="field-label">Company</span>
        <span class="field-value">${payload.company_name || 'Not provided'}</span>
      </div>
      <div class="field">
        <span class="field-label">Email</span>
        <span class="field-value"><a href="mailto:${payload.email}" style="color: #3b82f6;">${payload.email}</a></span>
      </div>
      <div class="field">
        <span class="field-label">Phone</span>
        <span class="field-value">${payload.phone ? `<a href="tel:${payload.phone}" style="color: #3b82f6;">${payload.phone}</a>` : 'Not provided'}</span>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🏢 Project Details</div>
      <div class="field">
        <span class="field-label">Service</span>
        <span class="field-value">${payload.service}</span>
      </div>
      <div class="field">
        <span class="field-label">Industry</span>
        <span class="field-value">${payload.industry}</span>
      </div>
      <div class="field">
        <span class="field-label">Business Type</span>
        <span class="field-value">${payload.businessType || 'Not specified'}</span>
      </div>
      <div class="field">
        <span class="field-label">Project Stage</span>
        <span class="field-value">${payload.projectStage || 'Not specified'}</span>
      </div>
      <div class="field">
        <span class="field-label">Project Scale</span>
        <span class="field-value">${payload.scale}</span>
      </div>
      <div class="field">
        <span class="field-label">Approx. Size</span>
        <span class="field-value">${payload.projectSize || 'Not specified'}</span>
      </div>
      <div class="field">
        <span class="field-label">Location</span>
        <span class="field-value">${payload.city}</span>
      </div>
      <div class="field">
        <span class="field-label">Timeline</span>
        <span class="field-value">${payload.timeline}</span>
      </div>
      <div class="field">
        <span class="field-label">Budget</span>
        <span class="field-value">${payload.budget || 'Not specified'}</span>
      </div>
    </div>

    ${payload.currentProblem ? `
    <div class="section">
      <div class="section-title">🎯 Current Challenge</div>
      <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(payload.currentProblem)}</p>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-title">📊 Lead Score Breakdown</div>
      <div class="signals">
        ${score.signals.map(signal => `<div class="signal-item">✓ ${signal}</div>`).join('')}
      </div>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
        Score: ${score.totalScore}/100 (Urgency: ${score.urgency} + Size: ${score.projectSize} + Completeness: ${score.completeness} + Doc: ${score.documentation})
      </div>
    </div>

    ${payload.documentUrl ? `
    <div class="section">
      <div class="section-title">📎 Attached Document</div>
      <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>${payload.documentFilename}</strong></p>
      <a href="${payload.documentUrl}" target="_blank" rel="noopener noreferrer" class="document-link">
        View Document
      </a>
    </div>
    ` : ''}

    <div style="background: #dbeafe; padding: 16px; border-radius: 6px; margin-top: 20px; border-left: 4px solid #3b82f6;">
      <p style="margin: 0; font-size: 13px; color: #1e40af;">
        <strong>Next Steps:</strong>
        ${score.priority === 'HOT' ? 'Call or WhatsApp immediately. High-value, time-sensitive opportunity.' : score.priority === 'WARM' ? 'Reach out within 24 hours. Schedule preliminary consultation.' : 'Add to nurture sequence. Follow up with helpful resources.'}
      </p>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${process.env.CRM_DASHBOARD_URL || 'https://admin.tecbunny.com/leads'}" class="cta-button">
        View in Dashboard
      </a>
    </div>

    <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #9ca3af;">
      <p>This is an automated notification from TecBunny Lead Management System</p>
      <p>Source: ${payload.sourceContext || 'assessment'}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
NEW TECHNOLOGY ASSESSMENT LEAD
${scoreDisplay}

CONTACT
Name: ${payload.name}
Company: ${payload.company_name || 'Not provided'}
Email: ${payload.email}
Phone: ${payload.phone || 'Not provided'}

PROJECT
Service: ${payload.service}
Industry: ${payload.industry}
Business Type: ${payload.businessType || 'Not specified'}
Project Stage: ${payload.projectStage || 'Not specified'}
Scale: ${payload.scale}
Approx. Project Size: ${payload.projectSize || 'Not specified'}
Location: ${payload.city}
Timeline: ${payload.timeline}
Budget: ${payload.budget || 'Not specified'}

${payload.currentProblem ? `CHALLENGE:\n${payload.currentProblem}\n\n` : ''}

LEAD SCORE
Total: ${score.totalScore}/100
Signals: ${score.signals.join(' | ')}

${payload.documentUrl ? `DOCUMENT: ${payload.documentFilename}\n${payload.documentUrl}\n` : ''}

ACTION: ${score.priority === 'HOT' ? 'CALL IMMEDIATELY' : score.priority === 'WARM' ? 'Contact within 24 hours' : 'Add to nurture sequence'}

Dashboard: ${process.env.CRM_DASHBOARD_URL || 'https://admin.tecbunny.com/leads'}
  `;

  const subject =
    score.priority === 'HOT'
      ? `🔥 HOT LEAD: ${payload.company_name || payload.name} - ${payload.service}`
      : `${score.priority === 'WARM' ? '🟠 WARM' : '❄️ COLD'} Lead: ${payload.name} - ${payload.service}`;

  return { subject, html, text };
}

/**
 * Send notification via email (placeholder—integrate with your email service)
 */
export async function notifySalesViaEmail(
  payload: LeadNotificationPayload,
  score: LeadScoreBreakdown,
  recipientEmails: string[] = [process.env.SALES_EMAIL || 'sales@tecbunny.com']
): Promise<boolean> {
  try {
    const { subject, html, text } = buildLeadNotificationEmail(payload, score);

    logger.info('sales_notification.email_preparing', {
      leadId: payload.leadId,
      priority: score.priority,
      recipients: recipientEmails.length,
    });

    // TODO: Integrate with your email service (SendGrid, Resend, AWS SES, etc.)
    // Example:
    // const result = await resend.emails.send({
    //   from: 'leads@tecbunny.com',
    //   to: recipientEmails,
    //   subject,
    //   html,
    //   text,
    // });

    logger.info('sales_notification.email_sent', {
      leadId: payload.leadId,
      priority: score.priority,
      recipients: recipientEmails.length,
    });

    return true;
  } catch (err) {
    logger.error('sales_notification.email_failed', {
      leadId: payload.leadId,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Send notification via webhook (for Slack, Discord, CRM integration, etc.)
 */
export async function notifySalesViaWebhook(
  payload: LeadNotificationPayload,
  score: LeadScoreBreakdown,
  webhookUrl: string = process.env.SALES_WEBHOOK_URL || ''
): Promise<boolean> {
  if (!webhookUrl) {
    logger.warn('sales_notification.webhook_url_missing');
    return false;
  }

  try {
    const emoji = score.priority === 'HOT' ? '🔥' : score.priority === 'WARM' ? '🟠' : '❄️';

    const message = {
      priority: score.priority,
      score: score.totalScore,
      emoji,
      lead: {
        id: payload.leadId,
        name: payload.name,
        company: payload.company_name,
        email: payload.email,
        phone: payload.phone,
      },
      project: {
        service: payload.service,
        industry: payload.industry,
        scale: payload.scale,
        city: payload.city,
        timeline: payload.timeline,
        budget: payload.budget,
      },
      document: payload.documentUrl
        ? {
            url: payload.documentUrl,
            filename: payload.documentFilename,
          }
        : null,
      signals: score.signals,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}`);
    }

    logger.info('sales_notification.webhook_sent', {
      leadId: payload.leadId,
      priority: score.priority,
      webhookUrl: new URL(webhookUrl).hostname,
    });

    return true;
  } catch (err) {
    logger.error('sales_notification.webhook_failed', {
      leadId: payload.leadId,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

/**
 * Main entry point: Notify sales about new lead
 */
export async function notifySalesAboutLead(
  payload: LeadNotificationPayload,
  score: LeadScoreBreakdown
): Promise<{ email: boolean; webhook: boolean }> {
  logger.info('sales_notification.triggered', {
    leadId: payload.leadId,
    priority: score.priority,
    company: payload.company_name,
  });

  const [emailSent, webhookSent] = await Promise.all([
    notifySalesViaEmail(payload, score),
    notifySalesViaWebhook(payload, score),
  ]);

  if (!emailSent && !webhookSent) {
    logger.error('sales_notification.all_channels_failed', {
      leadId: payload.leadId,
    });
  }

  return { email: emailSent, webhook: webhookSent };
}

/**
 * Helper to escape HTML entities
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, char => map[char]);
}
