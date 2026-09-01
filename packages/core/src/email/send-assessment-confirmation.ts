/**
 * Send assessment submission confirmation email
 * Provides timeline expectation and next steps to the lead
 */
import { logger } from '@tecbunny/core';

interface ConfirmationEmailPayload {
  name: string;
  email: string;
  company?: string;
  service: string;
  timeline: string;
  leadPriority: 'HOT' | 'WARM' | 'COLD';
}

/**
 * Send email via Resend or configured email service
 * Placeholder for email service integration
 */
async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  from_email?: string;
  from_name?: string;
}): Promise<void> {
  try {
    // TODO: Integrate with Resend, SendGrid, AWS SES, or similar
    // For now, just log the email
    logger.info('email.confirmation_sent', {
      to: options.to,
      subject: options.subject,
    });
  } catch (error) {
    logger.error('email.send_failed', {
      to: options.to,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function sendAssessmentConfirmationEmail(payload: ConfirmationEmailPayload) {
  const { name, email, company, service, timeline, leadPriority } = payload;

  // Personalize timeline expectation based on lead priority
  let responseTimeText = '';
  let nextActionText = '';

  if (leadPriority === 'HOT') {
    responseTimeText = 'within 2 hours';
    nextActionText = 'We\'ll call or WhatsApp you to confirm requirements and schedule an immediate site survey.';
  } else if (leadPriority === 'WARM') {
    responseTimeText = 'within 24 hours';
    nextActionText = 'We\'ll email or WhatsApp a preliminary technical assessment and ask a few clarifying questions.';
  } else {
    responseTimeText = 'within 2-3 business days';
    nextActionText = 'We\'ll review your requirements and send you relevant case studies and technical guides for your industry.';
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { background: #f8f9fa; padding: 30px; border: 1px solid #e0e0e0; }
        .footer { background: #f8f9fa; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
        .button { display: inline-block; padding: 12px 24px; background: #059669; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .timeline-box { background: white; border-left: 4px solid #059669; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .timeline-box strong { display: block; margin-bottom: 5px; }
        .step { background: white; padding: 15px; margin: 12px 0; border-radius: 4px; border: 1px solid #e0e0e0; }
        .step-number { display: inline-block; background: #10b981; color: white; width: 28px; height: 28px; text-align: center; line-height: 28px; border-radius: 50%; font-weight: bold; margin-right: 10px; }
        .contact-info { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 6px; margin-top: 20px; }
        .contact-info strong { display: block; color: #065f46; }
        .contact-info p { margin: 5px 0; }
        .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .badge-hot { background: #fee2e2; color: #991b1b; }
        .badge-warm { background: #fef3c7; color: #b45309; }
        .badge-cold { background: #e0e7ff; color: #312e81; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Assessment Request Confirmed</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Your technology assessment has been received</p>
        </div>

        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>

          <p>Thank you for submitting your free technology and security assessment request${company ? ` for <strong>${company}</strong>` : ''}. We've received your submission and our engineering team is reviewing your specifications.</p>

          <div class="timeline-box">
            <strong>📞 We'll contact you ${responseTimeText}</strong>
            <p style="margin: 8px 0 0 0; font-size: 14px;">${nextActionText}</p>
          </div>

          <h3 style="margin-top: 25px; margin-bottom: 15px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;">What Happens Next</h3>

          <div class="step">
            <div>
              <span class="step-number">1</span>
              <strong>Initial Review</strong>
            </div>
            <p style="margin: 8px 0 0 20px;">Our technical team analyzes your requirements, facility details, and timeline to create a preliminary assessment.</p>
          </div>

          <div class="step">
            <div>
              <span class="step-number">2</span>
              <strong>Proposal & Site Survey</strong>
            </div>
            <p style="margin: 8px 0 0 20px;">We'll schedule a complimentary on-site inspection to measure infrastructure, identify coverage gaps, and finalize recommendations.</p>
          </div>

          <div class="step">
            <div>
              <span class="step-number">3</span>
              <strong>Bill of Materials (BOQ)</strong>
            </div>
            <p style="margin: 8px 0 0 20px;">You'll receive an itemized proposal with Tier-1 OEM hardware options, project timeline, implementation phases, and support terms.</p>
          </div>

          <div class="step">
            <div>
              <span class="step-number">4</span>
              <strong>Implementation & Support</strong>
            </div>
            <p style="margin: 8px 0 0 20px;">After approval, our engineering team handles installation, configuration, testing, and training with ongoing technical support included.</p>
          </div>

          <h3 style="margin-top: 25px; margin-bottom: 15px;">Your Submission Summary</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #f3f4f6; border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 10px; font-weight: 600;">Service Required:</td>
              <td style="padding: 10px;">${service}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e0e0e0;">
              <td style="padding: 10px; font-weight: 600;">Implementation Timeline:</td>
              <td style="padding: 10px;">${timeline}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 10px; font-weight: 600;">Assessment Status:</td>
              <td style="padding: 10px;"><span class="badge ${leadPriority === 'HOT' ? 'badge-hot' : leadPriority === 'WARM' ? 'badge-warm' : 'badge-cold'}">${leadPriority}</span></td>
            </tr>
          </table>

          <div class="contact-info">
            <strong>💬 Need to discuss immediately?</strong>
            <p><strong>WhatsApp:</strong> <a href="https://wa.me/919604136010?text=Hi%20TecBunny,%20I%20submitted%20an%20assessment%20and%20would%20like%20to%20discuss%20my%20project." style="color: #059669; text-decoration: none;">+91 96041 36010</a></p>
            <p><strong>Call:</strong> <a href="tel:+919604136010" style="color: #059669; text-decoration: none;">+91 96041 36010</a></p>
            <p><strong>Email:</strong> <a href="mailto:contact@tecbunny.tech" style="color: #059669; text-decoration: none;">contact@tecbunny.tech</a></p>
          </div>

          <p style="margin-top: 25px; color: #666; font-size: 14px;">
            <strong>TecBunny Engineering Team</strong><br/>
            Business IT Infrastructure | CCTV & Surveillance | Smart Access Control<br/>
            Goa, India | Est. 2018
          </p>
        </div>

        <div class="footer">
          <p>This email confirms your assessment submission. Do not reply to this email.</p>
          <p><strong>Reference ID:</strong> ${`ASS-${Date.now()}`}</p>
          <p style="margin-top: 15px;">© ${new Date().getFullYear()} TecBunny. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmail({
      to: email,
      subject: `Assessment Confirmed: TecBunny Will Contact You ${responseTimeText}`,
      html: htmlContent,
      from_email: 'contact@tecbunny.tech',
      from_name: 'TecBunny Engineering',
    });

    console.log(`✓ Confirmation email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`✗ Failed to send confirmation email to ${email}:`, error);
    return false;
  }
}
