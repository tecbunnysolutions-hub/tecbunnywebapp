/** Repository interfaces — define persistence contracts, implemented in @tecbunny/infra */

import type { Order, Lead, Product, ServiceTicket, BlogPost } from '../entities';

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
}

export interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  findByCustomerId(customerId: string, options?: PaginationOptions): Promise<{ items: Order[]; total: number }>;
  findByStatus(status: Order['status'], options?: PaginationOptions): Promise<Order[]>;
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  update(id: string, updates: Partial<Order>): Promise<Order | null>;
}

export interface LeadRepository {
  findById(id: string): Promise<Lead | null>;
  findAll(options?: PaginationOptions & { status?: Lead['status']; search?: string }): Promise<{ items: Lead[]; total: number }>;
  create(lead: Omit<Lead, 'id' | 'createdAt'>): Promise<Lead>;
  update(id: string, updates: Partial<Lead>): Promise<Lead | null>;
  assignTo(leadId: string, userId: string): Promise<void>;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findByHandle(handle: string): Promise<Product | null>;
  findAll(options?: PaginationOptions & { status?: Product['status']; search?: string; includeDeleted?: boolean }): Promise<{ items: Product[]; total: number }>;
  create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product>;
  update(id: string, updates: Partial<Product>): Promise<Product | null>;
  softDelete(id: string): Promise<void>;
  restore(id: string): Promise<void>;
}

export interface ServiceTicketRepository {
  findById(id: string): Promise<ServiceTicket | null>;
  findByEngineer(engineerId: string, options?: PaginationOptions): Promise<ServiceTicket[]>;
  findPending(options?: PaginationOptions): Promise<ServiceTicket[]>;
  create(ticket: Omit<ServiceTicket, 'id' | 'createdAt'>): Promise<ServiceTicket>;
  updateStatus(id: string, status: ServiceTicket['status']): Promise<ServiceTicket | null>;
  assign(ticketId: string, engineerId: string, scheduledDate: Date): Promise<void>;
}

export interface BlogRepository {
  findBySlug(slug: string): Promise<BlogPost | null>;
  findPublished(options?: PaginationOptions & { tag?: string }): Promise<{ items: BlogPost[]; total: number }>;
  create(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<BlogPost>;
  update(slug: string, updates: Partial<BlogPost>): Promise<BlogPost | null>;
  delete(slug: string): Promise<void>;
}
