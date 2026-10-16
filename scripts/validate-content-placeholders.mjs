import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const workspaceRoot = process.cwd();
const targets = [
  join(workspaceRoot, 'apps', 'public', 'src'),
  join(workspaceRoot, 'apps', 'public', '.next'),
  join(workspaceRoot, 'supabase', 'migrations'),
].filter(existsSync);
const marker = /\[\[(?:FILL|VERIFY)(?::|\])/;
const matches = [];

function visit(path) {
  for (const entry of readdirSync(path)) {
    const childPath = join(path, entry);
    const stats = statSync(childPath);
    if (stats.isDirectory()) {
      visit(childPath);
      continue;
    }

    if (!stats.isFile()) {
      continue;
    }

    const contents = readFileSync(childPath, 'utf8');
    if (marker.test(contents)) {
      matches.push(relative(workspaceRoot, childPath));
    }
  }
}

for (const target of targets) {
  visit(target);
}

if (matches.length > 0) {
  console.error('Production content contains unresolved [[FILL]] or [[VERIFY]] markers:');
  for (const path of matches) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

console.log('No unresolved production content placeholders found.');
