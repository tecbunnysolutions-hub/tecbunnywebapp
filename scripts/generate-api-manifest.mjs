#!/usr/bin/env node
// Builds apps/api/src/generated/api-manifest.json: every route handler under apps/api/src/app/api with
// its HTTP methods and whether the gateway (src/proxy.ts publicRoutes) lets anonymous callers in.
// Run: node scripts/generate-api-manifest.mjs [--check]
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const apiRoot = join(root, 'apps', 'api', 'src', 'app', 'api');
const proxyFile = join(root, 'apps', 'api', 'src', 'proxy.ts');
const outFile = join(root, 'apps', 'api', 'src', 'generated', 'api-manifest.json');
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'];

function routeFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return routeFiles(path);
    return entry.name === 'route.ts' || entry.name === 'route.tsx' ? [path] : [];
  });
}

const publicEntries = [...readFileSync(proxyFile, 'utf8').matchAll(/'((?:(?:GET|POST|PUT|PATCH|DELETE) )?\/api\/[^']*)'/g)].map((m) => {
  const [first, second] = m[1].split(' ');
  return second ? { method: first, path: second } : { method: '*', path: first };
});

const isPublic = (method, path) =>
  publicEntries.some((entry) => (entry.method === '*' || entry.method === method) && (path === entry.path || path.startsWith(`${entry.path}/`)));

const routes = routeFiles(apiRoot)
  .map((file) => {
    const source = readFileSync(file, 'utf8');
    const methods = METHODS.filter((method) =>
      new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\b|export\\s+const\\s+${method}\\b|export\\s*\\{[^}]*\\b${method}\\b[^}]*\\}`).test(source),
    );
    const segments = relative(apiRoot, join(file, '..')).split(sep).filter(Boolean);
    const path = `/api/${segments.join('/')}`.replace(/\/$/, '');
    const group = segments[0] === 'v1' || segments[0] === 'v2' ? `${segments[0]}/${segments[1] ?? ''}`.replace(/\/$/, '') : (segments[0] ?? 'root');
    return {
      path,
      group,
      dynamic: segments.some((segment) => segment.startsWith('[')),
      methods: methods.map((method) => ({ method, access: isPublic(method, path) ? 'public' : 'protected' })),
    };
  })
  .filter((route) => route.methods.length > 0)
  .sort((a, b) => a.path.localeCompare(b.path));

const manifest = { routeCount: routes.length, endpointCount: routes.reduce((n, r) => n + r.methods.length, 0), routes };
const text = `${JSON.stringify(manifest, null, 2)}\n`;

if (process.argv.includes('--check')) {
  const current = existsSync(outFile) ? readFileSync(outFile, 'utf8') : '';
  if (current !== text) {
    console.error('api-manifest.json is stale. Run: node scripts/generate-api-manifest.mjs');
    process.exit(1);
  }
  console.log(`API manifest up to date (${manifest.routeCount} routes, ${manifest.endpointCount} endpoints).`);
} else {
  mkdirSync(join(outFile, '..'), { recursive: true });
  writeFileSync(outFile, text);
  console.log(`Wrote ${manifest.routeCount} routes (${manifest.endpointCount} endpoints) to ${relative(root, outFile)}`);
}
