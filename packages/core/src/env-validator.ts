import { z } from 'zod';

/**
 * Validates required environment variables at server startup.
 * Call `validateEnv()` in instrumentation.ts for each app.
 *
 * Throws a descriptive error early so missing config is caught at boot,
 * not when the first request hits a broken code path.
 */

const BaseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(30),
});

const ServerEnvSchema = BaseEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(30).optional(),
});

const PaymentEnvSchema = ServerEnvSchema.extend({
  PAYU_MERCHANT_KEY: z.string().min(4),
  PAYU_MERCHANT_SALT: z.string().min(4),
});

const RedisEnvSchema = z.object({
  REDIS_URL: z.string().url().optional(),
});

export type EnvProfile = 'base' | 'server' | 'payment' | 'redis' | 'all';

type SchemaMap = {
  base: typeof BaseEnvSchema;
  server: typeof ServerEnvSchema;
  payment: typeof PaymentEnvSchema;
  redis: typeof RedisEnvSchema;
};

const SCHEMAS: Partial<SchemaMap> = {
  base:    BaseEnvSchema,
  server:  ServerEnvSchema,
  payment: PaymentEnvSchema,
  redis:   RedisEnvSchema,
};

/**
 * Validate environment variables for the given profile.
 * @param profile - which set of vars to check (defaults to 'server')
 * @throws Error with a clear message listing all missing/invalid vars
 */
export function validateEnv(profile: EnvProfile = 'server'): void {
  const schemas = profile === 'all'
    ? Object.values(SCHEMAS)
    : [SCHEMAS[profile as keyof SchemaMap]].filter(Boolean);

  const allErrors: string[] = [];

  for (const schema of schemas) {
    if (!schema) continue;
    const result = (schema as z.ZodObject<any>).safeParse(process.env);
    if (!result.success) {
      result.error.issues.forEach(issue => {
        allErrors.push(`  • ${issue.path.join('.')}: ${issue.message}`);
      });
    }
  }

  if (allErrors.length > 0) {
    const message = [
      `[env-validator] Missing or invalid environment variables (profile: ${profile}):`,
      ...allErrors,
      '',
      'Check your .env.local / deployment secrets and restart.',
    ].join('\n');

    throw new Error(message);
  }
}

/**
 * Non-throwing version: returns validation result instead of throwing.
 */
export function checkEnv(profile: EnvProfile = 'server'): { valid: boolean; errors: string[] } {
  try {
    validateEnv(profile);
    return { valid: true, errors: [] };
  } catch (err: any) {
    const lines: string[] = (err.message as string)
      .split('\n')
      .filter(l => l.trim().startsWith('•'))
      .map(l => l.trim().slice(2).trim());
    return { valid: false, errors: lines };
  }
}
