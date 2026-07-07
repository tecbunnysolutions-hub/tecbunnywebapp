import { logger } from '@tecbunny/core';
import { sendOrderNotification, sendWhatsAppNotification } from '@tecbunny/core/whatsapp-service';
export class NotificationServiceImpl {
    async sendCredentialsEmail(email, name, password, siteUrl) {
        try {
            const improvedEmailService = (await import('@tecbunny/core/improved-email-service')).default;
            const subject = 'Your Account Has Been Created - TecBunny Store';
            const html = `
        <div style="font-family: Arial, sans-serif; line-height:1.6;">
          <h2>Welcome to TecBunny Store, ${name}!</h2>
          <p>Your account was created by an administrator. Email verification is not required.</p>
          <p><strong>Login Email:</strong> ${email}<br/>
             <strong>Temporary Password:</strong> ${password}</p>
          <p>
            You can sign in here: <a href="${siteUrl}/auth/signin">${siteUrl}/auth/signin</a><br/>
            For security, please change your password after first login from your profile settings.
          </p>
          <p>If you didn’t expect this, contact support at sales@tecbunny.com.</p>
        </div>
      `;
            await improvedEmailService.sendEmail({ to: email, subject, html });
        }
        catch (e) {
            logger.error('Failed to send credentials email:', { error: e });
        }
    }
    async sendOrderCustomerNotification(phone, orderId, customerName) {
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        const formattedPhone = cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone}`;
        try {
            await sendOrderNotification(formattedPhone, {
                orderNumber: orderId,
                customerName
            });
            logger.info('order_whatsapp_customer_sent', { orderId, phone: formattedPhone });
        }
        catch (err) {
            logger.warn('order_whatsapp_customer_failed', { orderId, error: err.message });
        }
    }
    async sendOrderAdminNotification(orderId, customerName, phone, total, itemsList, siteUrl) {
        const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER;
        if (!adminPhone)
            return;
        const adminMessage = `🛒 New Order Received!\n\n` +
            `📋 Order ID: ${orderId}\n` +
            `👤 Customer: ${customerName}\n` +
            `📱 Phone: ${phone}\n` +
            `💰 Total: ₹${total}\n` +
            `📦 Items:\n${itemsList || 'No items listed'}\n` +
            `🔗 View: ${siteUrl}/mgmt/admin/orders/${orderId}\n` +
            `⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
        try {
            await sendWhatsAppNotification(adminPhone, adminMessage);
            logger.info('order_whatsapp_admin_sent', { orderId, adminPhone });
        }
        catch (err) {
            logger.warn('order_whatsapp_admin_failed', { orderId, error: err.message });
        }
    }
    async sendOrderManagerNotification(orderId, customerName, total, managerPhone) {
        if (!managerPhone)
            return;
        const managerMessage = `📋 Order #${orderId}\n` +
            `👤 ${customerName}\n` +
            `💰 ₹${total}\n` +
            `⏰ ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;
        try {
            await sendWhatsAppNotification(managerPhone, managerMessage);
            logger.info('order_whatsapp_manager_sent', { orderId, managerPhone });
        }
        catch (err) {
            logger.warn('order_whatsapp_manager_failed', { orderId, error: err.message });
        }
    }
}
