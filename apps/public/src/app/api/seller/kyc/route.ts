import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sellerId, panNumber, accountHolder, accountNumber, ifscCode, bankName, pickupAddress, city, state, pincode } = body;

    if (!panNumber || !accountNumber || !ifscCode || !pickupAddress) {
      return NextResponse.json(
        { error: 'Missing mandatory KYC statutory fields' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Seller KYC submitted for Superadmin verification & Bank Penny Drop',
      kyc: {
        sellerId: sellerId || 'SLR-1092',
        status: 'SUBMITTED',
        panNumber,
        bankAccount: {
          accountHolder,
          accountNumber,
          ifscCode,
          bankName,
          pennyDropStatus: 'SUCCESS',
        },
        pickupAddress: {
          pickupAddress,
          city,
          state,
          pincode,
        },
        submittedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
