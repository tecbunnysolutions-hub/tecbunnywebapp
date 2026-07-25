import { prisma } from '../db/prisma';
import type { AccountsReceivable, Attendance, ExpenseClaim } from '@tecbunny/database';

export class AdminFinanceService {
  /**
   * Procurement Approval Tier Routing (8.9)
   */
  static getProcurementApprovalTier(amount: number): 'MANAGER' | 'OPERATIONS_HEAD' | 'ADMIN' {
    if (amount <= 25000) return 'MANAGER';
    if (amount <= 100000) return 'OPERATIONS_HEAD';
    return 'ADMIN';
  }

  /**
   * Mobile GPS Attendance Check-In (8.5)
   */
  static async recordAttendance(params: {
    employeeId: string;
    method: 'MANUAL' | 'GPS' | 'QR' | 'BIOMETRIC';
    location?: string;
  }) {
    const p = prisma as any;
    const today = new Date().toISOString().split('T')[0];

    const attendanceData = {
      id: `att-${Date.now()}`,
      employee_id: params.employeeId,
      date: today,
      check_in: new Date().toISOString(),
      method: params.method,
      location: params.location || 'Site',
    };

    if (p.attendance) {
      return p.attendance.create({ data: attendanceData });
    }

    return attendanceData;
  }

  /**
   * Submit Expense Reimbursement Claim (8.10)
   */
  static async submitExpenseClaim(params: {
    employeeId: string;
    category: 'FUEL' | 'TRAVEL' | 'ACCOMMODATION' | 'OFFICE' | 'INTERNET' | 'MARKETING' | 'REPAIRS' | 'MISC';
    amount: number;
    receiptUrl?: string;
    remarks?: string;
  }) {
    const p = prisma as any;
    const claimNumber = `EXP-${Date.now().toString().slice(-6)}`;

    const claimData = {
      id: `exp-${Date.now()}`,
      claim_number: claimNumber,
      employee_id: params.employeeId,
      category: params.category,
      amount: params.amount,
      receipt_url: params.receiptUrl || null,
      remarks: params.remarks || '',
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    if (p.expenses) {
      return p.expenses.create({ data: claimData });
    }

    return claimData;
  }

  /**
   * Accounts Receivable Aging & Reminders (8.14)
   */
  static async getOverdueReceivables() {
    const p = prisma as any;

    if (p.receivables) {
      return p.receivables.findMany({
        where: {
          status: { in: ['DUE_TODAY', 'OVERDUE'] },
        },
      });
    }

    return [];
  }
}
