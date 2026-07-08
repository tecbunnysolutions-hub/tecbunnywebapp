import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Proxies a SupabaseClient to intercept write operations and asynchronously log them
 * to the audit_logs table.
 */
export function withAuditLogging(client: SupabaseClient, userId: string = 'system'): SupabaseClient {
  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop === 'from') {
        return (table: string) => {
          const queryBuilder = target.from(table);
          
          // Prevent infinite loops when writing to the audit_logs table itself
          if (table === 'audit_logs') {
            return queryBuilder;
          }

          return new Proxy(queryBuilder, {
            get(qbTarget, qbProp) {
              const originalMethod = (qbTarget as any)[qbProp];
              
              if (typeof originalMethod === 'function' && ['insert', 'update', 'upsert', 'delete'].includes(qbProp as string)) {
                return (...args: any[]) => {
                  const payload = args[0] || null; // For delete, payload might be empty/null
                  const filterBuilder = originalMethod.apply(qbTarget, args);
                  
                  // Intercept the execution of the query (which happens when .then() is called)
                  return new Proxy(filterBuilder, {
                    get(fbTarget, fbProp) {
                      if (fbProp === 'then') {
                        return async (resolve: any, reject: any) => {
                          try {
                            const result = await fbTarget;
                            
                            // Only log if the database operation was successful
                            if (!result.error) {
                              // Fire and forget audit log insertion
                              target.from('audit_logs').insert({
                                user_id: userId,
                                table_name: table,
                                action: qbProp as string,
                                payload: payload,
                                created_at: new Date().toISOString()
                              }).then(({ error }) => {
                                if (error) {
                                  console.error('[AuditLog] Failed to write audit log:', error);
                                }
                              });
                            }
                            
                            resolve(result);
                          } catch (err) {
                            reject(err);
                          }
                        };
                      }
                      
                      const value = (fbTarget as any)[fbProp];
                      return typeof value === 'function' ? value.bind(fbTarget) : value;
                    }
                  });
                };
              }
              
              return typeof originalMethod === 'function' ? originalMethod.bind(qbTarget) : originalMethod;
            }
          });
        };
      }
      
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    }
  });
}
