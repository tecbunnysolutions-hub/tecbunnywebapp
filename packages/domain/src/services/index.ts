/** Domain service contracts — pure business logic, no framework dependencies */

import type { Order, Lead, ServiceTicket } from '../entities';
import type { OrderRepository, LeadRepository, ServiceTicketRepository } from '../repositories';

export interface LeadScoringService {
  computeScore(lead: Pick<Lead, 'phone' | 'email' | 'status' | 'notes'>): number;
  classifyHeat(score: number): 'COLD' | 'WARM' | 'HOT';
}

export interface OrderFulfillmentService {
  /** Transition an order to the next valid status */
  transition(order: Order, to: Order['status']): Promise<Order>;
  /** Check if a status transition is allowed */
  canTransition(from: Order['status'], to: Order['status']): boolean;
  /** Cancel an order and trigger refund if paid */
  cancel(orderId: string, reason: string): Promise<void>;
}

export interface TicketDispatchService {
  /** Auto-assign an unassigned ticket to the nearest available engineer */
  autoAssign(ticketId: string): Promise<ServiceTicket | null>;
  /** Escalate overdue tickets */
  escalateOverdue(thresholdHours?: number): Promise<number>;
}

export interface ReferralService {
  /** Validate code and return referrer details */
  validateCode(code: string): Promise<{ valid: boolean; referrerId?: string }>;
  /** Mark a pending claim as fulfilled after first order */
  fulfillClaim(refereeId: string, orderId: string): Promise<void>;
}
