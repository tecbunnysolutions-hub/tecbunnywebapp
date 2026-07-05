export const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';

/**
 * Send a WhatsApp text message using the Meta Cloud API
 */
export async function sendWhatsAppMessage(
  toPhoneNumber: string,
  message: string,
  previewUrl: boolean = false
) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error('WhatsApp API credentials missing in environment variables.');
    return null;
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhoneNumber,
        type: 'text',
        text: {
          preview_url: previewUrl,
          body: message,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Failed to send WhatsApp message:', data);
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }

    return data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
}

/**
 * Mark a message as read in WhatsApp
 */
export async function markWhatsAppMessageRead(messageId: string) {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) return null;

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('Error marking WhatsApp message as read:', error);
    return null;
  }
}
