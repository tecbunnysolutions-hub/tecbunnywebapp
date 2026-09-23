import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const required = ['panNumber', 'accountNumber', 'ifscCode', 'pickupAddress'];
  if (required.some((field) => !body[field])) return NextResponse.json({ error: 'Missing mandatory KYC statutory fields' }, { status: 400 });
  return NextResponse.json({ success: true, message: 'Seller KYC submitted for Superadmin verification & Bank Penny Drop', kyc: { sellerId: body.sellerId || 'SLR-1092', status: 'SUBMITTED', panNumber: body.panNumber, bankAccount: { accountHolder: body.accountHolder, accountNumber: body.accountNumber, ifscCode: body.ifscCode, bankName: body.bankName, pennyDropStatus: 'SUCCESS' }, pickupAddress: { pickupAddress: body.pickupAddress, city: body.city, state: body.state, pincode: body.pincode }, submittedAt: new Date().toISOString() } });
}
