import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const baselinePath = join(root, 'visual-regression-baselines.json');
const baselines = JSON.parse(readFileSync(baselinePath, 'utf8'));

const requiredViewports = ['mobile', 'tablet', 'desktop'];
const requiredPages = [
  'public-checkout',
  'mgmt-orders',
  'mgmt-role-dashboard',
  'waba-inbox',
  'webmail-inbox',
  'superadmin-health',
];
const requiredAssertions = [
  'nonblank-render',
  'no-horizontal-overflow',
  'primary-actions-visible',
  'no-critical-text-overlap',
];

const missing = [];

for (const viewport of requiredViewports) {
  const found = baselines.viewports?.some((entry) => entry.name === viewport && entry.width > 0 && entry.height > 0);
  if (!found) missing.push(`viewport: ${viewport}`);
}

for (const page of requiredPages) {
  const found = baselines.criticalPages?.some((entry) => entry.id === page && entry.path && entry.app);
  if (!found) missing.push(`critical page: ${page}`);
}

for (const assertion of requiredAssertions) {
  if (!baselines.assertions?.includes(assertion)) missing.push(`assertion: ${assertion}`);
}

if (missing.length > 0) {
  console.error('Visual baseline validation failed. Missing required visual regression coverage:');
  for (const item of missing) console.error(`- ${item}`);
  process.exitCode = 1;
} else {
  console.log('Validated visual regression baseline contract.');
}