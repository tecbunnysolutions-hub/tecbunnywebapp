import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const budgetPath = join(root, 'launch-quality-budgets.json');
const packagePath = join(root, 'package.json');
const budgetConfig = JSON.parse(readFileSync(budgetPath, 'utf8'));
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

const requiredBudgetNumbers = {
  largestContentfulPaintMs: 2500,
  interactionToNextPaintMs: 200,
  cumulativeLayoutShift: 0.1,
  firstLoadJsKb: 250,
};

const requiredApps = ['public', 'mgmt', 'waba', 'superadmin'];
const requiredFlows = [
  'command-palette-action-routing',
  'order-operations-saved-view',
  'waba-agent-handoff',
  'webmail-provider-gate',
  'superadmin-system-health',
];
const requiredValidators = [
  'validate:ux-actions',
  'validate:no-browser-modals',
  'validate:accessibility-contract',
  'validate:product-telemetry',
  'validate:theme-contract',
  'validate:launch-readiness',
  'validate:performance-budgets',
];

const missing = [];
const budgets = budgetConfig.budgets ?? {};
const demoReadiness = budgetConfig.demoReadiness ?? {};

for (const [key, maximum] of Object.entries(requiredBudgetNumbers)) {
  const value = budgets[key];
  if (typeof value !== 'number' || value > maximum) {
    missing.push(`budget ${key} must be <= ${maximum}`);
  }
}

for (const app of requiredApps) {
  if (!budgets.criticalTypecheckApps?.includes(app)) {
    missing.push(`critical typecheck app: ${app}`);
  }
}

for (const flow of requiredFlows) {
  if (!demoReadiness.requiredFlows?.includes(flow)) {
    missing.push(`demo flow: ${flow}`);
  }
}

for (const validator of requiredValidators) {
  if (!demoReadiness.requiredValidators?.includes(validator)) {
    missing.push(`budget validator reference: ${validator}`);
  }
  if (!packageJson.scripts?.[validator.replace('validate:', 'validate:')]) {
    missing.push(`package script: ${validator}`);
  }
}

if (missing.length > 0) {
  console.error('Performance budget validation failed. Missing or weak launch budget entries:');
  for (const item of missing) console.error(`- ${item}`);
  process.exitCode = 1;
} else {
  console.log('Validated launch performance budgets and CIO demo readiness contract.');
}