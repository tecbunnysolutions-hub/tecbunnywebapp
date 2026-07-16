import { createServiceClient, isSupabaseServiceConfigured } from '@tecbunny/database';
import { logger } from '@tecbunny/core';

export type ServiceAreaAvailability = {
  available: boolean;
  pincode: string | null;
  areaId: string | null;
  areaName: string | null;
  reason: string;
};

function normalizePincode(value: unknown): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const match = String(value).match(/(?:^|\D)([1-9][0-9]{5})(?:\D|$)/);
  return match?.[1] ?? null;
}

function readArea(relation: unknown): Record<string, unknown> {
  if (Array.isArray(relation)) return relation[0] || {};
  return relation && typeof relation === 'object' ? relation as Record<string, unknown> : {};
}

export async function checkServiceAreaAvailability(value: unknown): Promise<ServiceAreaAvailability> {
  const pincode = normalizePincode(value);
  if (!pincode) {
    return {
      available: false,
      pincode: null,
      areaId: null,
      areaName: null,
      reason: 'A valid six-digit service pincode is required.',
    };
  }

  if (!isSupabaseServiceConfigured) {
    return {
      available: false,
      pincode,
      areaId: null,
      areaName: null,
      reason: 'Service-area validation is temporarily unavailable. Please contact support@tecbunny.com.',
    };
  }

  const { data, error } = await createServiceClient()
    .from('area_pincodes')
    .select('area_id, is_active, areas(id, name, is_active, services_enabled)')
    .eq('pincode', pincode)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    logger.error('service_area_lookup_failed', { pincode, error: error.message });
    return {
      available: false,
      pincode,
      areaId: null,
      areaName: null,
      reason: 'Service-area validation is temporarily unavailable. Please contact support@tecbunny.com.',
    };
  }

  const area = readArea(data?.areas);
  const areaId = typeof area.id === 'string' ? area.id : data?.area_id || null;
  const areaName = typeof area.name === 'string' ? area.name : null;
  const available = Boolean(data?.is_active && area.is_active && area.services_enabled);

  return {
    available,
    pincode,
    areaId,
    areaName,
    reason: available
      ? 'Service is available in this area.'
      : `TecBunny service orders are not currently available for pincode ${pincode}.`,
  };
}
