import { getAdminClient } from './admin';

export async function createSecureServiceClient(requiredPermission?: string) {
  const { getServerAuthState } = await import('@tecbunny/core/server-role-guard');
  const { hasPermission } = await import('@tecbunny/core/roles');
  
  const authState = await getServerAuthState();
  
  if (!authState.session) {
    throw new Error('Unauthorized: No active session to use Secure Service Client');
  }

  if (requiredPermission && !hasPermission(authState.role, requiredPermission)) {
    throw new Error(`Forbidden: Insufficient permission (${requiredPermission}) for Secure Service Client`);
  }

  const baseClient = getAdminClient();

  return new Proxy(baseClient, {
    get(target, prop, receiver) {
      if (prop === 'from') {
        return (table: string) => {
          return target.from(table);
        };
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

export { createSecureServiceClient as getSecureServiceClient };
