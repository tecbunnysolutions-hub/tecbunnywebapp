import { z } from 'zod';

export const FoundationRoleSchema = z.object({
  id: z.string().uuid(),
  role_name: z.string().min(2),
  description: z.string().optional(),
  is_system: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const FoundationPermissionSchema = z.object({
  id: z.string().uuid(),
  module: z.string(),
  action: z.string(),
  description: z.string().optional(),
});

export const FoundationUserSchema = z.object({
  id: z.string().uuid(),
  employee_code: z.string().min(2),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  email: z.string().email(),
  mobile: z.string().min(10),
  password_hash: z.string(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
  role_id: z.string().uuid(),
  department_id: z.string().uuid().optional(),
  reporting_manager_id: z.string().uuid().optional(),
  joining_date: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export const FoundationDepartmentSchema = z.object({
  id: z.string().uuid(),
  name: z.enum(['Sales', 'Operations', 'Accounts', 'Inventory', 'Support', 'Management', 'Engineering']),
  description: z.string().optional(),
});

export const FoundationActivityLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  module: z.string(),
  action: z.string(),
  old_data: z.record(z.string(), z.any()).optional(),
  new_data: z.record(z.string(), z.any()).optional(),

  ip_address: z.string(),
  browser: z.string(),
  created_at: z.string().optional(),
});

export const FoundationNotificationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['EMAIL', 'WHATSAPP', 'SMS', 'IN_APP', 'PUSH']).default('IN_APP'),
  status: z.enum(['UNREAD', 'READ', 'SENT', 'FAILED']).default('UNREAD'),
  created_at: z.string().optional(),
});

export const FoundationGlobalSettingsSchema = z.object({
  company_name: z.string(),
  gstin: z.string(),
  address: z.string(),
  logo_url: z.string().url().optional(),
  currency: z.string().default('INR'),
  timezone: z.string().default('Asia/Kolkata'),
  date_format: z.string().default('DD/MM/YYYY'),
  invoice_prefix: z.string().default('INV-'),
  quotation_prefix: z.string().default('QTN-'),
  maintenance_mode: z.boolean().default(false),
});

export type FoundationRole = z.infer<typeof FoundationRoleSchema>;
export type FoundationPermission = z.infer<typeof FoundationPermissionSchema>;
export type FoundationUser = z.infer<typeof FoundationUserSchema>;
export type FoundationDepartment = z.infer<typeof FoundationDepartmentSchema>;
export type FoundationActivityLog = z.infer<typeof FoundationActivityLogSchema>;
export type FoundationNotification = z.infer<typeof FoundationNotificationSchema>;
export type FoundationGlobalSettings = z.infer<typeof FoundationGlobalSettingsSchema>;
