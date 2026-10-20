// Shared scanner for the "only apps/api owns data and secrets" boundary.
// Used by scripts/validate-api-boundary.mjs (check) and `node scripts/boundary-rules.mjs --write` (regenerate the grandfather list).
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
export const grandfatherPath = join(root, 'scripts', 'boundary-grandfather.json');

// Directories that must stay presentation-only. apps/api and a future apps/worker are exempt.
const EXEMPT_APPS = new Set(['api', 'worker']);
const UI_PACKAGES = ['ui', 'admin-ui', 'api-client', 'contracts'];

export const ALLOWED_ENV = [/^NODE_ENV$/, /^NEXT_OUTPUT_MODE$/, /^DOCKER_BUILD$/, /^ANALYZE$/, /^CI$/, /^API_TARGET$/, /^VERCEL_/];

const RESTRICTED_MODULES = new Set([
  '@tecbunny/db',
  '@prisma/client',
  '@supabase/supabase-js',
  '@tecbunny/database/admin',
  '@tecbunny/database/server',
]);
const RESTRICTED_NAMES = new Set(['prisma', 'getAdminClient', 'getAdminDb', 'createServiceClient', 'createSupabaseServiceClient', 'getPrismaClient']);

const SKIP_DIRS = new Set(['node_modules', '.next', '.turbo', 'dist', 'out', 'build', 'coverage', '.git', 'storybook-static']);

function filesIn(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return SKIP_DIRS.has(entry.name) ? [] : filesIn(path);
    return [path];
  });
}

const isScannable = (path) =>
  /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(path) &&
  !/\.d\.ts$/.test(path) &&
  !/\.(?:test|spec|stories)\.[jt]sx?$/.test(path) &&
  !/[\\/](?:__tests__|__mocks__|e2e|tests?)[\\/]/.test(path) &&
  !/(?:playwright|vitest|jest)\.config\./.test(path);

export function scopeFiles() {
  const appsRoot = join(root, 'apps');
  const apps = readdirSync(appsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !EXEMPT_APPS.has(entry.name))
    .map((entry) => join(appsRoot, entry.name));
  const packages = UI_PACKAGES.map((name) => join(root, 'packages', name));
  return [...apps, ...packages].flatMap(filesIn).filter(isScannable);
}

const stripComments = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

export function scanFile(path) {
  const source = stripComments(readFileSync(path, 'utf8'));
  const violations = [];
  const add = (rule, detail) => violations.push({ rule, detail });

  const importPattern = /import\s+(type\s+)?([\s\S]*?)\s+from\s*['"]([^'"]+)['"]|(?:import|require)\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"]/g;
  for (const match of source.matchAll(importPattern)) {
    const typeOnly = Boolean(match[1]);
    const bindings = match[2] ?? '';
    const module = match[3] ?? match[4] ?? match[5];
    if (!module) continue;
    if ((RESTRICTED_MODULES.has(module) || /^@tecbunny\/database(?:\/|$)/.test(module) || /^@tecbunny\/infra\/db/.test(module)) && !typeOnly) {
      add('db-import', module);
    } else if (module.startsWith('@tecbunny/core') && !typeOnly) {
      for (const name of bindings.replace(/[{}]/g, '').split(',').map((part) => part.trim().split(/\s+as\s+/)[0].replace(/^type\s+/, '')).filter(Boolean)) {
        if (RESTRICTED_NAMES.has(name)) add('db-import', `${module}#${name}`);
      }
    }
  }

  const envNames = new Set();
  for (const match of source.matchAll(/(?:process\.env|import\.meta\.env)\.([A-Za-z_][A-Za-z0-9_]*)/g)) envNames.add(match[1]);
  for (const match of source.matchAll(/(?:process\.env|import\.meta\.env)\[\s*['"`]([^'"`]+)['"`]\s*\]/g)) envNames.add(match[1]);
  if (/(?:process\.env|import\.meta\.env)\[\s*(?!['"`])/.test(source)) envNames.add('<dynamic>');
  if (/=\s*process\.env\s*[;,)\n]|\.\.\.process\.env|\(\s*process\.env\s*\)/.test(source)) envNames.add('<whole>');
  for (const name of envNames) {
    if (!ALLOWED_ENV.some((pattern) => pattern.test(name))) add('env-read', name);
  }
  return violations;
}

export function scanAll() {
  const found = [];
  for (const path of scopeFiles()) {
    const file = relative(root, path).replaceAll('\\', '/');
    for (const violation of scanFile(path)) found.push({ file, ...violation });
  }
  return found.sort((a, b) => `${a.file}|${a.rule}|${a.detail}`.localeCompare(`${b.file}|${b.rule}|${b.detail}`));
}

export const keyOf = (entry) => `${entry.file}|${entry.rule}|${entry.detail}`;

const defaultReason = (entry) => {
  const owner = entry.file.split('/').slice(0, 2).join('/');
  return entry.rule === 'db-import'
    ? `${owner} imports ${entry.detail} directly; move the data access behind an /api/v1 endpoint and api-client method.`
    : `${owner} reads ${entry.detail}; serve it via GET /api/v1/config/public, move the logic into apps/api, or delete it.`;
};

export function loadGrandfather() {
  if (!existsSync(grandfatherPath)) return [];
  return JSON.parse(readFileSync(grandfatherPath, 'utf8')).violations ?? [];
}

export function writeGrandfather() {
  const existing = new Map(loadGrandfather().map((entry) => [keyOf(entry), entry.reason]));
  const violations = scanAll().map((entry) => ({ ...entry, reason: existing.get(keyOf(entry)) ?? defaultReason(entry) }));
  const body = {
    description:
      'Existing violations of the apps/api-only data and env boundary. The check passes with this list and fails on any entry not listed. Remove entries as features migrate; never add entries.',
    violations,
  };
  writeFileSync(grandfatherPath, `${JSON.stringify(body, null, 2)}\n`);
  return violations.length;
}

/** Returns { fresh, stale, total } where fresh = violations not in the grandfather list. */
export function checkBoundary() {
  const allowed = new Set(loadGrandfather().map(keyOf));
  const current = scanAll();
  const currentKeys = new Set(current.map(keyOf));
  return {
    total: current.length,
    grandfathered: allowed.size,
    fresh: current.filter((entry) => !allowed.has(keyOf(entry))),
    stale: [...allowed].filter((key) => !currentKeys.has(key)),
  };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename) && process.argv.includes('--write')) {
  console.log(`Wrote ${writeGrandfather()} entries to ${relative(root, grandfatherPath)}`);
}
