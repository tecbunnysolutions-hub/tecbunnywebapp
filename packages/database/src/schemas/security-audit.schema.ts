import { z } from 'zod';

export const SecurityAlertSeverityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

export const UserSessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  device_name: z.string(),
  browser: z.string(),
  ip_address: z.string(),
  login_time: z.string(),
  last_activity: z.string(),
  is_active: z.boolean().default(true),
});

export const TrustedDeviceSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  device_fingerprint: z.string(),
  device_name: z.string(),
  operating_system: z.string(),
  status: z.enum(['TRUSTED', 'PENDING', 'BLOCKED']).default('TRUSTED'),
});

export const SecurityAlertSchema = z.object({
  id: z.string().uuid(),
  event_type: z.enum(['FAILED_LOGINS', 'PRIVILEGE_CHANGE', 'API_ABUSE', 'SUSPICIOUS_UPLOAD', 'BACKUP_FAILURE', 'LARGE_DATA_EXPORT']),
  severity: SecurityAlertSeverityEnum.default('MEDIUM'),
  description: z.string(),
  ip_address: z.string().optional(),
  user_id: z.string().uuid().optional(),
  status: z.enum(['OPEN', 'INVESTIGATING', 'RESOLVED', 'FALSE_POSITIVE']).default('OPEN'),
  created_at: z.string().optional(),
});

export const BackupJobSchema = z.object({
  id: z.string().uuid(),
  job_name: z.string(),
  backup_type: z.enum(['INCREMENTAL', 'FULL', 'ARCHIVE']),
  target_components: z.array(z.string()),
  size_bytes: z.number().nonnegative(),
  status: z.enum(['SUCCESS', 'FAILED', 'IN_PROGRESS']).default('SUCCESS'),
  executed_at: z.string(),
});

export const DataExportLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  module: z.string(),
  records_exported_count: z.number().int().positive(),
  purpose: z.string().optional(),
  is_watermarked: z.boolean().default(true),
  exported_at: z.string().optional(),
});

export type UserSession = z.infer<typeof UserSessionSchema>;
export type TrustedDevice = z.infer<typeof TrustedDeviceSchema>;
export type SecurityAlert = z.infer<typeof SecurityAlertSchema>;
export type BackupJob = z.infer<typeof BackupJobSchema>;
export type DataExportLog = z.infer<typeof DataExportLogSchema>;
