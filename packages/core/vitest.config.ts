import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      // Ratchet: enforce the baseline measured 2026-09-20 (statements 22.12 /
      // branches 18.87 / functions 44.91 / lines 22.42) and raise per release.
      thresholds: {
        statements: 20,
        branches: 18,
        functions: 40,
        lines: 20,
      },
    },
  },
});
