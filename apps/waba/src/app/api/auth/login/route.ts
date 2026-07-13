import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { password, isSuperadmin } = await req.json();

    if (isSuperadmin) {
      const expectedUserId = process.env.SUPERADMIN_USER_ID;
      const expectedPassword = process.env.SUPERADMIN_PASSWORD;

      if (expectedUserId && expectedPassword && password === expectedPassword) {
        const response = NextResponse.json({ success: true, user: { id: 'superadmin-id', email: 'superadmin' } });
        
        response.cookies.set({
          name: 'waba_agent_id',
          value: 'superadmin-id',
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        return response;
      }
      return NextResponse.json({ error: 'Invalid superadmin credentials' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Staff should use Supabase auth directly' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Login error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
