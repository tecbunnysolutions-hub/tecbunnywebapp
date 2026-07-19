import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const evidence = JSON.parse(readFileSync(join(root, 'launch-qa-evidence.json'), 'utf8'));

const requiredAccessibilityMethods = ['keyboard-navigation', 'screen-reader-labels', 'focus-management', 'status-announcements', 'color-contrast'];
const requiredSurfaces = ['public-checkout', 'mgmt-orders', 'waba-chat', 'webmail-inbox', 'superadmin-system-health'];
const requiredTasks = ['find-and-open-order', 'save-order-view', 'waba-stage-agent-reply', 'webmail-stage-reply', 'review-launch-health-blockers'];
const requiredDemoSteps = [
  'Open command palette and route to order operations',
  'Apply a saved order view and export selected orders',
  'Review a WABA handoff with assignment, SLA, note, and canned reply',
  'Stage a Webmail reply and show provider gate guidance',
  'Review Superadmin System Health launch blockers and risk summary',
];

const missing = [];
const accessibility = evidence.accessibilityEvidence ?? {};

if (accessibility.standard !== 'WCAG 2.2 AA') {
  missing.push('accessibility standard: WCAG 2.2 AA');
}

for (const method of requiredAccessibilityMethods) {
  if (!accessibility.requiredMethods?.includes(method)) missing.push(`accessibility method: ${method}`);
}

for (const surface of requiredSurfaces) {
  if (!accessibility.coveredSurfaces?.includes(surface)) missing.push(`accessibility surface: ${surface}`);
}

for (const task of requiredTasks) {
  const metric = evidence.taskCompletionMetrics?.find((entry) => entry.id === task);
  if (!metric) {
    missing.push(`task metric: ${task}`);
    continue;
  }
  if (typeof metric.targetCompletionRate !== 'number' || metric.targetCompletionRate < 0.9) {
    missing.push(`task completion target >= 0.9: ${task}`);
  }
  if (typeof metric.targetP95Seconds !== 'number' || metric.targetP95Seconds > 60) {
    missing.push(`task p95 target <= 60s: ${task}`);
  }
}

for (const step of requiredDemoSteps) {
  if (!evidence.cioDemoScript?.includes(step)) missing.push(`CIO demo step: ${step}`);
}

if (missing.length > 0) {
  console.error('Launch evidence validation failed. Missing required evidence contract entries:');
  for (const item of missing) console.error(`- ${item}`);
  process.exitCode = 1;
} else {
  console.log('Validated launch QA evidence, accessibility certification plan, task metrics, and CIO demo script.');
}