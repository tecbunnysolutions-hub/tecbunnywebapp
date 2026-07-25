import { prisma } from '../db/prisma';
import { randomUUID } from 'node:crypto';
import type {
  DeploymentHistory,
  GoLiveChecklist,
  HypercareTicket,
  MonitoringEvent,
  PerformanceMetric,
  ReleaseVersion,
  RollbackHistory,
  TestCoverageMetric,
  TestResult,
} from '@tecbunny/database';

export class QADeploymentService {
  /**
   * Release dashboard aggregation (15.1, 15.24)
   */
  static async getReleaseDashboardSnapshot() {
    const p = prisma as any;

    const latestReleaseFromDb = p.releases
      ? await p.releases.findFirst({ orderBy: { release_date: 'desc' } })
      : null;

    const latestRelease: ReleaseVersion = latestReleaseFromDb ?? {
      id: randomUUID(),
      version: '0.0.0',
      release_date: new Date().toISOString(),
      status: 'PLANNED',
      build_success_rate_percent: 0,
      failed_builds_count: 0,
      created_by_id: undefined,
    };

    const recentTestResults = p.test_results
      ? await p.test_results.findMany({
        where: latestReleaseFromDb ? { release_id: latestRelease.id } : undefined,
        orderBy: { executed_at: 'desc' },
        take: 200,
      })
      : [];

    const qaStatus = recentTestResults.reduce(
      (acc: { test_cases: number; passed: number; failed: number; blocked: number; pending: number }, row: any) => {
        const passed = Number(row.passed_count ?? 0);
        const failed = Number(row.failed_count ?? 0);
        const blocked = Number(row.blocked_count ?? 0);
        const pending = Number(row.pending_count ?? 0);
        acc.passed += passed;
        acc.failed += failed;
        acc.blocked += blocked;
        acc.pending += pending;
        acc.test_cases += passed + failed + blocked + pending;
        return acc;
      },
      { test_cases: 0, passed: 0, failed: 0, blocked: 0, pending: 0 },
    );

    const deployments = p.deployment_history
      ? await p.deployment_history.findMany({
        where: { environment: 'PRODUCTION' },
        orderBy: { started_at: 'desc' },
        take: 100,
      })
      : [];
    const deploymentFailures = deployments.filter((row: any) => row.status === 'FAILED').length;
    const buildSuccessRatePercent = deployments.length > 0
      ? ((deployments.length - deploymentFailures) / deployments.length) * 100
      : latestRelease.build_success_rate_percent;

    const recentMonitoring = p.monitoring_events
      ? await p.monitoring_events.findMany({
        orderBy: { created_at: 'desc' },
        take: 200,
      })
      : [];
    const errorEvents = recentMonitoring.filter((row: any) => row.severity === 'HIGH' || row.severity === 'CRITICAL').length;
    const errorRatePercent = recentMonitoring.length > 0
      ? (errorEvents / recentMonitoring.length) * 100
      : 0;

    const productionStatus = {
      server_health: errorRatePercent < 2 ? 'HEALTHY' : 'DEGRADED',
      database_health: errorRatePercent < 2 ? 'HEALTHY' : 'DEGRADED',
      queue_health: errorRatePercent < 2 ? 'HEALTHY' : 'DEGRADED',
      active_users: 0,
      error_rate_percent: Number(errorRatePercent.toFixed(2)),
    };

    return {
      latestRelease: {
        ...latestRelease,
        build_success_rate_percent: Number(buildSuccessRatePercent.toFixed(2)),
        failed_builds_count: deploymentFailures,
      },
      qaStatus,
      productionStatus,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Test lifecycle and quality gate verification (15.2 - 15.7)
   */
  static async recordTestExecution(result: TestResult): Promise<TestResult> {
    const p = prisma as any;

    const payload: TestResult = {
      ...result,
      executed_at: result.executed_at ?? new Date().toISOString(),
    };

    if (p.test_results) {
      await p.test_results.create({ data: payload });
    }

    return payload;
  }

  static evaluateQualityGate(params: {
    coverage: TestCoverageMetric[];
    failedTests: number;
    blockedTests: number;
    minCoveragePercent?: number;
  }): { passed: boolean; reasons: string[] } {
    const minCoverage = params.minCoveragePercent ?? 80;
    const reasons: string[] = [];

    const coverageFailures = params.coverage.filter(
      (c) => c.line_coverage_percent < minCoverage || c.function_coverage_percent < minCoverage,
    );

    if (coverageFailures.length > 0) {
      reasons.push(`Coverage below threshold (${minCoverage}%) for ${coverageFailures.length} module(s).`);
    }
    if (params.failedTests > 0) {
      reasons.push(`Failed tests detected: ${params.failedTests}.`);
    }
    if (params.blockedTests > 0) {
      reasons.push(`Blocked tests detected: ${params.blockedTests}.`);
    }

    return {
      passed: reasons.length === 0,
      reasons,
    };
  }

  /**
   * Performance and load metrics collection (15.8 - 15.10)
   */
  static async recordPerformanceMetric(metric: PerformanceMetric): Promise<PerformanceMetric> {
    const p = prisma as any;
    const payload: PerformanceMetric = {
      ...metric,
      recorded_at: metric.recorded_at ?? new Date().toISOString(),
    };

    if (p.performance_metrics) {
      await p.performance_metrics.create({ data: payload });
    }

    return payload;
  }

  static evaluatePerformanceTargets(params: {
    dashboardLoadMs: number;
    standardApiMs: number;
    heavyReportMs: number;
  }): { passed: boolean; violations: string[] } {
    const violations: string[] = [];

    if (params.dashboardLoadMs >= 3000) {
      violations.push(`Dashboard target exceeded: ${params.dashboardLoadMs}ms (target < 3000ms).`);
    }
    if (params.standardApiMs >= 500) {
      violations.push(`Standard API target exceeded: ${params.standardApiMs}ms (target < 500ms).`);
    }
    if (params.heavyReportMs >= 15000) {
      violations.push(`Heavy report target exceeded: ${params.heavyReportMs}ms (target < 15000ms).`);
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Deployment, rollback, and go-live process controls (15.19 - 15.21)
   */
  static async createDeploymentRecord(params: {
    releaseId: string;
    environment: 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
    notes?: string;
    deployedById?: string;
  }): Promise<DeploymentHistory> {
    const p = prisma as any;

    const deployment: DeploymentHistory = {
      id: randomUUID(),
      release_id: params.releaseId,
      environment: params.environment,
      status: 'RUNNING',
      started_at: new Date().toISOString(),
      completed_at: undefined,
      deployed_by_id: params.deployedById,
      notes: params.notes,
    };

    if (p.deployment_history) {
      await p.deployment_history.create({ data: deployment });
    }

    return deployment;
  }

  static async completeDeployment(params: {
    deploymentId: string;
    success: boolean;
    notes?: string;
  }): Promise<{ deploymentId: string; status: 'SUCCESS' | 'FAILED'; completedAt: string }> {
    const p = prisma as any;
    const completedAt = new Date().toISOString();
    const status = params.success ? 'SUCCESS' : 'FAILED';

    if (p.deployment_history) {
      await p.deployment_history.update({
        where: { id: params.deploymentId },
        data: {
          status,
          completed_at: completedAt,
          notes: params.notes ?? null,
        },
      });
    }

    return { deploymentId: params.deploymentId, status, completedAt };
  }

  static async rollbackDeployment(params: {
    deploymentId: string;
    reason: string;
    rolledBackToVersion: string;
    initiatedById?: string;
  }): Promise<RollbackHistory> {
    const p = prisma as any;

    const rollback: RollbackHistory = {
      id: randomUUID(),
      deployment_id: params.deploymentId,
      rollback_reason: params.reason,
      rolled_back_to_version: params.rolledBackToVersion,
      initiated_by_id: params.initiatedById,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      status: 'SUCCESS',
    };

    if (p.rollback_history) {
      await p.rollback_history.create({ data: rollback });
    }

    if (p.deployment_history) {
      await p.deployment_history.update({
        where: { id: params.deploymentId },
        data: { status: 'ROLLED_BACK' },
      });
    }

    return rollback;
  }

  static async approveGoLive(checklist: GoLiveChecklist): Promise<GoLiveChecklist> {
    const p = prisma as any;
    const allDone = checklist.items.every((item) => item.completed);

    const payload: GoLiveChecklist = {
      ...checklist,
      status: allDone ? 'APPROVED' : 'READY',
      approved_at: allDone ? new Date().toISOString() : checklist.approved_at,
    };

    if (p.go_live_checklists) {
      await p.go_live_checklists.update({
        where: { id: checklist.id },
        data: payload,
      });
    }

    return payload;
  }

  /**
   * Monitoring and post-go-live incident handling (15.14, 15.15, 15.22)
   */
  static async recordMonitoringEvent(event: MonitoringEvent): Promise<MonitoringEvent> {
    const p = prisma as any;
    const payload: MonitoringEvent = {
      ...event,
      created_at: event.created_at ?? new Date().toISOString(),
    };

    if (p.monitoring_events) {
      await p.monitoring_events.create({ data: payload });
    }

    return payload;
  }

  static async createHypercareTicket(ticket: HypercareTicket): Promise<HypercareTicket> {
    const p = prisma as any;
    const payload: HypercareTicket = {
      ...ticket,
      created_at: ticket.created_at ?? new Date().toISOString(),
    };

    if (p.hypercare_tickets) {
      await p.hypercare_tickets.create({ data: payload });
    }

    return payload;
  }
}