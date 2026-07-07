export const sendWhatsAppNotification = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendShipmentNotification = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendPaymentActionRequired = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendPaymentConfirmationNotification = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendOrderCancelled = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendOrderDelayed = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendOrderActionNeeded = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendOrderPickupReady = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendDeliveryConfirmation = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendPaymentReminder = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendWelcomeNotification = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendOrderNotification = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendOrderStatusUpdate = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendPickupNotification = async (...args) => ({ messages: [{ id: 'dummy' }] });
export const sendOutForDeliveryNotification = async (...args) => ({ messages: [{ id: 'dummy' }] });
export class WhatsAppService {
    async checkWhatsAppConsent(...args) { return false; }
    async sendOTP(...args) {
        // WhatsApp is disabled
        return { messages: [{ id: 'dummy' }] };
    }
    async sendMessage(...args) {
        return { messages: [{ id: 'dummy' }] };
    }
}
