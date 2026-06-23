import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().refine((val) => {
    if (!val) return true;
    try { new URL(val); return true; } catch { return false; }
  }, { message: "Invalid URL" }),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
});

const productionEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPERADMIN_SESSION_SECRET: z.string().min(32),
});

const productionBrowserEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const productionOptionalSecuritySchema = z.object({
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
}).superRefine((value, context) => {
  const hasSiteKey = Boolean(value.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  const hasSecretKey = Boolean(value.TURNSTILE_SECRET_KEY);

  if (hasSiteKey !== hasSecretKey) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Turnstile requires both NEXT_PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY when enabled.',
      path: hasSiteKey ? ['TURNSTILE_SECRET_KEY'] : ['NEXT_PUBLIC_TURNSTILE_SITE_KEY'],
    });
  }
});

const isServerRuntime = typeof window === 'undefined';

// Validate the current environment
const _env = envSchema.safeParse({
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY,
});

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

if (process.env.NODE_ENV === 'production') {
  const productionEnv = isServerRuntime
    ? productionEnvSchema.safeParse(process.env)
    : productionBrowserEnvSchema.safeParse(process.env);

  if (!productionEnv.success) {
    console.error('Missing or invalid production environment variables:', productionEnv.error.format());
    throw new Error('Invalid production environment variables');
  }

  if (isServerRuntime) {
    const optionalSecurityEnv = productionOptionalSecuritySchema.safeParse(process.env);
    if (!optionalSecurityEnv.success) {
      console.warn('Optional production security environment is incomplete:', optionalSecurityEnv.error.format());
    }
  }
}

export const env = _env.data;
