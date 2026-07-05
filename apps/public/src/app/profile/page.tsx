'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { User as SupabaseUser } from '@supabase/supabase-js';

import UserProfile from '@/components/profile/UserProfile';
import { useAuth } from "@tecbunny/core/hooks";
import { logger } from "@tecbunny/core/logger";

export default function ProfilePage() {
  const { supabase, loading: authLoading, user: authUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [salesAgentData, setSalesAgentData] = React.useState<any>(null);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [serviceTickets, setServiceTickets] = React.useState<any[]>([]);
  const [quotes, setQuotes] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    const loadProfile = async () => {
      try {
        if (!authUser) {
          router.replace('/auth/signin');
          return;
        }

        if (cancelled) return;
        setUser(authUser);

        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        const { data: salesAgent } = await supabase
          .from('sales_agents')
          .select('*')
          .eq('user_id', authUser.id)
          .maybeSingle();

        const { data: recentOrders } = await supabase
          .from('orders')
          .select('id, status, total, total_amount, created_at, type')
          .eq('customer_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(3);

        const { data: recentTickets } = await supabase
          .from('service_tickets')
          .select('id, issue_description, status, priority, created_at')
          .eq('customer_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(5);

        const { data: quoteData } = await supabase
          .from('quotes')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false });

        const fallbackProfile = profileData ?? {
          id: authUser.id,
          name: authUser.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email,
          mobile: authUser.mobile || '',
          role: authUser.role || 'customer'
        };

        if (cancelled) return;
        setProfile(fallbackProfile);
        setSalesAgentData(salesAgent ?? null);
        setOrders(recentOrders ?? []);
        setServiceTickets(recentTickets ?? []);
        setQuotes(quoteData ?? []);
      } catch (error) {
        logger.error('profile.page_load_failed', { error });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [authLoading, supabase, router, authUser]);

  if (loading || !user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <UserProfile
      user={user}
      profile={profile}
      salesAgentData={salesAgentData}
      orders={orders}
      serviceTickets={serviceTickets}
      quotes={quotes}
    />
  );
}
