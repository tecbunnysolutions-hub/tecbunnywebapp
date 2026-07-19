import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const themePath = join(root, 'packages/ui/src/theme.ts');
const source = readFileSync(themePath, 'utf8');

const requiredSnippets = [
  'enterpriseTokenContract',
  'colorRoles',
  'density',
  'radius',
  'motion',
  'status',
  'enterprise: enterpriseTokenContract',
];

const missing = requiredSnippets.filter((snippet) => !source.includes(snippet));

if (missing.length > 0) {
  console.error('Theme contract validation failed. Missing required token contract entries:');
  for (const snippet of missing) console.error(`- ${snippet}`);
  process.exitCode = 1;
} else {
  console.log('Validated shared enterprise theme token contract.');
}