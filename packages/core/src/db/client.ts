import { SupabaseClient } from '@supabase/supabase-js';
import { requireSupabaseServiceEnv } from '../supabase/env';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createSupabaseClient as createServerClient } from '../supabase/server';
import { DatabaseError } from './errors';
import { withAuditLogging } from '../security/audit-middleware';

export class DbClient {
  constructor(private client: SupabaseClient) {}

  /**
   * Direct access to the underlying Supabase Client if needed for edge cases
   */
  get supabase() { return this.client; }

  // Expose commonly used query builders
  get from() { return this.client.from.bind(this.client); }
  get rpc() { return this.client.rpc.bind(this.client); }
  get storage() { return this.client.storage; }
  get auth() { return this.client.auth; }

  /**
   * Standardized execute method to unwrap Supabase { data, error } 
   * and throw typed DatabaseError on failure.
   */
  async execute<T>(query: PromiseLike<{ data: T; error: any }>): Promise<T> {
    const { data, error } = await query;
    if (error) {
      throw new DatabaseError(
        error.message,
        error.code,
        error.details,
        error.hint
      );
    }
    return data as T;
  }

  /**
   * Execute but returns null instead of throwing when not found or gracefully ignoring specific schema errors
   */
  async executeMaybe<T>(query: PromiseLike<{ data: T; error: any }>, ignoreSchemaErrors = false): Promise<T | null> {
    const { data, error } = await query;
    if (error) {
      const dbError = new DatabaseError(
        error.message,
        error.code,
        error.details,
        error.hint
      );
      if (ignoreSchemaErrors && dbError.isSchemaError()) {
        return null;
      }
      throw dbError;
    }
    return data;
  }
}

let adminDbInstance: DbClient | null = null;

/**
 * Returns a singleton DbClient using the Service Role key (bypasses RLS).
 * Shared across the Node process.
 */
export function getAdminDb(): DbClient {
  if (!adminDbInstance) {
    const { url, serviceKey } = requireSupabaseServiceEnv();
    const supabase = createSupabaseClient(url, serviceKey);
    const auditedSupabase = withAuditLogging(supabase, 'system-admin');
    adminDbInstance = new DbClient(auditedSupabase);
  }
  return adminDbInstance;
}

/**
 * Creates a DbClient bound to the current user's SSR cookies.
 * This MUST be called dynamically per-request, not cached globally.
 */
export async function getUserDb(): Promise<DbClient> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const auditedSupabase = withAuditLogging(supabase, user?.id || 'anonymous');
  return new DbClient(auditedSupabase);
}
