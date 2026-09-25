import { describe, expect, it, vi } from 'vitest';
vi.mock('../logger', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../whatsapp-service', () => ({ sendPaymentConfirmationNotification: vi.fn(), sendWhatsAppNotification: vi.fn() }));
import { PaymentService } from './payment.service';

describe('PayU initiation persistence', () => {
  it('does not return checkout credentials when the transaction cannot be recorded', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: 'database unavailable' } });
    const client = { from: (table: string) => {
      if (table === 'settings') return { select: () => ({ in: async () => ({ data: [{ key: 'payu_merchant_key', value: 'test' }, { key: 'payu_merchant_salt', value: 'salt' }] }) }) };
      if (table === 'orders') return { select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'order', customer_id: 'user', total: 100 } }) }) }) };
      return { insert };
    } };
    const service = new PaymentService(client as any);
    await expect(service.initiatePayuPayment({ orderId: 'order', userId: 'user', userRole: 'customer', clientIp: '127.0.0.1', host: 'localhost', correlationId: 'test', staffPaymentRoles: new Set() })).rejects.toThrow('Could not record payment transaction');
    expect(insert).toHaveBeenCalledOnce();
  });
});
