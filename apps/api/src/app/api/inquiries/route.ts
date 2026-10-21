import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, logger } from '@tecbunny/core/server';
import { improvedEmailService } from '@tecbunny/core/server';
import { rateLimit } from '@tecbunny/core/rate-limit';

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('cf-connecting-ip')?.trim()
      || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || 'unknown';
    const rl = await rateLimit(`inquiries:${ip}`, 5, 15 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { name, phone, email, type, productId, message, service, address, preferredDate, website } = body;

    if (website) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    if (!name || !phone || !type) {
      return NextResponse.json({ error: 'Name, phone, and type are required' }, { status: 400 });
    }
    const isSiteVisit = type === 'site_visit';
    if (isSiteVisit && !/^\+?[0-9\s-]{10,15}$/.test(String(phone).trim())) {
      return NextResponse.json({ error: 'Enter a valid phone number' }, { status: 400 });
    }
    const visitDetails = isSiteVisit
      ? [
          service ? `Service: ${String(service).slice(0, 120)}` : '',
          address ? `Address/Area: ${String(address).slice(0, 300)}` : '',
          preferredDate ? `Preferred date/time: ${String(preferredDate).slice(0, 80)}` : '',
        ].filter(Boolean).join('\n')
      : '';
    const fullMessage = [message ? String(message).slice(0, 2000) : '', visitDetails].filter(Boolean).join('\n') || null;

    const db = getAdminDb();
    
    // Attempt to save to the database, ignore if the table doesn't exist yet
    let savedInquiry = null;
    try {
      const result = await db.from('inquiries').insert({
        name,
        phone,
        email: email || null,
        type,
        product_id: productId || null,
        message: fullMessage,
        status: 'pending',
        created_at: new Date().toISOString()
      }).select().single();
      savedInquiry = result.data;
    } catch (e: any) {
      logger.warn('Failed to save inquiry to DB (table might not exist)', { error: e.message });
    }

    // Send Email to Admin
    try {
      const adminEmail = isSiteVisit
        ? (process.env.SALES_EMAIL || 'sales@tecbunny.com')
        : (process.env.SUPPORT_EMAIL || 'support@tecbunny.com');
      await improvedEmailService.sendEmail({
        to: adminEmail,
        subject: isSiteVisit
          ? `New Site Visit Booking: ${String(name).slice(0, 80)}`
          : `New ${type === 'b2b' ? 'B2B Quote' : 'Installation'} Inquiry!`,
        html: `
          <h2>New Lead Alert</h2>
          <p><strong>Name:</strong> ${escapeHtml(String(name))}</p>
          <p><strong>Phone:</strong> ${escapeHtml(String(phone))}</p>
          ${email ? `<p><strong>Email:</strong> ${escapeHtml(String(email))}</p>` : ''}
          <p><strong>Type:</strong> ${escapeHtml(String(type))}</p>
          ${productId ? `<p><strong>Product ID:</strong> ${escapeHtml(String(productId))}</p>` : ''}
          ${fullMessage ? `<p><strong>Details:</strong><br/>${escapeHtml(fullMessage).replace(/\n/g, '<br/>')}</p>` : ''}
        `
      });
    } catch (emailError: any) {
      logger.error('Failed to send admin alert email', { error: emailError.message });
    }

    // Send WhatsApp to Admin via Infobip (Free-form text message)
    try {
      const infobipKey = process.env.INFOBIP_API_KEY;
      const infobipUrl = process.env.INFOBIP_BASE_URL || 'https://w4pz8r.api.infobip.com';
      const adminPhone = (process.env.LEAD_NOTIFY_WHATSAPP || '919604136010').replace(/\D/g, '');

      if (infobipKey) {
        await fetch(`${infobipUrl}/whatsapp/1/message/text`, {
          method: 'POST',
          headers: {
            'Authorization': `App ${infobipKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            from: process.env.INFOBIP_WHATSAPP_FROM || '15558835946',
            to: adminPhone,
            messageId: `inq-${Date.now()}`,
            content: {
              text: isSiteVisit
                ? `📍 New Site Visit Booking\nName: ${name}\nPhone: ${phone}${email ? `\nEmail: ${email}` : ''}\n${visitDetails}`
                : `🚀 New Lead! \nName: ${name}\nPhone: ${phone}\nType: ${type}\nProduct: ${productId || 'N/A'}`
            }
          })
        });
      }
    } catch (waError: any) {
      logger.error('Failed to send admin alert whatsapp', { error: waError.message });
    }

    // Send data to HubSpot CRM directly
    try {
      const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN;
      if (hubspotToken && hubspotToken !== 'your-hubspot-access-token-here') {
        const hubspotResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hubspotToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            properties: {
              firstname: name,
              email: email || '',
              phone: phone,
              hs_lead_status: 'NEW',
              message: fullMessage || '',
              product_id: productId || ''
            }
          })
        });
        
        if (!hubspotResponse.ok) {
          const errorData = await hubspotResponse.text();
          logger.error('Failed to create HubSpot contact', { error: errorData });
        } else {
          logger.info('Successfully created HubSpot contact');
        }
      }
    } catch (hubspotError: any) {
      logger.error('Failed to connect to HubSpot', { error: hubspotError.message });
    }

    return NextResponse.json({ success: true, inquiry: savedInquiry }, { status: 200 });

  } catch (error: any) {
    logger.error('Inquiries API error', { error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const runtime = 'nodejs';
