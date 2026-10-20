import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const apiDir = __dirname;
const GUARDS = ['authorizeNotification', 'handleOrderNotification'];

function routeFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) return routeFiles(full);
    return name === 'route.ts' ? [full] : [];
  });
}

describe('notification routes are guarded', () => {
  const files = [...routeFiles(path.join(apiDir, 'email')), ...routeFiles(path.join(apiDir, 'notifications'))];

  it('finds the notification routes', () => {
    expect(files.length).toBeGreaterThanOrEqual(18);
  });

  it.each(files.map((f) => [path.relative(apiDir, f), f]))('%s calls the notification guard', (_name, file) => {
    const source = readFileSync(file, 'utf8');
    expect(GUARDS.some((guard) => source.includes(guard))).toBe(true);
  });

  it('proxy.ts lists exact email routes only (no /api/email prefix wildcard)', () => {
    const proxy = readFileSync(path.join(apiDir, '..', '..', 'proxy.ts'), 'utf8');
    expect(proxy).not.toMatch(/['"]POST \/api\/email\/?['"]/);
    for (const file of files) {
      const route = '/' + path.relative(path.join(apiDir, '..'), path.dirname(file)).split(path.sep).join('/');
      const bypassesSession = readFileSync(file, 'utf8').includes("'internal'") || route.endsWith('/send');
      if (bypassesSession) expect(proxy).toContain(`'POST ${route}'`);
    }
  });
});
