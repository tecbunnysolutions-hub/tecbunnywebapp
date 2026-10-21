import { z } from 'zod';

/** Canonical name -> deprecated aliases that are still read (with a name-only warning). */
export const ENV_ALIASES = {
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: ['WEBHOOK_VERIFY_TOKEN', 'WHATSAPP_VERIFY_TOKEN', 'META_WHATSAPP_VERIFY_TOKEN'],
  META_WHATSAPP_ACCESS_TOKEN: ['WHATSAPP_TOKEN', 'META_ACCESS_TOKEN'],
  PAYU_ENVIRONMENT: ['PAYU_GATEWAY_ENV', 'PAYU_MODE'],
  INTERNAL_API_TOKEN: ['INTERNAL_API_KEY'],
  SUPABASE_SECRET_KEY: ['SUPABASE_SERVICE_ROLE_KEY'],
} as const satisfies Record<string, readonly string[]>;

type CanonicalName = keyof typeof ENV_ALIASES;
type Source = Record<string, string | undefined>;

const warned = new Set<string>();

const present = (value: string | undefined) => (value && value.trim() ? value.trim() : undefined);

/** Resolves canonical names first, then deprecated aliases. Only the alias NAME is ever logged. */
export function normalizeEnv(source: Source, warn: (message: string) => void = (m) => console.warn(m)): Source {
  const out: Source = { ...source };
  for (const [canonical, aliases] of Object.entries(ENV_ALIASES) as [CanonicalName, readonly string[]][]) {
    if (present(out[canonical])) continue;
    for (const alias of aliases) {
      const value = present(source[alias]);
      if (!value) continue;
      out[canonical] = value;
      if (!warned.has(alias)) {
        warned.add(alias);
        warn(`[env] ${alias} is deprecated; use ${canonical}`);
      }
      break;
    }
  }
  return out;
}

const optional = z.string().trim().min(1).optional();
const url = z.string().trim().url();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  NEXT_PUBLIC_SUPABASE_URL: url,
  SUPABASE_SECRET_KEY: z.string().trim().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optional,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optional,
  SUPABASE_ANON_KEY: optional,

  INTERNAL_API_TOKEN: optional,
  CRON_SECRET: optional,
  SUPERADMIN_PASSWORD_HASH: optional,

  SMTP_HOST: optional,
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: optional,
  SMTP_PASS: optional,
  SMTP_FROM_EMAIL: optional,

  PAYU_ENVIRONMENT: z.enum(['test', 'production', 'live', 'sandbox']).optional(),
  CASHFREE_ENV: z.enum(['sandbox', 'production', 'test', 'live']).optional(),

  META_WHATSAPP_ACCESS_TOKEN: optional,
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: optional,
  META_APP_SECRET: optional,
  AI_SYSTEM_PROMPT: optional,
});

export type ApiEnv = z.infer<typeof EnvSchema>;

export class EnvValidationError extends Error {
  constructor(readonly variables: string[]) {
    super(`Invalid or missing environment variables: ${variables.join(', ')}`);
    this.name = 'EnvValidationError';
  }
}

/** Validates and returns the typed environment. Throws EnvValidationError naming the variables (never their values). */
export function loadEnv(source: Source = process.env, warn?: (message: string) => void): ApiEnv {
  const parsed = EnvSchema.safeParse(normalizeEnv(source, warn));
  if (!parsed.success) {
    throw new EnvValidationError([...new Set(parsed.error.issues.map((issue) => String(issue.path[0] ?? 'unknown')))]);
  }
  return parsed.data;
}

let cached: ApiEnv | undefined;

export function getEnv(): ApiEnv {
  cached ??= loadEnv();
  return cached;
}

/** Fail-fast hook for server start-up. Skipped for builds and non-production runs. */
export function assertEnvOnStartup(source: Source = process.env): void {
  if (source.NODE_ENV !== 'production' || source.NEXT_PHASE === 'phase-production-build') return;
  getEnv();
}
