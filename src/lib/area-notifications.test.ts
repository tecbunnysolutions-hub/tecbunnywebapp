import { describe, expect, it, vi } from 'vitest';

vi.mock('./improved-email-service', () => ({
  default: {
    sendEmail: vi.fn(),
  },
}));

vi.mock('./supabase/server', () => ({
  createServiceClient: vi.fn(),
  isSupabaseServiceConfigured: false,
}));

vi.mock('./site-url', () => ({
  resolveSiteUrl: () => 'https://tecbunny.com',
}));

import { extractPincode } from './area-notifications';

describe('extractPincode', () => {
  it('prefers an explicit delivery pincode', () => {
    expect(extractPincode({
      delivery_pincode: '403512',
      delivery_address: 'Pune, Maharashtra - 411001',
    })).toBe('403512');
  });

  it('extracts a six-digit Indian pincode from a delivery address', () => {
    expect(extractPincode({
      delivery_address: 'Mapusa, Goa - 403507',
    })).toBe('403507');
  });

  it('supports nested shipping address data', () => {
    expect(extractPincode({
      shipping_address: { postal_code: '560100' },
    })).toBe('560100');
  });

  it('rejects missing and invalid pincodes', () => {
    expect(extractPincode({ delivery_address: 'Pincode 000000' })).toBeNull();
    expect(extractPincode({ delivery_address: 'No postal code' })).toBeNull();
  });
});
