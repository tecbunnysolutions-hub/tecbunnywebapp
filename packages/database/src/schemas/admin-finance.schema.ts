import { z } from 'zod';

export const EmployeeSchema = z.object({
  id: z.string().uuid(),
  employee_code: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  department_id: z.string().uuid().optional(),
  designation: z.string(),
  manager_id: z.string().uuid().optional(),
  joining_date: z.string(),
  salary: z.number().nonnegative(),
  email: z.string().email(),
  mobile: z.string(),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'RESIGNED', 'TERMINATED']).default('ACTIVE'),
});

export const AttendanceSchema = z.object({
  id: z.string().uuid(),
  employee_id: z.string().uuid(),
  date: z.string(),
  check_in: z.string(),
  check_out: z.string().optional(),
  working_hours: z.number().optional(),
  method: z.enum(['MANUAL', 'GPS', 'QR', 'BIOMETRIC']).default('GPS'),
  location: z.string().optional(),
});

export const ExpenseClaimSchema = z.object({
  id: z.string().uuid(),
  claim_number: z.string(),
  employee_id: z.string().uuid(),
  category: z.enum(['FUEL', 'TRAVEL', 'ACCOMMODATION', 'OFFICE', 'INTERNET', 'MARKETING', 'REPAIRS', 'MISC']),
  amount: z.number().positive(),
  receipt_url: z.string().optional(),
  remarks: z.string().optional(),
  status: z.enum(['PENDING', 'MANAGER_APPROVED', 'ACCOUNTS_APPROVED', 'PAID', 'REJECTED']).default('PENDING'),
  created_at: z.string().optional(),
});

export const ProcurementApprovalRuleSchema = z.object({
  amount_min: z.number().nonnegative(),
  amount_max: z.number().nonnegative(),
  required_role: z.enum(['MANAGER', 'OPERATIONS_HEAD', 'ADMIN']),
});

export const AccountsReceivableSchema = z.object({
  id: z.string().uuid(),
  invoice_id: z.string().uuid(),
  customer_id: z.string().uuid(),
  total_amount: z.number().positive(),
  paid_amount: z.number().nonnegative().default(0),
  due_amount: z.number().nonnegative(),
  due_date: z.string(),
  status: z.enum(['DUE_TODAY', 'OVERDUE', 'PAID', 'PARTIALLY_PAID']).default('DUE_TODAY'),
});

export type Employee = z.infer<typeof EmployeeSchema>;
export type Attendance = z.infer<typeof AttendanceSchema>;
export type ExpenseClaim = z.infer<typeof ExpenseClaimSchema>;
export type ProcurementApprovalRule = z.infer<typeof ProcurementApprovalRuleSchema>;
export type AccountsReceivable = z.infer<typeof AccountsReceivableSchema>;
