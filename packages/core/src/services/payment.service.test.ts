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

  const guestClient = (insert: any) => ({ from: (table: string) => {
    if (table === 'settings') return { select: () => ({ in: async () => ({ data: [{ key: 'payu_merchant_key', value: 'test' }, { key: 'payu_merchant_salt', value: 'salt' }] }) }) };
    if (table === 'orders') return { select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'order', customer_id: null, customer_email: 'Guest@Example.com', total: 100 } }) }) }) };
    return { insert };
  } });
  const base = { orderId: 'order', userId: null, userRole: null, clientIp: '127.0.0.1', host: 'localhost', correlationId: 'test', staffPaymentRoles: new Set(['admin']) };

  it('rejects guest orders without a matching email', async () => {
    const service = new PaymentService(guestClient(vi.fn()) as any);
    await expect(service.initiatePayuPayment(base)).rejects.toThrow('not allowed');
    await expect(service.initiatePayuPayment({ ...base, guestEmail: 'other@example.com' })).rejects.toThrow('not allowed');
  });

  it('allows guest orders with matching email and admins', async () => {
    const insert = vi.fn().mockResolvedValue({ error: { message: 'stop' } });
    const service = new PaymentService(guestClient(insert) as any);
    await expect(service.initiatePayuPayment({ ...base, guestEmail: 'guest@example.com' })).rejects.toThrow('Could not record');
    await expect(service.initiatePayuPayment({ ...base, userRole: 'admin' })).rejects.toThrow('Could not record');
  });
});
