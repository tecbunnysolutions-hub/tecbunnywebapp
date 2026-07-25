import { z } from 'zod';

export const ProjectStatusEnum = z.enum([
  'CREATED',
  'PLANNING',
  'MATERIAL_READY',
  'INSTALLATION_SCHEDULED',
  'INSTALLATION_STARTED',
  'TESTING',
  'CUSTOMER_APPROVAL',
  'COMPLETED',
  'CLOSED',
]);

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  project_number: z.string(),
  project_name: z.string(),
  customer_id: z.string().uuid(),
  branch_id: z.string().uuid().optional(),
  sales_order_id: z.string().uuid(),
  project_manager_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  expected_completion_date: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  budget: z.number().nonnegative(),
  status: ProjectStatusEnum.default('CREATED'),
  created_at: z.string().optional(),
});

export const ProjectTaskSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  task_name: z.string(),
  assigned_to_id: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  deadline: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED']).default('TODO'),
  completion_percentage: z.number().min(0).max(100).default(0),
  remarks: z.string().optional(),
});

export const ProjectMilestoneSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  milestone_name: z.string(),
  percentage_weight: z.number().min(0).max(100),
  due_date: z.string(),
  completed_at: z.string().optional(),
  status: z.enum(['PENDING', 'ACHIEVED', 'DELAYED']).default('PENDING'),
});

export const InstallationScheduleSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  installation_date: z.string(),
  assigned_engineer_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  site_address: z.string(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'RESCHEDULED']).default('SCHEDULED'),
});

export const CompletionChecklistSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  all_materials_installed: z.boolean().default(false),
  installation_photos_uploaded: z.boolean().default(false),
  testing_completed: z.boolean().default(false),
  customer_trained: z.boolean().default(false),
  documents_uploaded: z.boolean().default(false),
  completion_certificate_generated: z.boolean().default(false),
  customer_signature_captured: z.boolean().default(false),
  warranty_activated: z.boolean().default(false),
  final_invoice_generated: z.boolean().default(false),
  is_fully_completed: z.boolean().default(false),
});

export type Project = z.infer<typeof ProjectSchema>;
export type ProjectTask = z.infer<typeof ProjectTaskSchema>;
export type ProjectMilestone = z.infer<typeof ProjectMilestoneSchema>;
export type InstallationSchedule = z.infer<typeof InstallationScheduleSchema>;
export type CompletionChecklist = z.infer<typeof CompletionChecklistSchema>;
