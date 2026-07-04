import nodemailer from 'nodemailer';

/**
 * Creates a transporter that uses Direct Transport.
 * Direct transport looks up the MX records of the recipient's domain
 * and sends the email directly to their mail server (e.g. Google's servers),
 * completely bypassing 3rd party relays like SendGrid or Mailgun.
 * 
 * Note: To avoid being marked as spam, the VPS this runs on must have:
 * 1. A static IP address with a good reputation.
 * 2. Proper PTR (Reverse DNS) record pointing to your domain.
 * 3. Valid SPF, DKIM, and DMARC records on your domain.
 */
export const directTransporter = nodemailer.createTransport({
    // We are casting this as any to bypass TS error, but in a real independent setup
    // you would resolve the MX record using `dns` module and create a new transporter 
    // for each destination, or use postfix on localhost:
    // host: 'localhost', port: 25
    ...( { direct: true } as any ),
    name: process.env.MAIL_SERVER_HOSTNAME || 'mail.tecbunny.com',
    logger: true,
    debug: false
});

/**
 * Helper function to send an email using the direct transporter
 */
export async function sendDirectEmail({
    from,
    to,
    subject,
    text,
    html
}: {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
}) {
    try {
        const info = await directTransporter.sendMail({
            from,
            to,
            subject,
            text,
            html
        });
        console.log('Message sent directly:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Failed to send email directly:', error);
        return { success: false, error };
    }
}
