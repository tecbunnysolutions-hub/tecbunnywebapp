import { describe, expect, it, vi } from 'vitest';
vi.mock('../logger', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../whatsapp-service', () => ({ sendPaymentConfirmationNotification: vi.fn(), sendWhatsAppNotification: vi.fn() }));
import { PaymentService } from './payment.service';

const initiate = (service: PaymentService) => service.initiatePayuPayment({ orderId: 'order', userId: 'user', userRole: 'customer', clientIp: '127.0.0.1', host: 'localhost', correlationId: 'test', staffPaymentRoles: new Set() });

function clientFor({ settled = [] as Array<{ amount: number }>, items = {} as Record<string, unknown>, insertError = null as null | { message: string } } = {}) {
  const insert = vi.fn().mockResolvedValue({ error: insertError });
  const client = { from: (table: string) => {
    if (table === 'settings') return { select: () => ({ in: async () => ({ data: [{ key: 'payu_merchant_key', value: 'test' }, { key: 'payu_merchant_salt', value: 'salt' }] }) }) };
    if (table === 'orders') return { select: () => ({ eq: () => ({ single: async () => ({ data: { id: 'order', customer_id: 'user', total: 100, items } }) }) }) };
    return { insert, select: () => ({ eq: () => ({ eq: async () => ({ data: settled, error: null }) }) }) };
  } };
  return { service: new PaymentService(client as any), insert };
}

describe('PayU initiation persistence', () => {
  it('does not return checkout credentials when the transaction cannot be recorded', async () => {
    const { service, insert } = clientFor({ insertError: { message: 'database unavailable' } });
    await expect(initiate(service)).rejects.toThrow('Could not record payment transaction');
    expect(insert).toHaveBeenCalledOnce();
  });
});

describe('PayU payable amount', () => {
  it('charges a recorded deposit only for the first payment', async () => {
    const { service } = clientFor({ items: { part_payment_amount: 30 } });
    expect((await initiate(service)).params.amount).toBe('30.00');
  });

  it('charges the outstanding balance after a deposit settles', async () => {
    const { service } = clientFor({ items: { part_payment_amount: 30 }, settled: [{ amount: 30 }] });
    expect((await initiate(service)).params.amount).toBe('70.00');
  });

  it('refuses to charge an order that is already paid', async () => {
    const { service, insert } = clientFor({ settled: [{ amount: 100 }] });
    await expect(initiate(service)).rejects.toThrow('no outstanding balance');
    expect(insert).not.toHaveBeenCalled();
  });
});
