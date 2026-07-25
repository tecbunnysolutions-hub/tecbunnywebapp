import { z } from 'zod';

export const LeadClassificationEnum = z.enum(['HOT', 'WARM', 'COLD', 'LOST', 'DUPLICATE', 'SPAM']);
export const LeadStatusEnum = z.enum([
  'NEW',
  'ASSIGNED',
  'CONTACTED',
  'MEETING_SCHEDULED',
  'QUOTATION_SENT',
  'NEGOTIATION',
  'WON',
  'LOST',
  'CLOSED',
]);

export const LeadSchema = z.object({
  id: z.string().uuid(),
  lead_number: z.string(),
  company_name: z.string().min(1),
  customer_name: z.string().min(1),
  mobile: z.string().min(10),
  alt_mobile: z.string().optional(),
  email: z.string().email(),
  website: z.string().url().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  industry: z.string().optional(),
  address: z.object({
    country: z.string().default('India'),
    state: z.string(),
    district: z.string().optional(),
    city: z.string(),
    pincode: z.string(),
    address_line: z.string(),
    google_maps_location: z.string().optional(),
  }),
  business_details: z.object({
    business_type: z.string().optional(),
    annual_revenue: z.number().optional(),
    employee_count: z.number().optional(),
    current_vendor: z.string().optional(),
    interested_products: z.array(z.string()).default([]),
    budget: z.number().optional(),
    expected_purchase_date: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  }).optional(),
  classification: LeadClassificationEnum.default('WARM'),
  status: LeadStatusEnum.default('NEW'),
  source_id: z.string().uuid().optional(),
  assigned_to_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  customer_code: z.string(),
  company_name: z.string(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  email: z.string().email(),
  mobile: z.string(),
  website: z.string().optional(),
  industry: z.string().optional(),
  business_type: z.string().optional(),
  created_at: z.string().optional(),
});

export const CustomerContactSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  name: z.string(),
  role: z.enum(['OWNER', 'MANAGER', 'ACCOUNTS', 'PURCHASE', 'TECHNICAL', 'BILLING']),
  mobile: z.string(),
  email: z.string().email().optional(),
  designation: z.string().optional(),
  birthday: z.string().optional(),
  notes: z.string().optional(),
});

export const CustomerBranchSchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  branch_name: z.string(),
  city: z.string(),
  state: z.string(),
  address: z.string(),
  gstin: z.string().optional(),
});

export const OpportunityStageEnum = z.enum([
  'DISCOVERY',
  'REQUIREMENT_GATHERING',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
]);

export const OpportunitySchema = z.object({
  id: z.string().uuid(),
  customer_id: z.string().uuid(),
  name: z.string(),
  products: z.array(z.string()),
  estimated_value: z.number().nonnegative(),
  probability: z.number().min(0).max(100),
  expected_closing: z.string(),
  stage: OpportunityStageEnum.default('DISCOVERY'),
  assigned_to_id: z.string().uuid(),
  created_at: z.string().optional(),
});

export const FollowupSchema = z.object({
  id: z.string().uuid(),
  lead_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  type: z.enum(['CALL', 'MEETING', 'EMAIL', 'WHATSAPP', 'VIDEO_MEETING', 'SITE_VISIT']),
  scheduled_at: z.string(),
  reminder: z.boolean().default(true),
  remarks: z.string().optional(),
  outcome: z.string().optional(),
  next_followup_at: z.string().optional(),
  assigned_to_id: z.string().uuid(),
  status: z.enum(['PENDING', 'COMPLETED', 'MISSED', 'CANCELLED']).default('PENDING'),
});

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  lead_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  assigned_to_id: z.string().uuid(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  deadline: z.string(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('TODO'),
  completion_percentage: z.number().min(0).max(100).default(0),
});

export type Lead = z.infer<typeof LeadSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type CustomerContact = z.infer<typeof CustomerContactSchema>;
export type CustomerBranch = z.infer<typeof CustomerBranchSchema>;
export type Opportunity = z.infer<typeof OpportunitySchema>;
export type Followup = z.infer<typeof FollowupSchema>;
export type Task = z.infer<typeof TaskSchema>;
