import { describe, expect, it } from 'vitest';

import { APIPlatformService } from './api-platform.service';

describe('APIPlatformService', () => {
  describe('evaluateRateLimit', () => {
    const baseLimit = {
      id: '00000000-0000-4000-8000-000000000100',
      client_id: '00000000-0000-4000-8000-000000000101',
      per_minute: 100,
      per_hour: 1000,
      per_day: 10000,
      burst_limit: 150,
    };

    it('allows requests below thresholds', async () => {
      const result = await APIPlatformService.evaluateRateLimit({
        requestCountMinute: 10,
        requestCountHour: 150,
        requestCountDay: 2000,
        limit: baseLimit,
      });

      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('blocks requests when minute limit is reached', async () => {
      const result = await APIPlatformService.evaluateRateLimit({
        requestCountMinute: 100,
        requestCountHour: 200,
        requestCountDay: 2000,
        limit: baseLimit,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Per-minute');
      expect(result.retryAfterSeconds).toBe(60);
    });

    it('blocks requests when hour limit is reached', async () => {
      const result = await APIPlatformService.evaluateRateLimit({
        requestCountMinute: 10,
        requestCountHour: 1000,
        requestCountDay: 2000,
        limit: baseLimit,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Per-hour');
      expect(result.retryAfterSeconds).toBe(3600);
    });

    it('blocks requests when day limit is reached', async () => {
      const result = await APIPlatformService.evaluateRateLimit({
        requestCountMinute: 10,
        requestCountHour: 200,
        requestCountDay: 10000,
        limit: baseLimit,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('Per-day');
      expect(result.retryAfterSeconds).toBe(86400);
    });
  });
});
