'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

import { UnifiedPanelShell } from '@/components/mgmt/UnifiedPanelShell';
import { useAuth } from '@/lib/hooks';
import { isAtLeast } from '@/lib/roles';
import { logger } from '@/lib/logger';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const redirectRef = React.useRef(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    // Prevent running auth checks while loading or already redirecting
    if (loading || redirectRef.current) return;

    try {
      if (!user) {
        redirectRef.current = true;
        router.replace('/staff/login');
        return;
      }
      
      const userRole = user.role || 'customer';
      if (!isAtLeast(userRole, 'admin')) {
        redirectRef.current = true;
        router.replace('/');
      }
    } catch (error) {
      logger.error('AdminLayoutClient routing evaluation failure', { error });
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      logger.error('AdminLayoutClient logout failure', { error });
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'We encountered a problem signing you out. Please try again.',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const authorized = !!user && isAtLeast(user.role || 'customer', 'admin');

  if (redirectRef.current) {
    // Use dynamic viewport height (100dvh) for seamless mobile browser bar integration.
    // Overflow hidden prevents accidental horizontal scrolling on mobile viewports.
    return (
      <div 
        className="flex min-h-[100dvh] w-full items-center justify-center overflow-hidden" 
        aria-live="polite" 
        aria-busy="true"
      >
        <span className="sr-only">Redirecting securely...</span>
      </div>
    );
  }

  return (
    <UnifiedPanelShell
      role="admin"
      user={user}
      loading={loading || isLoggingOut}
      authorized={authorized}
      mainId="admin-main"
      workspaceLabel="Admin Workspace"
      statusLabel="Store operations online"
      onLogout={handleLogout}
    >
      {children}
    </UnifiedPanelShell>
  );
}
