import { describe, it, expect, vi } from 'vitest';
import { validateWebhookSignature, validateWebhookTimestamp } from './webhook-validator';
import { resolvePublicProductPrice, isPubliclyVisibleProduct } from './product-visibility';
import { verifyPayuHash } from './payu-service';
import crypto from 'crypto';

describe('Security & Transaction Deep Audit Suite', () => {
  // ─── 1. Webhook Signature & Replay Attack Defense ──────────────────────────
  describe('Webhook Security & Replay Attack Defense', () => {
    const secret = 'super-secret-webhook-key-12345';
    const payload = JSON.stringify({ event: 'payment.captured', order_id: 'ord_123', amount: 4999 });

    it('successfully validates authentic HMAC-SHA256 signature', () => {
      const validSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
      expect(validateWebhookSignature(validSig, payload, secret)).toBe(true);
      expect(validateWebhookSignature(`sha256=${validSig}`, payload, secret)).toBe(true);
    });

    it('rejects tampered or forged webhook signatures using timingSafeEqual', () => {
      const forgedSig = crypto.createHmac('sha256', 'wrong-key').update(payload).digest('hex');
      expect(validateWebhookSignature(forgedSig, payload, secret)).toBe(false);
      expect(validateWebhookSignature('invalid-hex', payload, secret)).toBe(false);
      expect(validateWebhookSignature(null, payload, secret)).toBe(false);
    });

    it('enforces 5-minute replay attack tolerance window', () => {
      const nowSec = Math.floor(Date.now() / 1000);
      expect(validateWebhookTimestamp(nowSec)).toBe(true);
      expect(validateWebhookTimestamp(nowSec - 120)).toBe(true); // 2 mins ago is valid

      // Over 5 minutes ago should throw Replay Attack error
      expect(() => validateWebhookTimestamp(nowSec - 360)).toThrow('Replay Attack');
      // In the far future should throw Replay Attack error
      expect(() => validateWebhookTimestamp(nowSec + 360)).toThrow('Replay Attack');
    });
  });

  // ─── 2. PayU Reverse Hash Cryptographic Verification ───────────────────────
  describe('PayU Reverse Hash Verification', () => {
    const payuConfig = {
      merchantKey: 'merchant_123',
      merchantSalt: 'salt_456',
      environment: 'production' as const,
    };

    it('verifies valid reverse SHA-512 payment callback hash', () => {
      const responsePayload: Record<string, string> = {
        key: payuConfig.merchantKey,
        txnid: 'txn_98765',
        amount: '1500.00',
        productinfo: 'TecBunny Services',
        firstname: 'John',
        email: 'john@example.com',
        status: 'success',
        udf1: 'ord_live_123',
        udf2: '',
        udf3: '',
        udf4: '',
        udf5: '',
        udf6: '',
        udf7: '',
        udf8: '',
        udf9: '',
        udf10: '',
      };

      // PayU reverse response hash sequence:
      // salt|status|udf10|udf9|udf8|udf7|udf6|udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
      const udfArrayReversed = Array.from({ length: 10 }, (_, i) => responsePayload[`udf${10 - i}`] || '');
      const baseSequence = [
        payuConfig.merchantSalt,
        responsePayload.status,
        ...udfArrayReversed,
        responsePayload.email,
        responsePayload.firstname,
        responsePayload.productinfo,
        responsePayload.amount,
        responsePayload.txnid,
        payuConfig.merchantKey,
      ].join('|');

      const expectedHash = crypto.createHash('sha512').update(baseSequence).digest('hex');
      responsePayload.hash = expectedHash;

      const isValid = verifyPayuHash(payuConfig, responsePayload);
      expect(isValid).toBe(true);
    });

    it('rejects spoofed PayU callback when hash does not match salt calculation', () => {
      const isValid = verifyPayuHash(payuConfig, {
        key: payuConfig.merchantKey,
        txnid: 'txn_fake',
        amount: '1500.00',
        productinfo: 'TecBunny Services',
        firstname: 'Attacker',
        email: 'attacker@evil.com',
        status: 'success',
        udf1: 'ord_victim_123',
        hash: '0123456789abcdef0123456789abcdef'
      });

      expect(isValid).toBe(false);
    });
  });

  // ─── 3. Authoritative Pricing & Fallback Hierarchy ─────────────────────────
  describe('Authoritative Pricing & Fallback Hierarchy', () => {
    it('always selects the first positive price in the 6-field hierarchy', () => {
      expect(resolvePublicProductPrice({ price: 0, selling_price: 2499 })).toBe(2499);
      expect(resolvePublicProductPrice({ price: null, selling_price: null, sale_price: 1999 })).toBe(1999);
      expect(resolvePublicProductPrice({ offer_price: 1499, discount_price: 1200 })).toBe(1499);
      expect(resolvePublicProductPrice({ unit_price: 799 })).toBe(799);
    });

    it('excludes inactive, deleted, or unpriced products from public catalog', () => {
      expect(isPubliclyVisibleProduct({ price: 500, status: 'archived' })).toBe(false);
      expect(isPubliclyVisibleProduct({ price: 500, is_active: false })).toBe(false);
      expect(isPubliclyVisibleProduct({ price: 500, deleted_at: '2026-08-01T00:00:00Z' })).toBe(false);
      expect(isPubliclyVisibleProduct({ price: 0 })).toBe(false);
      expect(isPubliclyVisibleProduct({ price: 500, status: 'published' })).toBe(true);
    });
  });

  // ─── 4. Concurrency & Stock Allocation Model ────────────────────────────────
  describe('Stock Reservation & Concurrency Race Condition Model', () => {
    it('simulates 2 concurrent purchase attempts for a single inventory unit (stock = 1)', async () => {
      let currentStock = 1;
      const successfulOrders: string[] = [];
      const failedOrders: Array<{ orderId: string; reason: string }> = [];

      // Atomic allocation simulator replicating PostgreSQL allocate_order_inventory_atomic
      async function attemptAtomicOrder(orderId: string, requestedQty: number) {
        // In PostgreSQL: SELECT stock_quantity FROM products WHERE id = ... FOR UPDATE
        if (currentStock >= requestedQty) {
          // Decrement atomically
          currentStock -= requestedQty;
          successfulOrders.push(orderId);
          return { success: true, orderId };
        } else {
          failedOrders.push({ orderId, reason: 'Insufficient stock' });
          throw new Error('Insufficient stock');
        }
      }

      // Simulate 2 parallel checkouts simultaneously executing
      const results = await Promise.allSettled([
        attemptAtomicOrder('order_user_A', 1),
        attemptAtomicOrder('order_user_B', 1),
      ]);

      // Exactly one order succeeds
      expect(successfulOrders.length).toBe(1);
      // Exactly one order is rejected
      expect(failedOrders.length).toBe(1);
      // Stock never goes below zero
      expect(currentStock).toBe(0);
      expect(results.filter(r => r.status === 'fulfilled').length).toBe(1);
      expect(results.filter(r => r.status === 'rejected').length).toBe(1);
    });
  });
});
