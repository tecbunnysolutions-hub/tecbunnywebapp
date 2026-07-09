import { getUserDb } from '../db/client';
import { CustomerWorkspaceData, Order, ServiceTicket, Conversation, Message } from '../types';

interface CacheEntry {
  data: CustomerWorkspaceData;
  expiresAt: number;
}

const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export class CustomerService {
  private static cache = new Map<string, CacheEntry>();

  /**
   * Retrieves a unified workspace snapshot for a customer by their phone number or customer ID.
   * This query is optimized with Promise.all and cached in-memory for sub-millisecond retrieval.
   */
  static async getCustomerContext(params: { customerId?: string; phone?: string; dbClient?: any }): Promise<CustomerWorkspaceData> {
    const { customerId, phone, dbClient } = params;
    
    if (!customerId && !phone) {
      throw new Error('Must provide either customerId or phone to fetch workspace data.');
    }

    const cacheKey = `${customerId || ''}:${phone || ''}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const db = dbClient || await getUserDb();
    
    const ordersPromise = (async () => {
      let query = db.from('orders').select('*').order('created_at', { ascending: false });
      if (customerId && phone) query = query.or(`customer_id.eq.${customerId},customer_phone.eq.${phone}`);
      else if (customerId) query = query.eq('customer_id', customerId);
      else if (phone) query = query.eq('customer_phone', phone);
      
      const { data } = await query.limit(5); // Only latest 5 for context
      return (data || []) as Order[];
    })();

    const ticketsPromise = (async () => {
      let query = db.from('service_tickets').select('*').order('created_at', { ascending: false });
      if (customerId && phone) query = query.or(`customer_id.eq.${customerId},customer_phone.eq.${phone}`);
      else if (customerId) query = query.eq('customer_id', customerId);
      else if (phone) query = query.eq('customer_phone', phone);
      
      const { data } = await query.limit(5); // Only latest 5 for context
      return (data || []) as ServiceTicket[];
    })();

    const conversationsPromise = (async () => {
      if (!phone) return [];
      const { data } = await db.from('Conversation')
        .select('*')
        .eq('sender_number', phone)
        .order('last_interaction_timestamp', { ascending: false });
      return (data || []) as Conversation[];
    })();

    const messagesPromise = (async () => {
      if (!phone) return [];
      const { data } = await db.from('Message')
        .select('*')
        .eq('sender_number', phone)
        .order('timestamp', { ascending: false })
        .limit(10); // Fetch latest 10 messages for deeper context
      
      return ((data || []) as Message[]).reverse(); // Return in chronological order
    })();

    // Execute concurrently for minimum latency
    const [orders, service_tickets, conversations, messages] = await Promise.all([
      ordersPromise, 
      ticketsPromise, 
      conversationsPromise, 
      messagesPromise
    ]);

    const result: CustomerWorkspaceData = {
      customer_id: customerId,
      phone: phone,
      orders,
      service_tickets,
      conversations,
      messages,
    };

    this.cache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    // Simple cache cleanup
    if (this.cache.size > 1000) {
      const now = Date.now();
      for (const [k, v] of this.cache.entries()) {
        if (v.expiresAt < now) this.cache.delete(k);
      }
    }

    return result;
  }
}
