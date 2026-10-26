import { test } from 'node:test';
import assert from 'node:assert/strict';
import { productInput } from './google-merchant-sync.mjs';

const product = { id: 'camera-1', title: 'Camera', description: '<p>Security camera</p>',
  image: '/camera.jpg', selling_price: 1500, offer_price: 1299.95, stock_quantity: 2 };

test('maps live offer price to INR micros, absolute URLs and stable India offer', () => {
  const input = productInput(product);
  assert.equal(input.offerId, 'camera-1');
  assert.equal(input.feedLabel, 'IN');
  assert.deepEqual(input.productAttributes.price, { amountMicros: '1299950000', currencyCode: 'INR' });
  assert.equal(input.productAttributes.description, 'Security camera');
  assert.equal(input.productAttributes.imageLink, 'https://www.tecbunny.com/camera.jpg');
  assert.equal(input.productAttributes.availability, 'IN_STOCK');
});

test('does not advertise sold-out stock as available', () => {
  assert.equal(productInput({ ...product, stock_quantity: 0 }).productAttributes.availability, 'OUT_OF_STOCK');
});

test('rejects hidden, service, incomplete, unknown-stock and unsafe-image products', () => {
  for (const changes of [{ status: 'draft' }, { is_active: false }, { isService: true },
    { description: '' }, { stock_quantity: undefined }, { image: 'javascript:alert(1)' }]) {
    assert.equal(productInput({ ...product, ...changes }), null);
  }
});
