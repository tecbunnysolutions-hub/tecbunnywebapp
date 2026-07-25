import { z } from 'zod';

export const ExecutiveMetricsSchema = z.object({
  snapshot_date: z.string(),
  revenue_today: z.number().nonnegative(),
  revenue_monthly: z.number().nonnegative(),
  revenue_quarterly: z.number().nonnegative(),
  revenue_annual: z.number().nonnegative(),
  gross_profit: z.number(),
  net_profit: z.number(),
  outstanding_receivables: z.number().nonnegative(),
  outstanding_payables: z.number().nonnegative(),
  active_customers: z.number().int().nonnegative(),
  active_projects: z.number().int().nonnegative(),
  open_service_tickets: z.number().int().nonnegative(),
  inventory_value: z.number().nonnegative(),
});

export const ReportTemplateSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  module: z.enum(['SALES', 'CRM', 'INVENTORY', 'PURCHASE', 'PROJECTS', 'SERVICE', 'FINANCE', 'HR']),
  fields: z.array(z.string()),
  filters: z.record(z.string(), z.any()).optional(),
  chart_type: z.enum(['LINE', 'BAR', 'PIE', 'DONUT', 'AREA', 'HEATMAP', 'KPI_CARD', 'FUNNEL', 'GAUGE', 'TREEMAP']).default('BAR'),
  created_by_id: z.string().uuid(),
  created_at: z.string().optional(),
});

export const BusinessAlertSchema = z.object({
  id: z.string().uuid(),
  alert_name: z.string(),
  condition_type: z.enum(['REVENUE_DROP', 'LOW_STOCK', 'PROJECT_DELAY', 'SLA_BREACH', 'PAYMENT_OVERDUE', 'LOW_CASH_BALANCE']),
  threshold_value: z.number(),
  is_active: z.boolean().default(true),
  recipient_roles: z.array(z.string()),
});

export type ExecutiveMetrics = z.infer<typeof ExecutiveMetricsSchema>;
export type ReportTemplate = z.infer<typeof ReportTemplateSchema>;
export type BusinessAlert = z.infer<typeof BusinessAlertSchema>;
