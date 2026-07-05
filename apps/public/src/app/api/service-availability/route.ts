import { NextRequest, NextResponse } from 'next/server';

import { checkServiceAreaAvailability } from '@/lib/service-area-availability';

export async function GET(request: NextRequest) {
  const pincode = new URL(request.url).searchParams.get('pincode');
  const result = await checkServiceAreaAvailability(pincode);
  return NextResponse.json({
    available: result.available,
    pincode: result.pincode,
    areaName: result.areaName,
    reason: result.reason,
  }, { status: result.pincode ? 200 : 400 });
}
