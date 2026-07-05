'use client';

import { useContext } from 'react';
import { AuthContext } from "@tecbunny/core/context/AuthProvider";

export function usePermissions() {
  const auth = useContext(AuthContext);
  
  const permissions: string[] = auth?.user?.permissions || [];
  const role = auth?.user?.role;

  const hasPermission = (requiredPermission: string): boolean => {
    // Global override for superadmin
    if (role === 'superadmin') return true;

    const [reqResource, reqAction] = requiredPermission.split(':');
    
    return permissions.some(p => {
      if (p === requiredPermission) return true;
      const [resource, action] = p.split(':');
      // Support wildcards like 'users:*' or 'users:all'
      return resource === reqResource && (action === '*' || action === 'all');
    });
  };

  return { hasPermission, permissions, role, loading: auth?.loading };
}
