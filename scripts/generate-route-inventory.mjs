#!/usr/bin/env node
// Scans apps/*/src/app/**/route.{ts,tsx} and writes docs/route-inventory.md.
// Detection is static and heuristic (regex on source). Guards are detected per file, not per handler.
// Does not fail the build; UNCLASSIFIED handlers are listed and counted.
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appsDir = join(root, 'apps');
const outFile = join(root, 'docs', 'route-inventory.md');
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === 'dist') continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/^route\.tsx?$/.test(name)) out.push(full);
  }
  return out;
};

// Guard rules. Rank decides the primary classification when several match.
const GUARDS = [
  { label: 'superadmin', rank: 5, test: /requireSuperadmin\w*\(|verifySuperadminSessionToken\(|requireRole\(\s*['"]superadmin['"]|allowedRoles:\s*\[\s*['"]superadmin['"]\s*\]|minimumRole:\s*['"]superadmin['"]/ },
  { label: 'staff', rank: 4, test: (s) => /requireAdminContext\(|requireApiRole\(|requireRole\(|requirePermission\(|requireStaffProfile\(|requireAdmin\(|verifyAdminAccess\(|requireExtensionAdmin\(|adminSupabase\(|requireCaller\(\s*\w+\s*,\s*['"](?:staff|admin)['"]/.test(s) || (/getSessionWithRole\(/.test(s) && /isAtLeast\(|\brole\s*(?:===|!==|==|!=)|allowedRoles|\.includes\(\s*role/.test(s)) },
  { label: 'user', rank: 3, test: (s) => (/\.auth\.getUser\(|getServerAuthState\(|getSession\(|getSessionWithRole\(/.test(s) && /\b401\b|Unauthorized/.test(s)) || /requireCaller\(|requireOwnership\(|resolveCaller\(/.test(s) },
  { label: 'internal', rank: 2, test: /requireInternalAccess\(|hasInternalAccess\(|INTERNAL_API_(?:KEY|TOKEN)|x-internal-api/ },
  { label: 'cron', rank: 2, test: /verifyCronSecret\(|CRON_SECRET/ },
  { label: 'signed webhook', rank: 2, test: /createHmac\(|verifySignature\(|verifyPayuHash\(|x-hub-signature|x-cashfree-signature|x-webhook-signature|verifyAgainstAnySecret\(/ },
  { label: 'signed link', rank: 1, test: /verifyQuoteActionToken\(/ },
];

const publicLists = new Map();
for (const app of readdirSync(appsDir)) {
  const entries = [];
  let hasProxy = false;
  for (const file of ['src/proxy.ts', 'src/middleware.ts']) {
    let text;
    try { text = readFileSync(join(appsDir, app, file), 'utf8'); } catch { continue; }
    hasProxy = true;
    for (const block of text.matchAll(/publicRoutes\s*(?::|=)\s*\[([\s\S]*?)\]/g)) {
      for (const m of block[1].matchAll(/['"`](?:(GET|POST|PUT|PATCH|DELETE) )?(\/[^'"`\s]*)['"`]/g)) {
        const segments = m[2].split('/').filter(Boolean);
        if (segments.length) entries.push({ method: m[1] ?? null, segments });
      }
    }
  }
  publicLists.set(app, { hasProxy, entries });
}

const isProxyPublic = (app, method, routeSegments) => {
  const list = publicLists.get(app);
  return list.entries.some((entry) => {
    if (entry.method && entry.method !== method) return false;
    if (entry.segments.length > routeSegments.length) return false;
    return entry.segments.every((seg, i) => seg === routeSegments[i] || /^\[.*\]$/.test(routeSegments[i]));
  });
};

const rows = [];
for (const app of readdirSync(appsDir).sort()) {
  const appRoot = join(appsDir, app, 'src', 'app');
  try { statSync(appRoot); } catch { continue; }
  for (const file of walk(appRoot).sort()) {
    const source = readFileSync(file, 'utf8');
    const rel = relative(appRoot, dirname(file)).split(sep).filter((s) => s && !/^\(.*\)$/.test(s));
    const routePath = `/${rel.join('/')}`;
    const methods = new Set();
    for (const m of source.matchAll(/export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g)) methods.add(m[1]);
    for (const m of source.matchAll(/export\s+const\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/g)) methods.add(m[1]);
    for (const m of source.matchAll(/export\s*\{([^}]*)\}/g)) {
      for (const name of m[1].split(',')) {
        const exported = name.split(/\s+as\s+/).pop().trim();
        if (METHODS.includes(exported)) methods.add(exported);
      }
    }
    if (methods.size === 0) methods.add('?');

    const guards = GUARDS.filter((g) => (typeof g.test === 'function' ? g.test(source) : g.test.test(source))).sort((a, b) => b.rank - a.rank);
    const tables = new Set();
    for (const m of source.matchAll(/\.from\(\s*['"`]([a-z_][\w.]*)['"`]\s*\)/g)) tables.add(m[1]);
    for (const m of source.matchAll(/\bprisma\.(\w+)\.(?:find|create|update|delete|upsert|count|aggregate|group)/g)) tables.add(`prisma:${m[1]}`);
    if (/\$queryRaw|\$executeRaw/.test(source)) tables.add('prisma:raw');
    const providers = [];
    if (/whatsapp|infobip|graph\.facebook/i.test(source)) providers.push('whatsapp');
    if (/payu/i.test(source)) providers.push('payu');
    if (/cashfree/i.test(source)) providers.push('cashfree');
    if (/sendEmail|emailHelpers|nodemailer|smtp/i.test(source)) providers.push('email');

    for (const method of [...methods].sort()) {
      const segments = routePath.split('/').filter(Boolean);
      const proxyPublic = isProxyPublic(app, method, segments);
      let classification;
      let note = '';
      if (guards.length) {
        classification = guards[0].label;
      } else if (proxyPublic) {
        classification = 'public';
        note = 'listed as public in the app proxy/middleware';
      } else if (publicLists.get(app).hasProxy) {
        classification = 'user';
        note = 'NO HANDLER AUTH: relies on middleware session only';
      } else {
        classification = 'UNCLASSIFIED';
      }
      if (guards.length === 0 && !proxyPublic && classification === 'user') classification = 'session-only';
      rows.push({
        app, method, path: routePath, classification, guards: guards.map((g) => g.label).join(', ') || '-',
        tables: [...tables].sort().join(', ') || '-', providers: providers.join(', ') || '-', note,
        file: relative(root, file).split(sep).join('/'),
      });
    }
  }
}

const count = (pred) => rows.filter(pred).length;
const cell = (value) => String(value).replace(/\|/g, '\\|');
const lines = [
  '# Route inventory',
  '',
  'Generated by `node scripts/generate-route-inventory.mjs`. Do not edit by hand.',
  'Detection is static: guards are detected per file (not per handler) from helper usage; "public" means the path is listed in the app proxy/middleware public list; "session-only" means the handler has no auth check of its own and relies on the middleware requiring a logged-in session (any role).',
  '',
  `Handlers: ${rows.length}. UNCLASSIFIED: ${count((r) => r.classification === 'UNCLASSIFIED')}. Session-only (no handler auth): ${count((r) => r.classification === 'session-only')}.`,
  '',
  '## Summary by app and classification',
  '',
  '| App | ' + ['public', 'user', 'staff', 'superadmin', 'internal', 'cron', 'signed webhook', 'signed link', 'session-only', 'UNCLASSIFIED'].join(' | ') + ' | Total |',
  '|---|' + '---|'.repeat(11),
];
for (const app of [...new Set(rows.map((r) => r.app))]) {
  const cols = ['public', 'user', 'staff', 'superadmin', 'internal', 'cron', 'signed webhook', 'signed link', 'session-only', 'UNCLASSIFIED']
    .map((c) => count((r) => r.app === app && r.classification === c));
  lines.push(`| ${app} | ${cols.join(' | ')} | ${count((r) => r.app === app)} |`);
}

const section = (title, pred, intro) => {
  const subset = rows.filter(pred);
  lines.push('', `## ${title} (${subset.length})`, '', intro, '');
  if (!subset.length) { lines.push('None.'); return; }
  lines.push('| App | Method | Path | File |', '|---|---|---|---|');
  for (const r of subset) lines.push(`| ${r.app} | ${r.method} | \`${cell(r.path)}\` | ${r.file} |`);
};
section('UNCLASSIFIED handlers', (r) => r.classification === 'UNCLASSIFIED', 'No guard helper detected and the app has no proxy/middleware public list to compare against.');
section('Session-only handlers (no handler-level auth)', (r) => r.classification === 'session-only', 'Any logged-in user (including customers) can call these unless the handler checks elsewhere. Review each one.');

lines.push('', '## All handlers', '', '| App | Method | Path | Auth | Guards | Tables | Providers | Note |', '|---|---|---|---|---|---|---|---|');
for (const r of rows) {
  lines.push(`| ${r.app} | ${r.method} | \`${cell(r.path)}\` | ${r.classification === 'UNCLASSIFIED' ? '**UNCLASSIFIED**' : r.classification} | ${cell(r.guards)} | ${cell(r.tables)} | ${r.providers} | ${cell(r.note)} |`);
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, lines.join('\n') + '\n');
console.log(`route inventory: ${rows.length} handlers, ${count((r) => r.classification === 'UNCLASSIFIED')} UNCLASSIFIED, ${count((r) => r.classification === 'session-only')} session-only -> docs/route-inventory.md`);
