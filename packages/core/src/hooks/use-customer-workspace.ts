"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@tecbunny/database';
import { CustomerWorkspaceData, Order, ServiceTicket, Conversation, Message } from '../types';

export function useCustomerWorkspace(customerId?: string, phone?: string) {
  const [data, setData] = useState<CustomerWorkspaceData>({
    customer_id: customerId,
    phone: phone,
    orders: [],
    service_tickets: [],
    conversations: [],
    messages: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInitialData = useCallback(async () => {
    if (!customerId && !phone) return;
    
    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      // Build queries
      let ordersQuery = supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (customerId && phone) ordersQuery = ordersQuery.or(`customer_id.eq.${customerId},customer_phone.eq.${phone}`);
      else if (customerId) ordersQuery = ordersQuery.eq('customer_id', customerId);
      else if (phone) ordersQuery = ordersQuery.eq('customer_phone', phone);

      let ticketsQuery = supabase.from('service_tickets').select('*').order('created_at', { ascending: false });
      if (customerId && phone) ticketsQuery = ticketsQuery.or(`customer_id.eq.${customerId},customer_phone.eq.${phone}`);
      else if (customerId) ticketsQuery = ticketsQuery.eq('customer_id', customerId);
      else if (phone) ticketsQuery = ticketsQuery.eq('customer_phone', phone);

      // Execute queries
      const [ordersRes, ticketsRes] = await Promise.all([ordersQuery, ticketsQuery]);

      let conversationsRes = { data: [] };
      let messagesRes = { data: [] };

      if (phone) {
        conversationsRes = await supabase.from('Conversation').select('*').eq('sender_number', phone).order('last_interaction_timestamp', { ascending: false }) as any;
        messagesRes = await supabase.from('Message').select('*').eq('sender_number', phone).order('timestamp', { ascending: true }) as any;
      }

      setData({
        customer_id: customerId,
        phone: phone,
        orders: (ordersRes.data || []) as Order[],
        service_tickets: (ticketsRes.data || []) as ServiceTicket[],
        conversations: (conversationsRes.data || []) as Conversation[],
        messages: (messagesRes.data || []) as Message[],
      });
    } catch (err) {
      console.error('Error fetching workspace data:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [customerId, phone]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Setup Supabase Realtime Subscription
  useEffect(() => {
    if (!customerId && !phone) return;
    
    const supabase = createClient();
    const channelId = `workspace-${customerId || phone}`;
    
    const channel = supabase.channel(channelId)
      // Listen to Orders
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload: any) => {
        if ((customerId && payload.new && (payload.new as any).customer_id === customerId) ||
            (phone && payload.new && (payload.new as any).customer_phone === phone)) {
          fetchInitialData(); // Or optimistically update the state
        }
      })
      // Listen to Tickets
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_tickets' }, (payload: any) => {
        if ((customerId && payload.new && (payload.new as any).customer_id === customerId) ||
            (phone && payload.new && (payload.new as any).customer_phone === phone)) {
          fetchInitialData();
        }
      })
      // Listen to Conversations
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Conversation' }, (payload: any) => {
        if (phone && payload.new && (payload.new as any).sender_number === phone) {
          fetchInitialData();
        }
      })
      // Listen to Messages
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Message' }, (payload: any) => {
        if (phone && payload.new && (payload.new as any).sender_number === phone) {
          fetchInitialData();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId, phone, fetchInitialData]);

  return { data, loading, error, refetch: fetchInitialData };
}
