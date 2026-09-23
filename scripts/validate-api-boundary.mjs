import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const publicSource = join(root, 'apps', 'public', 'src');
const publicApi = join(publicSource, 'app', 'api');

function filesIn(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

const localRouteHandlers = filesIn(publicApi).filter((path) => /[\\/]route\.(?:ts|tsx|js|jsx)$/.test(path));
const mutationPattern = /\.from\([^)]*\)[\s\S]{0,240}\.(?:insert|update|upsert|delete)\s*\(/;
const directMutations = filesIn(publicSource)
  .filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path))
  .filter((path) => mutationPattern.test(readFileSync(path, 'utf8')));

if (localRouteHandlers.length || directMutations.length) {
  console.error('API boundary validation failed. apps/public must use the central API for mutations and integrations.');
  for (const path of localRouteHandlers) console.error(`Local public route handler: ${relative(root, path)}`);
  for (const path of directMutations) console.error(`Direct public database mutation: ${relative(root, path)}`);
  process.exit(1);
}

console.log('API boundary validation passed: apps/public has no local route handlers or direct database mutations.');
