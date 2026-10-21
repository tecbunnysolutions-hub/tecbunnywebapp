import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import ts from 'typescript';

import { checkBoundary } from './boundary-rules.mjs';
const root = resolve(import.meta.dirname, '..');
const publicSource = join(root, 'apps', 'public', 'src');
const publicApi = join(publicSource, 'app', 'api');

function filesIn(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && ['node_modules', '.next', '.git'].includes(entry.name)) return [];
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

// Cache invalidation must run inside the public app (it owns the fetch cache) and touches no database.
const allowedLocalRoutes = new Set([join(publicApi, 'revalidate', 'route.ts')]);
const localRouteHandlers = filesIn(publicApi)
  .filter((path) => /[\\/]route\.(?:ts|tsx|js|jsx)$/.test(path))
  .filter((path) => !allowedLocalRoutes.has(path));
const mutationPattern = /\.from\([^)]*\)[\s\S]{0,240}\.(?:insert|update|upsert|delete)\s*\(/;
const directMutations = filesIn(publicSource)
  .filter((path) => /\.(?:ts|tsx|js|jsx)$/.test(path))
  .filter((path) => mutationPattern.test(readFileSync(path, 'utf8')));

const browserClientsInHandlers = filesIn(join(root, 'apps'))
  .filter(path => /[\\/]src[\\/]app[\\/].*[\\/]route\.[jt]sx?$/.test(path))
  .filter(path => {
    const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
    return source.statements.some(statement => {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) return false;
      const module = statement.moduleSpecifier.text;
      if (!['@tecbunny/database', '@tecbunny/database/browser', '@tecbunny/core'].includes(module)) return false;
      const bindings = statement.importClause?.namedBindings;
      return bindings && ts.isNamedImports(bindings) && bindings.elements.some(binding =>
        !statement.importClause.isTypeOnly && !binding.isTypeOnly && ['createClient', 'createSupabaseBrowserClient', 'getBrowserClient', 'getClient'].includes((binding.propertyName ?? binding.name).text));
    });
  });

if (localRouteHandlers.length || directMutations.length || browserClientsInHandlers.length) {
  console.error('API boundary validation failed. Public mutations must use the central API, and server handlers must use server database clients.');
  for (const path of localRouteHandlers) console.error(`Local public route handler: ${relative(root, path)}`);
  for (const path of directMutations) console.error(`Direct public database mutation: ${relative(root, path)}`);
  for (const path of browserClientsInHandlers) console.error(`Browser database factory in server handler: ${relative(root, path)}`);
  process.exit(1);
}

console.log('API boundary validation passed: public mutations use the API; server handlers do not import browser database factories.');

// Ratchet: apps other than apps/api may not gain new direct database-client imports.
// Existing offenders are listed in quality/db-boundary-baseline.json and shrink as features migrate.
const dbImportPattern = /(?:from|import)\s*\(?\s*['"](?:@supabase\/supabase-js|@prisma\/client|@tecbunny\/db|@tecbunny\/database(?:\/[\w-]+)?)['"]/;
const baselinePath = join(root, 'quality', 'db-boundary-baseline.json');
const appsRoot = join(root, 'apps');
const dbImporters = readdirSync(appsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'api')
  .flatMap((entry) => filesIn(join(appsRoot, entry.name)))
  .filter((path) => /\.(?:ts|tsx|js|jsx|mjs)$/.test(path) && !/\.(?:test|spec)\./.test(path))
  .filter((path) => dbImportPattern.test(readFileSync(path, 'utf8')))
  .map((path) => relative(root, path).replaceAll('\\', '/'))
  .sort();

if (process.argv.includes('--update-baseline')) {
  writeFileSync(baselinePath, `${JSON.stringify({ files: dbImporters }, null, 2)}\n`);
  console.log(`Wrote ${dbImporters.length} entries to ${relative(root, baselinePath)}`);
  process.exit(0);
}

const baseline = new Set(existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')).files : []);
const newOffenders = dbImporters.filter((path) => !baseline.has(path));
const migrated = [...baseline].filter((path) => !dbImporters.includes(path));
if (newOffenders.length) {
  console.error('New direct database imports outside apps/api (use @tecbunny/api-client instead):');
  for (const path of newOffenders) console.error(`  ${path}`);
  process.exit(1);
}
if (migrated.length) console.log(`Note: ${migrated.length} baseline entries no longer import a DB client; run with --update-baseline to shrink it.`);
console.log(`DB boundary ratchet passed: ${dbImporters.length} legacy importers remain (baseline ${baseline.size}).`);

// Ratchet 2: outside apps/api (and a future apps/worker) no new data-client imports or process.env reads
// beyond the tooling allowlist. Existing violations live in scripts/boundary-grandfather.json.
const boundary = checkBoundary();
if (boundary.fresh.length) {
  console.error(`Boundary violations not in scripts/boundary-grandfather.json (${boundary.fresh.length}):`);
  for (const entry of boundary.fresh) console.error(`  ${entry.file}: ${entry.rule} ${entry.detail}`);
  console.error('UI apps must not import database/admin clients or read process.env (except NODE_ENV, NEXT_OUTPUT_MODE, DOCKER_BUILD, ANALYZE, CI, API_TARGET, VERCEL_*). Use @tecbunny/api-client and GET /api/v1/config/public.');
  process.exit(1);
}
if (boundary.stale.length) {
  console.log(`Note: ${boundary.stale.length} grandfather entries are fixed; run "node scripts/boundary-rules.mjs --write" to drop them.`);
}
console.log(`Boundary grandfather check passed: ${boundary.total} known violations (list size ${boundary.grandfathered}), no new ones.`);