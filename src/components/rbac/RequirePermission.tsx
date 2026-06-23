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
    return (
      <div className="flex items-center justify-center min-h-[50vh] w-full text-muted-foreground animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm font-medium">Verifying Permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
