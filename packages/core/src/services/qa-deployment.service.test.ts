import { describe, expect, it } from 'vitest';

import { QADeploymentService } from './qa-deployment.service';

describe('QADeploymentService', () => {
  describe('evaluateQualityGate', () => {
    const coverage = [
      {
        id: '00000000-0000-4000-8000-000000000201',
        release_id: '00000000-0000-4000-8000-000000000301',
        module_name: 'CRM',
        line_coverage_percent: 85,
        branch_coverage_percent: 82,
        function_coverage_percent: 89,
        recorded_at: new Date().toISOString(),
      },
      {
        id: '00000000-0000-4000-8000-000000000202',
        release_id: '00000000-0000-4000-8000-000000000301',
        module_name: 'Inventory',
        line_coverage_percent: 79,
        branch_coverage_percent: 76,
        function_coverage_percent: 81,
        recorded_at: new Date().toISOString(),
      },
    ];

    it('fails when at least one module is below coverage target', () => {
      const result = QADeploymentService.evaluateQualityGate({
        coverage,
        failedTests: 0,
        blockedTests: 0,
        minCoveragePercent: 80,
      });

      expect(result.passed).toBe(false);
      expect(result.reasons.some((reason) => reason.includes('Coverage below threshold'))).toBe(true);
    });

    it('fails when failed tests exist', () => {
      const result = QADeploymentService.evaluateQualityGate({
        coverage: coverage.map((c) => ({ ...c, line_coverage_percent: 92, function_coverage_percent: 94 })),
        failedTests: 3,
        blockedTests: 0,
        minCoveragePercent: 80,
      });

      expect(result.passed).toBe(false);
      expect(result.reasons.some((reason) => reason.includes('Failed tests detected'))).toBe(true);
    });

    it('passes when coverage and test states are compliant', () => {
      const result = QADeploymentService.evaluateQualityGate({
        coverage: coverage.map((c) => ({ ...c, line_coverage_percent: 91, function_coverage_percent: 93 })),
        failedTests: 0,
        blockedTests: 0,
        minCoveragePercent: 80,
      });

      expect(result.passed).toBe(true);
      expect(result.reasons).toEqual([]);
    });
  });

  describe('evaluatePerformanceTargets', () => {
    it('passes when all values meet targets', () => {
      const result = QADeploymentService.evaluatePerformanceTargets({
        dashboardLoadMs: 2500,
        standardApiMs: 420,
        heavyReportMs: 12000,
      });

      expect(result.passed).toBe(true);
      expect(result.violations).toEqual([]);
    });

    it('reports violations when values exceed targets', () => {
      const result = QADeploymentService.evaluatePerformanceTargets({
        dashboardLoadMs: 3200,
        standardApiMs: 520,
        heavyReportMs: 16000,
      });

      expect(result.passed).toBe(false);
      expect(result.violations.length).toBe(3);
    });
  });
});
