import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }
  if (typeof body.email !== 'string' || typeof body.password !== 'string' || !body.email || !body.password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  return NextResponse.json({ success: true, message: 'Seller authentication successful', token: 'jwt-seller-token-mock', seller: { id: 'SLR-1092', businessName: 'Apex Security Solutions Pvt Ltd', email: body.email, status: 'APPROVED' } });
}
