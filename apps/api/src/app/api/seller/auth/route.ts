import { NextResponse } from 'next/server';

/**
 * Seller onboarding is not implemented: nothing is persisted or verified.
 * Respond honestly instead of returning fabricated success data.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Seller onboarding is not available yet. Please contact TecBunny sales.' },
    { status: 501 },
  );
}
