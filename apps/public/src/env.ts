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
  SESSION_SECRET: z.string().optional(),
});

const productionEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPERADMIN_SESSION_SECRET: z.string().min(32).optional(),
  SESSION_SECRET: z.string().min(32).optional(),
}).superRefine((value, context) => {
  if (!value.SUPERADMIN_SESSION_SECRET && !value.SESSION_SECRET) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'SUPERADMIN_SESSION_SECRET or SESSION_SECRET is required in production.',
      path: ['SUPERADMIN_SESSION_SECRET'],
    });
  }
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
  SESSION_SECRET: process.env.SESSION_SECRET,
});

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

if (process.env.NODE_ENV === 'production' && isServerRuntime) {
  const productionEnv = productionEnvSchema.safeParse(process.env);
  if (!productionEnv.success) {
    console.error('Missing or invalid production environment variables:', productionEnv.error.format());
    throw new Error('Invalid production environment variables');
  }

  const optionalSecurityEnv = productionOptionalSecuritySchema.safeParse(process.env);
  if (!optionalSecurityEnv.success) {
    console.warn('Optional production security environment is incomplete:', optionalSecurityEnv.error.format());
  }
}

export const env = _env.data;
