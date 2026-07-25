import { NextResponse } from 'next/server';
import { validateGSTIN } from '@tecbunny/core';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { businessName, ownerName, email, phone, gstNumber, password } = body;

    if (!businessName || !email || !phone || !gstNumber) {
      return NextResponse.json(
        { error: 'Missing required seller registration fields' },
        { status: 400 }
      );
    }

    const gstVal = validateGSTIN(gstNumber);
    if (!gstVal.isValidFormat) {
      return NextResponse.json(
        { error: 'Invalid GSTIN structure' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Seller account draft created. Mobile OTP verification required.',
      seller: {
        id: 'SLR-' + Math.floor(1000 + Math.random() * 9000),
        businessName,
        ownerName,
        email,
        phone,
        gstNumber,
        status: 'PENDING_VERIFICATION',
        kycStatus: 'DRAFT',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
