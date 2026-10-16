import { describe, expect, it } from 'vitest';

import { assertAccess } from './v1-auth';

const as = (role: string) => ({ role }) as Parameters<typeof assertAccess>[0];

describe('assertAccess', () => {
  it('401s without a caller', () => {
    expect(() => assertAccess(null, 'customer')).toThrowError(expect.objectContaining({ status: 401 }));
  });

  it('lets any authenticated role reach customer routes', () => {
    expect(() => assertAccess(as('customer'), 'customer')).not.toThrow();
    expect(() => assertAccess(as('admin'), 'customer')).not.toThrow();
  });

  it('keeps customers out of staff routes but lets staff and admins in', () => {
    expect(() => assertAccess(as('customer'), 'staff')).toThrowError(expect.objectContaining({ status: 403 }));
    expect(() => assertAccess(as('sales_executive'), 'staff')).not.toThrow();
    expect(() => assertAccess(as('admin'), 'staff')).not.toThrow();
  });

  it('reserves superadmin routes for superadmin', () => {
    expect(() => assertAccess(as('admin'), 'superadmin')).toThrowError(expect.objectContaining({ status: 403 }));
    expect(() => assertAccess(as('superadmin'), 'superadmin')).not.toThrow();
  });
});
