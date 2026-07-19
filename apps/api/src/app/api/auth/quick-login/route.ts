import { createClient } from '@tecbunny/database';
import { NextResponse } from 'next/server'
import { logger } from '@tecbunny/core';
import { z } from 'zod';



// export const dynamic = 'force-dynamic'

const quickLoginSchema = z.object({
  email: z.string().email(),
  redirect: z.string().min(1).default('/'),
});

function quickLoginEnabled() {
  return process.env.NODE_ENV !== 'production' && process.env.QUICK_LOGIN_ENABLED === 'true'
}

export async function POST(request: Request) {
  if (!quickLoginEnabled()) {
    return NextResponse.json({ error: 'Quick login disabled' }, { status: 403 })
  }

  const form = await request.formData()
  const parsed = quickLoginSchema.safeParse({
    email: form.get('email'),
    redirect: form.get('redirect') || '/',
  })

  if (!parsed.success) {
    logger.warn('quick_login.invalid_request', { issues: parsed.error.issues })
    return NextResponse.json({ error: 'Invalid quick login request' }, { status: 400 })
  }

  const { email, redirect } = parsed.data
  const password = process.env.QUICK_LOGIN_PASSWORD

  if (!password || password.length < 12) {
    return NextResponse.json({ error: 'Quick login password is not configured securely' }, { status: 503 })
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    logger.warn('quick_login.failed', { email, error: error.message })
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  // On success, redirect to the requested page. Cookies are set by SSR client.
  try {
    const redirectUrl = new URL(redirect, request.url)
    if (redirectUrl.origin !== new URL(request.url).origin) {
      return NextResponse.redirect(new URL('/', request.url), { status: 303 })
    }
    return NextResponse.redirect(redirectUrl, { status: 303 })
  } catch {
    return NextResponse.redirect(new URL('/', request.url), { status: 303 })
  }
}
