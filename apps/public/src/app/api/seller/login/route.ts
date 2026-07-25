import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Seller authentication successful',
      token: 'jwt-seller-token-mock',
      seller: {
        id: 'SLR-1092',
        businessName: 'Apex Security Solutions Pvt Ltd',
        email,
        status: 'APPROVED',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
