import { z } from 'zod';

export const CompanyStatusEnum = z.enum(['ACTIVE', 'TRIAL', 'SUSPENDED', 'EXPIRED', 'ARCHIVED']);

export const CompanySchema = z.object({
  id: z.string().uuid(),
  company_name: z.string(),
  company_code: z.string(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  email: z.string().email(),
  support_number: z.string(),
  status: CompanyStatusEnum.default('TRIAL'),
  subscription_plan: z.enum(['TRIAL', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM']).default('STARTER'),
  created_at: z.string().optional(),
});

export const FeatureFlagSchema = z.object({
  id: z.string().uuid(),
  feature_key: z.string(),
  description: z.string().optional(),
  scope: z.enum(['GLOBAL', 'COMPANY', 'BRANCH', 'ROLE']).default('GLOBAL'),
  target_id: z.string().optional(),
  is_enabled: z.boolean().default(false),
});

export const LicenseSchema = z.object({
  id: z.string().uuid(),
  company_id: z.string().uuid(),
  plan_name: z.string(),
  max_users: z.number().int().positive(),
  max_branches: z.number().int().positive(),
  storage_limit_gb: z.number().positive(),
  api_rate_limit_per_min: z.number().int().positive(),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean().default(true),
});

export const MaintenanceWindowSchema = z.object({
  id: z.string().uuid(),
  scope: z.enum(['PLATFORM', 'COMPANY', 'MODULE']).default('PLATFORM'),
  target_id: z.string().optional(),
  maintenance_message: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  is_active: z.boolean().default(false),
});

export const InfrastructureHealthSchema = z.object({
  cpu_usage_percent: z.number().min(0).max(100),
  ram_usage_percent: z.number().min(0).max(100),
  disk_usage_percent: z.number().min(0).max(100),
  active_db_connections: z.number().int().nonnegative(),
  queue_pending_jobs: z.number().int().nonnegative(),
  system_uptime_seconds: z.number().nonnegative(),
  recorded_at: z.string(),
});

export type Company = z.infer<typeof CompanySchema>;
export type FeatureFlag = z.infer<typeof FeatureFlagSchema>;
export type License = z.infer<typeof LicenseSchema>;
export type MaintenanceWindow = z.infer<typeof MaintenanceWindowSchema>;
export type InfrastructureHealth = z.infer<typeof InfrastructureHealthSchema>;
