import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const appSourceRoot = join(root, 'apps');
const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx']);
const forbiddenPatterns = [/\balert\s*\(/, /\bconfirm\s*\(/, /\bwindow\.confirm\s*\(/, /\bprompt\s*\(/, /\bwindow\.prompt\s*\(/];
const violations = [];

function extensionOf(filePath) {
  const dotIndex = filePath.lastIndexOf('.');
  return dotIndex === -1 ? '' : filePath.slice(dotIndex);
}

function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue;
      walk(path);
      continue;
    }

    if (!path.includes(`${join('src')}`) || !sourceExtensions.has(extensionOf(path))) continue;

    const source = readFileSync(path, 'utf8');
    const lines = source.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (forbiddenPatterns.some((pattern) => pattern.test(line))) {
        violations.push(`${relative(root, path)}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

walk(appSourceRoot);

if (violations.length > 0) {
  console.error('Native browser modal validation failed. Replace alert()/confirm() with inline feedback or review UI:');
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log('Validated app source has no native browser alert/confirm calls.');
}