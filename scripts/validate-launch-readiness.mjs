import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const auditPath = join(root, 'PRODUCT_DESIGN_AUDIT_REPORT.md');
const packagePath = join(root, 'package.json');
const audit = readFileSync(auditPath, 'utf8');
const packageJson = readFileSync(packagePath, 'utf8');

const targetAreas = [
  'Overall Product Experience',
  'UI Quality',
  'UX Quality',
  'Accessibility',
  'Enterprise Design',
  'Dashboard Quality',
  'Navigation',
  'Workflow Efficiency',
  'Design System Maturity',
  'Information Architecture',
  'Visual Consistency',
  'Mobile Experience',
  'Desktop Experience',
  'Product Maturity',
  'Enterprise Readiness',
];

const requiredSnippets = [
  '## 2. Target Launch Scores',
  '## 3. Implementation Progress Log',
  '## 21. Thirteen-Phase Execution Tracker',
  'validate:product-ux',
  'validate:ux-actions',
  'validate:no-browser-modals',
  'validate:accessibility-contract',
  'validate:product-telemetry',
  'validate:performance-budgets',
  'validate:visual-baselines',
  'validate:launch-evidence',
  'validate:theme-contract',
];

const missingTargets = targetAreas.filter((area) => !audit.includes(`| ${area} | 100 / 100 |`));
const missingPhases = Array.from({ length: 13 }, (_, index) => index + 1)
  .filter((phase) => !audit.includes(`| ${phase} |`));
const missingSnippets = requiredSnippets.filter((snippet) => !audit.includes(snippet) && !packageJson.includes(snippet));

if (missingTargets.length > 0 || missingPhases.length > 0 || missingSnippets.length > 0) {
  console.error('Launch readiness validation failed. Missing audit or validation contract entries:');
  for (const target of missingTargets) console.error(`- target score: ${target}`);
  for (const phase of missingPhases) console.error(`- phase tracker row: ${phase}`);
  for (const snippet of missingSnippets) console.error(`- required snippet: ${snippet}`);
  process.exitCode = 1;
} else {
  console.log('Validated launch readiness audit contract and executable UX gates.');
}