import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const evidencePath = join(root, 'runtime-readiness-evidence.json');

if (!existsSync(evidencePath)) {
  console.error('Infrastructure observability validation failed. Missing runtime readiness evidence artifact.');
  process.exitCode = 1;
  process.exit();
}

const evidence = JSON.parse(readFileSync(evidencePath, 'utf8'));
const requiredSignals = [
  'logs',
  'metrics',
  'traces',
  'observability',
];

const missingSignals = requiredSignals.filter((signal) => {
  if (signal === 'observability') {
    return !evidence?.observability;
  }

  return !evidence?.[signal] && !evidence?.observability?.[signal];
});

if (missingSignals.length > 0) {
  console.error('Infrastructure observability validation failed. Missing signal coverage in runtime readiness evidence:');
  for (const signal of missingSignals) {
    console.error(`- ${signal}`);
  }
  process.exitCode = 1;
} else {
  console.log('Validated infrastructure observability contract and runtime evidence references.');
}
