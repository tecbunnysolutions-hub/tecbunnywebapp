import { NextRequest, NextResponse } from 'next/server';

import { checkServiceAreaAvailability } from "@tecbunny/core/service-area-availability";
import { logger } from '@tecbunny/core/logger';

export async function GET(request: NextRequest) {
  try {
    const pincode = new URL(request.url).searchParams.get('pincode');
    logger.info('service_availability.audit.requested', { hasPincode: Boolean(pincode) });
    const result = await checkServiceAreaAvailability(pincode);
    logger.info('service_availability.audit.completed', { pincode: result.pincode, available: result.available });
    return NextResponse.json({
      available: result.available,
      pincode: result.pincode,
      areaName: result.areaName,
      reason: result.reason,
    }, { status: result.pincode ? 200 : 400 });
  } catch (error) {
    logger.error('service_availability.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Service availability check failed' }, { status: 500 });
  }
}
