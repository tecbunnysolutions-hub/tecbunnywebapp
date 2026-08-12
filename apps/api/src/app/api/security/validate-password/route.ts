import { NextRequest, NextResponse } from 'next/server';

// Special-character set intentionally kept broad to match common password-policy patterns.
const SPECIAL_CHAR_RE = /[!@#$%^&*()\-_=+\[\]{}|;:'",.<>?/\\`~]/;

function validatePasswordStrength(password: string) {
  const checks = {
    minLength:    password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasDigit:     /\d/.test(password),
    hasSpecial:   SPECIAL_CHAR_RE.test(password),
    notTooLong:   password.length <= 128,
  };

  const criticalPassed = checks.minLength && checks.notTooLong;
  const strengthScore = Object.values(checks).filter(Boolean).length;
  const passed = criticalPassed && strengthScore >= 4;

  return {
    passed,
    strength: strengthScore >= 6 ? 'strong' : strengthScore >= 4 ? 'medium' : 'weak',
    checks,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, validation: validatePasswordStrength(password) });
  } catch {
    return NextResponse.json({ error: 'Failed to validate password' }, { status: 500 });
  }
}
