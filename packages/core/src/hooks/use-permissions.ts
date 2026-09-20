'use client';

import { Permission, UserRole, hasPermission, isAtLeast } from "../roles";
import { useAuth } from "../hooks";

interface PermissionsApi {
  role: UserRole;
  is: (r: UserRole) => boolean;
  atLeast: (r: UserRole) => boolean;
  can: (perm: Permission) => boolean;
}

export function usePermissions(): PermissionsApi {
  const { user } = useAuth();
  const role = (user?.role || 'customer') as UserRole;
  return {
    role,
    is: (r) => role === r,
    atLeast: (r) => isAtLeast(role, r),
    can: (perm) => hasPermission(role, perm)
  };
}
