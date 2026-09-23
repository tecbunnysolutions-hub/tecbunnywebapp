import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@tecbunny/database';
import { z } from 'zod';

const profileUpdate = z.object({
  name: z.string().trim().min(2).max(120),
  mobile: z.string().trim().min(10).max(24),
  address: z.string().trim().max(500).optional().or(z.literal('')),
});

/** Updates only the authenticated user's editable customer profile fields. */
export async function PATCH(request: NextRequest) {
  const parsed = profileUpdate.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid profile data' }, { status: 400 });
  const supabase = await createServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  const { data, error } = await supabase
    .from('profiles')
    .update({ name: parsed.data.name, mobile: parsed.data.mobile, address: parsed.data.address || null })
    .eq('id', user.id)
    .select()
    .single();
  if (error || !data) return NextResponse.json({ error: 'Could not update your profile.' }, { status: 500 });
  return NextResponse.json({ data });
}
