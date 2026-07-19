import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const registryPath = join(root, 'packages/ui/src/components/enterprise-actions.ts');
const registrySource = readFileSync(registryPath, 'utf8');
const hrefs = [...registrySource.matchAll(/href:\s*'([^']+)'/g)].map((match) => match[1]);

const routeRoots = [
  { prefix: '/mgmt', appRoot: 'apps/mgmt/src/app' },
  { prefix: '/superadmin', appRoot: 'apps/superadmin/src/app' },
  { prefix: '/waba', appRoot: 'apps/waba/src/app' },
  { prefix: '/', appRoot: 'apps/public/src/app' },
];

function hrefToPagePath(href) {
  const cleanHref = href.split('?')[0].replace(/\/$/, '') || '/';
  const routeRoot = routeRoots.find((route) => cleanHref === route.prefix || cleanHref.startsWith(`${route.prefix}/`));
  if (!routeRoot) return null;

  if (routeRoot.prefix === '/waba') {
    const relative = cleanHref === '/waba' ? '' : cleanHref.replace(/^\/waba\/?/, '');
    return join(root, routeRoot.appRoot, relative, 'page.tsx');
  }

  const relative = cleanHref === '/' ? '' : cleanHref.replace(/^\//, '');
  return join(root, routeRoot.appRoot, relative, 'page.tsx');
}

const missingRoutes = hrefs
  .map((href) => ({ href, pagePath: hrefToPagePath(href) }))
  .filter(({ pagePath }) => !pagePath || !existsSync(pagePath));

if (missingRoutes.length > 0) {
  console.error('Enterprise action route validation failed. Missing pages:');
  for (const route of missingRoutes) {
    console.error(`- ${route.href} -> ${route.pagePath ?? 'no route root matched'}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Validated ${hrefs.length} enterprise action routes.`);
}