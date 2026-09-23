import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { validateGSTIN } from '@tecbunny/core';

/** Temporary seller-onboarding contract. Persistence belongs in the API layer. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  const businessName = typeof body.businessName === 'string' ? body.businessName : '';
  const email = typeof body.email === 'string' ? body.email : '';
  const phone = typeof body.phone === 'string' ? body.phone : '';
  const gstNumber = typeof body.gstNumber === 'string' ? body.gstNumber : '';
  if (!businessName || !email || !phone || !gstNumber) return NextResponse.json({ error: 'Missing required seller registration fields' }, { status: 400 });
  if (!validateGSTIN(gstNumber).isValidFormat) return NextResponse.json({ error: 'Invalid GSTIN structure' }, { status: 400 });
  return NextResponse.json({ success: true, message: 'Seller account draft created. Mobile OTP verification required.', seller: { id: `SLR-${randomUUID()}`, businessName, ownerName: body.ownerName, email, phone, gstNumber, status: 'PENDING_VERIFICATION', kycStatus: 'DRAFT' } });
}
