import { getUserDb } from '../db/client';
import { CustomerWorkspaceData, Order, ServiceTicket, Conversation, Message } from '../types';

export class WorkspaceService {
  /**
   * Retrieves a unified workspace snapshot for a customer by their phone number or customer ID.
   */
  async getWorkspaceData(params: { customerId?: string; phone?: string }): Promise<CustomerWorkspaceData> {
    const { customerId, phone } = params;
    
    if (!customerId && !phone) {
      throw new Error('Must provide either customerId or phone to fetch workspace data.');
    }

    const db = await getUserDb();
    
    // Fetch Orders
    let ordersQuery = db.from('orders').select('*').order('created_at', { ascending: false });
    if (customerId && phone) {
      ordersQuery = ordersQuery.or(`customer_id.eq.${customerId},customer_phone.eq.${phone}`);
    } else if (customerId) {
      ordersQuery = ordersQuery.eq('customer_id', customerId);
    } else if (phone) {
      ordersQuery = ordersQuery.eq('customer_phone', phone);
    }
    const { data: orders } = await ordersQuery;

    // Fetch Service Tickets
    let ticketsQuery = db.from('service_tickets').select('*').order('created_at', { ascending: false });
    if (customerId && phone) {
      ticketsQuery = ticketsQuery.or(`customer_id.eq.${customerId},customer_phone.eq.${phone}`);
    } else if (customerId) {
      ticketsQuery = ticketsQuery.eq('customer_id', customerId);
    } else if (phone) {
      ticketsQuery = ticketsQuery.eq('customer_phone', phone);
    }
    const { data: tickets } = await ticketsQuery;

    // Fetch Conversations (by phone only)
    let conversations: Conversation[] = [];
    if (phone) {
      const { data } = await db.from('Conversation')
        .select('*')
        .eq('sender_number', phone)
        .order('last_interaction_timestamp', { ascending: false });
      if (data) conversations = data;
    }

    // Fetch Messages (by phone only)
    let messages: Message[] = [];
    if (phone) {
      const { data } = await db.from('Message')
        .select('*')
        .eq('sender_number', phone)
        .order('timestamp', { ascending: true });
      if (data) messages = data;
    }

    return {
      customer_id: customerId,
      phone: phone,
      orders: (orders || []) as Order[],
      service_tickets: (tickets || []) as ServiceTicket[],
      conversations: conversations as Conversation[],
      messages: messages as Message[],
    };
  }
}
