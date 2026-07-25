import { z } from 'zod';

export const TicketStatusEnum = z.enum([
  'NEW',
  'ASSIGNED',
  'ACCEPTED',
  'TRAVELLING',
  'ON_SITE',
  'WORK_STARTED',
  'WAITING_PARTS',
  'TESTING',
  'COMPLETED',
  'CUSTOMER_APPROVED',
  'CLOSED',
]);

export const TicketPriorityEnum = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);

export const ServiceTicketSchema = z.object({
  id: z.string().uuid(),
  ticket_number: z.string(),
  customer_id: z.string().uuid(),
  project_id: z.string().uuid().optional(),
  product_id: z.string().uuid().optional(),
  serial_number: z.string().optional(),
  complaint_description: z.string(),
  priority: TicketPriorityEnum.default('MEDIUM'),
  location: z.string(),
  assigned_engineer_id: z.string().uuid().optional(),
  status: TicketStatusEnum.default('NEW'),
  warranty_status: z.enum(['IN_WARRANTY', 'OUT_OF_WARRANTY', 'AMC_COVERED']).default('IN_WARRANTY'),
  created_at: z.string().optional(),
});

export const EngineerSchema = z.object({
  id: z.string().uuid(),
  employee_code: z.string(),
  name: z.string(),
  mobile: z.string(),
  skills: z.array(z.string()),
  current_lat: z.number().optional(),
  current_lng: z.number().optional(),
  availability: z.enum(['AVAILABLE', 'ON_JOB', 'TRAVELLING', 'OFFLINE', 'LEAVE']).default('AVAILABLE'),
});

export const ServiceReportSchema = z.object({
  id: z.string().uuid(),
  ticket_id: z.string().uuid(),
  engineer_id: z.string().uuid(),
  work_performed: z.string(),
  problem_found: z.string(),
  solution_applied: z.string(),
  time_spent_minutes: z.number().positive(),
  before_photo_urls: z.array(z.string()).default([]),
  after_photo_urls: z.array(z.string()).default([]),
  video_url: z.string().optional(),
  customer_signature_url: z.string().optional(),
  created_at: z.string().optional(),
});

export const AMCContractSchema = z.object({
  id: z.string().uuid(),
  contract_number: z.string(),
  customer_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
  visit_frequency: z.enum(['ANNUAL', 'HALF_YEARLY', 'QUARTERLY', 'MONTHLY']),
  status: z.enum(['ACTIVE', 'EXPIRED', 'PENDING_RENEWAL', 'CANCELLED']).default('ACTIVE'),
});

export const CustomerFeedbackSchema = z.object({
  id: z.string().uuid(),
  ticket_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  engineer_id: z.string().uuid(),
  rating_stars: z.number().min(1).max(5),
  behaviour_rating: z.number().min(1).max(5).optional(),
  technical_rating: z.number().min(1).max(5).optional(),
  comments: z.string().optional(),
  created_at: z.string().optional(),
});

export const SLARuleSchema = z.object({
  priority: TicketPriorityEnum,
  response_time_minutes: z.number().positive(),
  resolution_time_minutes: z.number().positive(),
});

export type FSMServiceTicket = z.infer<typeof ServiceTicketSchema>;
export type FSMEngineer = z.infer<typeof EngineerSchema>;
export type FSMServiceReport = z.infer<typeof ServiceReportSchema>;
export type FSMAMCContract = z.infer<typeof AMCContractSchema>;
export type FSMCustomerFeedback = z.infer<typeof CustomerFeedbackSchema>;
export type FSMSLARule = z.infer<typeof SLARuleSchema>;
