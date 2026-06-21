'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface RequirePermissionProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A wrapper component that conditionally renders its children based on the 
 * current user's dynamic permissions injected from their JWT.
 */
export function RequirePermission({ 
  permission, 
  children, 
  fallback = null 
}: RequirePermissionProps) {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    // Optionally return a spinner or just null while auth state is resolving
    return null; 
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
