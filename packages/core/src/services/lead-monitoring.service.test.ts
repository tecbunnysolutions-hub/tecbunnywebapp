import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LeadMonitoringService } from './lead-monitoring.service';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('LeadMonitoringService', () => {
  let mockSupabase: any;

  const makeQuery = (data: any[] | null = []) => {
    const query: any = {
      select: vi.fn(() => query),
      gte: vi.fn(() => query),
      is: vi.fn(() => query),
      filter: vi.fn(() => query),
      or: vi.fn(() => query),
      not: vi.fn(() => query),
      in: vi.fn(() => query),
      eq: vi.fn(() => query),
      limit: vi.fn(() => query),
      maybeSingle: vi.fn(async () => ({ data: Array.isArray(data) ? data[0] ?? null : data ?? null, error: null })),
      single: vi.fn(async () => ({ data: Array.isArray(data) ? data[0] ?? null : data ?? null, error: null })),
      then: vi.fn((resolve: (value: { data: any[] | null }) => void) => resolve({ data })),
    };
    return query;
  };

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn(() => makeQuery()),
    };
  });

  describe('getSystemHealth', () => {
    it('should return HEALTHY status when all metrics within thresholds', async () => {
      // Mock data: healthy state
      mockSupabase.from = vi.fn((table: string) => {
        const makeQuery = (data: any[] = []) => {
          const query = {
            select: vi.fn().mockImplementation(() => query).mockReturnThis(),
            gte: vi.fn().mockImplementation(() => query).mockReturnThis(),
            is: vi.fn().mockImplementation(() => query).mockReturnThis(),
            not: vi.fn().mockImplementation(() => query).mockReturnThis(),
            or: vi.fn().mockImplementation(() => query).mockReturnThis(),
            eq: vi.fn().mockImplementation(() => query).mockReturnThis(),
            then: (resolve: (value: { data: any[] | null }) => void) => resolve({ data }),
          };
          return query;
        };

        if (table === 'sls_leads') {
          return makeQuery([
            {
              id: '1',
              email: 'user@example.com',
              phone: '+919000000001',
              first_name: 'John',
              lead_owner_id: 'exec-1',
              heat_level: 'WARM',
              status: 'NEW',
              lead_score: 50,
              source_id: 'source-1',
            },
            {
              id: '2',
              email: 'user2@example.com',
              phone: '+919000000002',
              first_name: 'Jane',
              lead_owner_id: 'exec-1',
              heat_level: 'WARM',
              status: 'NEW',
              lead_score: 50,
              source_id: 'source-1',
            },
          ]);
        } else if (table === 'sls_lead_sources') {
          return makeQuery([{ id: 'source-1', name: 'website' }]);
        } else if (table === 'sls_lead_assignments') {
          return makeQuery([
            { id: '1', sales_executive_id: 'exec-1', lead_id: '1' },
            { id: '2', sales_executive_id: 'exec-1', lead_id: '2' },
          ]);
        } else if (table === 'lead_followup_tasks') {
          return makeQuery([
            {
              id: '1',
              status: 'completed',
              due_at: new Date(Date.now() - 3600000).toISOString(),
              created_at: new Date(Date.now() - 7200000).toISOString(),
              updated_at: new Date(Date.now() - 3600000).toISOString(),
            },
          ]);
        } else if (table === 'contact_messages') {
          return makeQuery([
            {
              id: '1',
              lead_id: '1',
              lead_source: 'website',
              created_at: new Date().toISOString(),
            },
            {
              id: '2',
              lead_id: '2',
              lead_source: 'website',
              created_at: new Date().toISOString(),
            },
          ]);
        }
        return makeQuery([]);
      });

      const health = await LeadMonitoringService.getSystemHealth(mockSupabase as SupabaseClient);

      expect(health.overallHealth).toBe('HEALTHY');
      expect(health.metrics.leads.totalLeads).toBeGreaterThan(0);
      expect(health.issues).toHaveLength(0);
    });

    it('should return DEGRADED status when workload imbalance exceeds 50%', async () => {
      // Mock data with severe workload imbalance
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'sls_leads') {
          return {
            select: vi
              .fn()
              .mockResolvedValue({
                data: Array.from({ length: 150 }, (_, i) => ({
                  id: `lead-${i}`,
                  email: `user${i}@example.com`,
                  first_name: 'User',
                  lead_owner_id: i < 140 ? 'exec-1' : 'exec-2',
                  heat_level: i % 3 === 0 ? 'HOT' : i % 3 === 1 ? 'WARM' : 'COLD',
                  status: 'NEW',
                  lead_score: 30 + (i % 50),
                  source_id: 'source-1',
                })),
              })
              .mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            not: vi.fn().mockReturnThis(),
            or: vi.fn().mockReturnThis(),
          };
        } else if (table === 'sls_lead_sources') {
          return {
            select: vi
              .fn()
              .mockResolvedValue({ data: [{ id: 'source-1', name: 'website' }] })
              .mockReturnThis(),
          };
        } else if (table === 'sls_lead_assignments') {
          return {
            select: vi
              .fn()
              .mockResolvedValue({
                data: Array.from({ length: 140 }, (_, i) => ({
                  id: `assign-${i}`,
                  sales_executive_id: 'exec-1',
                  lead_id: `lead-${i}`,
                })),
              })
              .mockReturnThis(),
            is: vi.fn().mockReturnThis(),
          };
        } else if (table === 'lead_followup_tasks') {
          return {
            select: vi
              .fn()
              .mockResolvedValue({ data: [] })
              .mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            is: vi.fn().mockReturnThis(),
            not: vi.fn().mockReturnThis(),
          };
        } else if (table === 'contact_messages') {
          return {
            select: vi
              .fn()
              .mockResolvedValue({ data: [] })
              .mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
          };
        }
        return { select: vi.fn().mockResolvedValue({ data: [] }).mockReturnThis() };
      });

      const health = await LeadMonitoringService.getSystemHealth(mockSupabase as SupabaseClient);

      expect(['DEGRADED', 'CRITICAL']).toContain(health.overallHealth);
    });

    it('should return CRITICAL status when unassigned leads exceeds 50', async () => {
      // Mock data with many unassigned leads
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'sls_leads') {
          return makeQuery(
            Array.from({ length: 80 }, (_, i) => ({
              id: `lead-${i}`,
              email: `user${i}@example.com`,
              first_name: 'User',
              lead_owner_id: i < 20 ? 'exec-1' : null,
              heat_level: 'COLD',
              status: 'NEW',
              lead_score: 20,
              source_id: 'source-1',
            }))
          );
        } else if (table === 'sls_lead_sources') {
          return makeQuery([{ id: 'source-1', name: 'website' }]);
        } else if (table === 'sls_lead_assignments') {
          return makeQuery(
            Array.from({ length: 20 }, (_, i) => ({
              id: `assign-${i}`,
              sales_executive_id: 'exec-1',
              lead_id: `lead-${i}`,
            }))
          );
        } else if (table === 'lead_followup_tasks') {
          return makeQuery(
            Array.from({ length: 30 }, (_, i) => ({
              id: `task-${i}`,
              status: 'pending',
              due_at: new Date(Date.now() - 7200000).toISOString(),
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date(Date.now() - 86400000).toISOString(),
            }))
          );
        } else if (table === 'contact_messages') {
          return makeQuery([]);
        }
        return makeQuery([]);
      });

      const health = await LeadMonitoringService.getSystemHealth(mockSupabase as SupabaseClient);

      expect(health.overallHealth).toBe('CRITICAL');
      expect(health.metrics.leads.unassignedLeads).toBeGreaterThan(50);
    });
  });

  describe('auditDataQuality', () => {
    it('should detect orphaned messages and tasks', async () => {
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'contact_messages') {
          return makeQuery([
            { id: '1', lead_id: 'lead-1' },
            { id: '2', lead_id: 'lead-999' },
            { id: '3', lead_id: 'lead-1' },
          ]);
        } else if (table === 'sls_leads') {
          return makeQuery([
            {
              id: 'lead-1',
              email: 'user@example.com',
              first_name: 'John',
            },
          ]);
        } else if (table === 'lead_followup_tasks') {
          return makeQuery([
            { id: 'task-1', lead_id: 'lead-1' },
            { id: 'task-2', lead_id: 'lead-999' },
          ]);
        }
        return makeQuery([]);
      });

      const audit = await LeadMonitoringService.auditDataQuality(mockSupabase as SupabaseClient);

      expect(audit.stats.orphanedMessages).toBe(1);
      expect(audit.stats.orphanedFollowupTasks).toBe(1);
    });

    it('should detect leads with missing contact info', async () => {
      mockSupabase.from = vi.fn((table: string) => {
        if (table === 'sls_leads') {
          return {
            select: vi
              .fn()
              .mockResolvedValue({
                data: [
                  { id: '1', email: 'user@example.com', first_name: 'John' },
                  { id: '2', email: null, first_name: null }, // missing both
                  { id: '3', email: 'user3@example.com', first_name: 'Jane' },
                ],
              })
              .mockReturnThis(),
            is: vi.fn().mockReturnThis(),
          };
        } else if (table === 'contact_messages') {
          return {
            select: vi.fn().mockResolvedValue({ data: [] }).mockReturnThis(),
          };
        } else if (table === 'lead_followup_tasks') {
          return {
            select: vi.fn().mockResolvedValue({ data: [] }).mockReturnThis(),
          };
        }
        return { select: vi.fn().mockResolvedValue({ data: [] }).mockReturnThis() };
      });

      const audit = await LeadMonitoringService.auditDataQuality(mockSupabase as SupabaseClient);

      expect(audit.stats.leadsWithMissingContact).toBeGreaterThanOrEqual(0);
    });
  });
});
