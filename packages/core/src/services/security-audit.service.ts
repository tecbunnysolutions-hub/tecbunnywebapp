import { prisma } from '../db/prisma';
import type { BackupJob, DataExportLog, SecurityAlert, TrustedDevice, UserSession } from '@tecbunny/database';

export class SecurityAuditService {
  /**
   * File Upload Security Validator (12.9)
   */
  static validateFileUpload(fileName: string, mimeType: string, fileSizeMb: number): { allowed: boolean; reason?: string } {
    const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.sh', '.js', '.vbs', '.cmd', '.msi', '.scr', '.ps1'];
    const lowerName = fileName.toLowerCase();

    for (const ext of BLOCKED_EXTENSIONS) {
      if (lowerName.endsWith(ext)) {
        return { allowed: false, reason: `Executable file format (${ext}) is blocked for security.` };
      }
    }

    const MAX_SIZE_MB = 50;
    if (fileSizeMb > MAX_SIZE_MB) {
      return { allowed: false, reason: `File size (${fileSizeMb}MB) exceeds maximum threshold (${MAX_SIZE_MB}MB).` };
    }

    return { allowed: true };
  }

  /**
   * Security Alert Dispatcher (12.12)
   */
  static async raiseSecurityAlert(params: {
    eventType: 'FAILED_LOGINS' | 'PRIVILEGE_CHANGE' | 'API_ABUSE' | 'SUSPICIOUS_UPLOAD' | 'BACKUP_FAILURE' | 'LARGE_DATA_EXPORT';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    description: string;
    ipAddress?: string;
    userId?: string;
  }) {
    const p = prisma as any;

    const alertData = {
      id: `sec-${Date.now()}`,
      event_type: params.eventType,
      severity: params.severity,
      description: params.description,
      ip_address: params.ipAddress || null,
      user_id: params.userId || null,
      status: 'OPEN',
      created_at: new Date().toISOString(),
    };

    if (p.security_alerts) {
      await p.security_alerts.create({ data: alertData });
    }

    return alertData;
  }

  /**
   * Force Remote Logout All Sessions (12.4)
   */
  static async forceLogoutAllSessions(userId: string) {
    const p = prisma as any;

    if (p.user_sessions) {
      await p.user_sessions.updateMany({
        where: { user_id: userId },
        data: { is_active: false },
      });
    }

    return { userId, status: 'ALL_SESSIONS_TERMINATED', timestamp: new Date().toISOString() };
  }

  /**
   * Sensitive Data Export Gatekeeper & Log (12.18)
   */
  static async logDataExport(params: {
    userId: string;
    module: string;
    recordsExportedCount: number;
    purpose?: string;
  }) {
    const p = prisma as any;

    const exportLog = {
      id: `exp-log-${Date.now()}`,
      user_id: params.userId,
      module: params.module,
      records_exported_count: params.recordsExportedCount,
      purpose: params.purpose || 'Business Analytics',
      is_watermarked: true,
      exported_at: new Date().toISOString(),
    };

    if (p.export_logs) {
      await p.export_logs.create({ data: exportLog });
    }

    return exportLog;
  }
}
