import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

/**
 * SEO / AI-discovery contract validation for apps/public.
 *
 * Verifies, statically, the unified Search + AI Discovery contract:
 *  1. Global discovery surface (robots, sitemap, llms.txt, ai.txt, RSS, entity file)
 *  2. Root layout JSON-LD + metadata (Organization, LocalBusiness, WebSite, OG/Twitter)
 *  3. Every PUBLIC indexable route: metadata, canonical helper usage, breadcrumbs,
 *     FAQ schema and page-type JSON-LD per the route contract table
 *  4. Every UTILITY route: noindex via page metadata or an ancestor layout
 *
 * Exit code 1 on any error-tier failure. Warnings are reported but non-fatal.
 */

const root = process.cwd();
const appDir = join(root, 'apps/public');
const appSrc = join(appDir, 'src/app');

const errors = [];
const warnings = [];

const read = (absPath) => (existsSync(absPath) ? readFileSync(absPath, 'utf8') : null);

function requireSnippet(label, content, snippet, tier = 'error') {
  if (content === null) {
    errors.push(`${label}: file missing`);
    return;
  }
  if (!content.includes(snippet)) {
    (tier === 'error' ? errors : warnings).push(`${label}: missing \`${snippet}\``);
  }
}

/* ------------------------------------------------------------------ */
/* 1. Global discovery surface                                         */
/* ------------------------------------------------------------------ */

const robots = read(join(appSrc, 'robots.ts'));
requireSnippet('robots.ts', robots, 'sitemap:');
requireSnippet('robots.ts', robots, 'GPTBot');
requireSnippet('robots.ts', robots, 'ClaudeBot');
requireSnippet('robots.ts', robots, 'PerplexityBot');
for (const disallowed of ['/auth/', '/checkout/', '/cart/', '/profile/', '/orders/', '/payment/', '/seller/', '/quotes/', '/projects/']) {
  requireSnippet('robots.ts', robots, `'${disallowed}'`);
}

const sitemap = read(join(appSrc, 'sitemap.ts'));
requireSnippet('sitemap.ts', sitemap, 'MetadataRoute.Sitemap');
requireSnippet('sitemap.ts', sitemap, 'products');

for (const file of ['public/llms.txt', 'public/.well-known/ai.txt', 'public/company-info.json', 'src/app/feed.xml/route.ts']) {
  if (!existsSync(join(appDir, file))) errors.push(`${file}: file missing`);
}

/* ------------------------------------------------------------------ */
/* 2. Root layout contract                                             */
/* ------------------------------------------------------------------ */

const layout = read(join(appSrc, 'layout.tsx'));
requireSnippet('layout.tsx', layout, 'metadataBase');
requireSnippet('layout.tsx', layout, 'openGraph');
requireSnippet('layout.tsx', layout, 'twitter');
for (const type of ['Organization', 'LocalBusiness', 'WebSite']) {
  // Tolerate single/double quotes and array-valued @type (e.g. ['LocalBusiness', ...])
  if (layout === null || !(layout.includes(`'${type}'`) || layout.includes(`"${type}"`))) {
    errors.push(`layout.tsx JSON-LD: missing ${type} type`);
  }
}

/* ------------------------------------------------------------------ */
/* 2b. Entity consistency (LLMO): same legal identity everywhere        */
/* ------------------------------------------------------------------ */

const entitySource = read(join(appDir, 'src/lib/entity.ts'));
const llmsTxt = read(join(appDir, 'public/llms.txt'));
const companyInfo = read(join(appDir, 'public/company-info.json'));
const aboutPage = read(join(appSrc, 'about/page.tsx'));

requireSnippet('entity module', entitySource, 'U80200GA2025PTC017488');
requireSnippet('entity module', entitySource, 'Pernem, North Goa');
requireSnippet('layout.tsx', layout, 'ENTITY.');
requireSnippet('about/page.tsx', aboutPage, 'ENTITY.');
for (const [label, content] of [['llms.txt', llmsTxt], ['company-info.json', companyInfo]]) {
  requireSnippet(label, content, 'U80200GA2025PTC017488');
  requireSnippet(label, content, '96041');
}

/* ------------------------------------------------------------------ */
/* 3. Public indexable route contract                                  */
/* ------------------------------------------------------------------ */

/**
 * path: route path (for sitemap cross-check, static routes only)
 * file: page file relative to src/app
 * alsoCheck: additional component files whose content counts toward checks
 * breadcrumb: requires BreadcrumbList schema (component or inline)
 * faq: requires FAQPage schema
 * jsonLd: additional schema.org @type strings required
 * inSitemap: static route that must appear in sitemap.ts
 */
const PUBLIC_ROUTES = [
  { path: '/', file: 'page.tsx', faq: true, inSitemap: true },
  { path: '/about', file: 'about/page.tsx', jsonLd: ['AboutPage'], breadcrumb: true, inSitemap: true },
  { path: '/about/business-info', file: 'about/business-info/page.tsx', breadcrumb: true },
  { path: '/assessment', file: 'assessment/page.tsx', breadcrumb: true, inSitemap: true },
  { path: '/blog', file: 'blog/page.tsx', jsonLd: ['Blog'], breadcrumb: true, inSitemap: true },
  { path: '/blog/[slug]', file: 'blog/[slug]/page.tsx', jsonLd: ['BlogPosting'], breadcrumb: true },
  { path: '/blueprints/[id]', file: 'blueprints/[id]/page.tsx', breadcrumb: true },
  { path: '/contact', file: 'contact/page.tsx', jsonLd: ['ContactPage'], breadcrumb: true, faq: true, inSitemap: true },
  { path: '/customised-setups', file: 'customised-setups/page.tsx', breadcrumb: true, inSitemap: true },
  { path: '/industries', file: 'industries/page.tsx', breadcrumb: true, inSitemap: true },
  { path: '/industries/builders', file: 'industries/builders/page.tsx', alsoCheck: ['../components/IndustryLandingPage.tsx'], breadcrumb: true, faq: true, inSitemap: true },
  { path: '/industries/education', file: 'industries/education/page.tsx', alsoCheck: ['../components/IndustryLandingPage.tsx'], breadcrumb: true, faq: true, inSitemap: true },
  { path: '/industries/healthcare', file: 'industries/healthcare/page.tsx', alsoCheck: ['../components/IndustryLandingPage.tsx'], breadcrumb: true, faq: true, inSitemap: true },
  { path: '/industries/hospitality', file: 'industries/hospitality/page.tsx', alsoCheck: ['../components/IndustryLandingPage.tsx'], breadcrumb: true, faq: true, inSitemap: true },
  { path: '/industries/offices', file: 'industries/offices/page.tsx', alsoCheck: ['../components/IndustryLandingPage.tsx'], breadcrumb: true, faq: true, inSitemap: true },
  { path: '/industries/retail', file: 'industries/retail/page.tsx', alsoCheck: ['../components/IndustryLandingPage.tsx'], breadcrumb: true, faq: true, inSitemap: true },
  { path: '/info/faqs', file: 'info/faqs/page.tsx', breadcrumb: true, faq: true },
  { path: '/info/policies', file: 'info/policies/page.tsx', breadcrumb: true },
  { path: '/info/policies/cookie', file: 'info/policies/cookie/page.tsx', breadcrumb: true },
  { path: '/info/policies/privacy', file: 'info/policies/privacy/page.tsx', breadcrumb: true },
  { path: '/info/policies/refund-cancellation', file: 'info/policies/refund-cancellation/page.tsx', breadcrumb: true },
  { path: '/info/policies/return', file: 'info/policies/return/page.tsx', breadcrumb: true },
  { path: '/info/policies/shipping', file: 'info/policies/shipping/page.tsx', breadcrumb: true },
  { path: '/info/policies/terms', file: 'info/policies/terms/page.tsx', breadcrumb: true },
  { path: '/offers', file: 'offers/page.tsx', breadcrumb: true, inSitemap: true },
  { path: '/portfolio', file: 'portfolio/page.tsx', breadcrumb: true, inSitemap: true },
  { path: '/products', file: 'products/page.tsx', jsonLd: ['CollectionPage'], breadcrumb: true, inSitemap: true },
  { path: '/products/[id]', file: 'products/[id]/page.tsx', jsonLd: ['Product'], breadcrumb: true },
  { path: '/resources', file: 'resources/page.tsx', breadcrumb: true, inSitemap: true },
  { path: '/resources/cctv-planning-guide', file: 'resources/cctv-planning-guide/page.tsx', breadcrumb: true, inSitemap: true },
  { path: '/resources/infrastructure-planning-guide', file: 'resources/infrastructure-planning-guide/page.tsx', breadcrumb: true, inSitemap: true },
  { path: '/services', file: 'services/page.tsx', breadcrumb: true, inSitemap: true },
  { path: '/services/lifecycle-hardware', file: 'services/lifecycle-hardware/page.tsx', breadcrumb: true, faq: true, inSitemap: true },
  { path: '/services/network-infrastructure', file: 'services/network-infrastructure/page.tsx', breadcrumb: true, faq: true, inSitemap: true },
  { path: '/services/network-infrastructure/north-goa', file: 'services/network-infrastructure/north-goa/page.tsx', breadcrumb: true, inSitemap: true },
  { path: '/services/physical-security', file: 'services/physical-security/page.tsx', breadcrumb: true, faq: true, inSitemap: true },
  { path: '/services/physical-security/pernem-home-theater', file: 'services/physical-security/pernem-home-theater/page.tsx', breadcrumb: true, inSitemap: true },
  { path: '/services/smart-access-control', file: 'services/smart-access-control/page.tsx', breadcrumb: true, faq: true, inSitemap: true },
  { path: '/services/smart-infrastructure', file: 'services/smart-infrastructure/page.tsx', breadcrumb: true, faq: true, inSitemap: true },
  { path: '/services/software-system-admin', file: 'services/software-system-admin/page.tsx', breadcrumb: true, faq: true, inSitemap: true },
  { path: '/solutions', file: 'solutions/page.tsx', layoutFile: 'solutions/layout.tsx', breadcrumb: true, inSitemap: true },
  { path: '/webdev', file: 'webdev/page.tsx', breadcrumb: true, inSitemap: true },
  { path: '/ai-research', file: 'ai-research/page.tsx', layoutFile: 'ai-research/layout.tsx', breadcrumb: true },
  { path: '/agents/recruit', file: 'agents/recruit/page.tsx', breadcrumb: true },
];

const METADATA_RE = /export\s+(const metadata|async function generateMetadata)/;

for (const route of PUBLIC_ROUTES) {
  const label = `route ${route.path}`;
  const pagePath = join(appSrc, route.file);
  const page = read(pagePath);
  if (page === null) {
    errors.push(`${label}: ${route.file} missing`);
    continue;
  }

  let combined = page;
  for (const extra of route.alsoCheck ?? []) {
    const extraContent = read(join(appSrc, extra));
    if (extraContent) combined += `\n${extraContent}`;
  }

  // Metadata may live on the page or on a segment layout (client pages).
  const layoutContent = route.layoutFile ? read(join(appSrc, route.layoutFile)) : null;
  if (layoutContent) combined += `\n${layoutContent}`;
  if (!METADATA_RE.test(page) && !(layoutContent && METADATA_RE.test(layoutContent))) {
    errors.push(`${label}: no metadata export (page or segment layout)`);
  }

  if (combined.includes('createPageMetadata(') === false && page.includes('alternates') === false) {
    warnings.push(`${label}: not using createPageMetadata — canonical/OG/Twitter not centrally enforced`);
  }

  if (route.breadcrumb && !combined.includes('BreadcrumbJsonLd') && !combined.includes('BreadcrumbList')) {
    errors.push(`${label}: missing BreadcrumbList schema`);
  }

  if (route.faq && !combined.includes('FAQPage')) {
    errors.push(`${label}: missing FAQPage schema`);
  }

  for (const type of route.jsonLd ?? []) {
    if (!combined.includes(`"@type": "${type}"`) && !combined.includes(`'@type': '${type}'`)) {
      errors.push(`${label}: missing ${type} JSON-LD`);
    }
  }

  if (route.inSitemap && sitemap && !sitemap.includes(`\${baseUrl}${route.path === '/' ? '/' : route.path}`)) {
    errors.push(`${label}: missing from sitemap.ts static routes`);
  }
}

/* ------------------------------------------------------------------ */
/* 4. Utility routes must be noindex                                   */
/* ------------------------------------------------------------------ */

const UTILITY_ROUTES = [
  'activate-warranty/[serialNumber]',
  'auth/change-password',
  'auth/login',
  'auth/signin',
  'auth/signout',
  'auth/signup',
  'auth/verification-success',
  'auth/verify-email',
  'auth/verify-otp',
  'cart',
  'checkout',
  'create-invoice',
  'embed/configurator',
  'lead-capture',
  'orders',
  'orders/[orderId]',
  'orders/[orderId]/invoice',
  'payment/[method]/[orderId]',
  'payment/cashfree/[orderId]',
  'payment/cashfree/[orderId]/confirm',
  'payment/failed',
  'payment/payu/[orderId]',
  'payment/success',
  'payment/upi/[orderId]',
  'profile',
  'projects',
  'quotes/[id]',
  'quotes/[id]/advance-payment',
  'seller/dashboard',
  'seller/kyc',
  'seller/login',
  'seller/register',
];

function segmentHasNoindex(routeDir) {
  // Walk from the route directory up to src/app checking page/layout files.
  let dir = join(appSrc, routeDir);
  while (dir.startsWith(appSrc)) {
    for (const candidate of ['page.tsx', 'layout.tsx']) {
      const content = read(join(dir, candidate));
      if (content && /index:\s*false/.test(content)) return true;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return false;
}

for (const route of UTILITY_ROUTES) {
  if (!segmentHasNoindex(route)) {
    errors.push(`utility route /${route}: not noindex (no \`index: false\` in page or ancestor layout)`);
  }
}

/* ------------------------------------------------------------------ */
/* 5. Local SEO: parent service pages must link to their location pages */
/* ------------------------------------------------------------------ */

const locationsSource = read(join(appDir, 'src/lib/locations.ts'));
requireSnippet('locations registry', locationsSource, 'SERVICE_LOCATIONS');

if (locationsSource) {
  const locationUrlRe = /url: '(\/services\/[a-z0-9\-/]+)'/g;
  const serviceUrlRe = /serviceUrl: '(\/services\/[a-z0-9\-]+)'/g;
  const serviceUrls = [...locationsSource.matchAll(serviceUrlRe)].map((m) => m[1]);
  const locationUrls = [...locationsSource.matchAll(locationUrlRe)].map((m) => m[1]).filter((u) => !serviceUrls.includes(u));

  for (const serviceUrl of serviceUrls) {
    const pageContent = read(join(appSrc, serviceUrl.slice(1), 'page.tsx'));
    requireSnippet(`${serviceUrl} page`, pageContent, 'ServiceLocations');
  }

  for (const locationUrl of locationUrls) {
    const pagePath = join(appSrc, locationUrl.slice(1), 'page.tsx');
    if (!existsSync(pagePath)) errors.push(`locations registry: ${locationUrl} has no page.tsx`);
    if (sitemap && !sitemap.includes(`\${baseUrl}${locationUrl}`)) {
      errors.push(`locations registry: ${locationUrl} missing from sitemap.ts`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* 6. Claim governance: no unverified certification/compliance claims    */
/* ------------------------------------------------------------------ */

import { readdirSync, statSync } from 'node:fs';

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    if (statSync(abs).isDirectory()) walk(abs, out);
    else if (/\.(tsx|ts|mdx)$/.test(entry)) out.push(abs);
  }
  return out;
}

const BANNED_CLAIM_PATTERNS = [
  [/\bHIPAA\b/i, 'HIPAA compliance claim'],
  [/\b[Ff]luke\b/, 'Fluke certification claim'],
  [/\b[Aa]uthorized (partner|reseller|distributor|dealer|retailer)\b/i, 'unverified authorized-partner claim'],
  [/\b[Vv]erified [Dd]eployment\b/, 'unverified verified-deployment claim'],
  [/\b[Cc]ertified [Cc]able [Tt]esting\b/, 'unverified cable-certification claim'],
];

const publicSrc = join(appDir, 'src');
for (const file of walk(publicSrc)) {
  // The credentials registry itself is allowed to mention claim labels.
  if (file.includes('verified-credentials')) continue;
  const content = read(file);
  if (!content) continue;
  const rel = file.replace(root + '\\', '').replace(root + '/', '');
  for (const [pattern, label] of BANNED_CLAIM_PATTERNS) {
    if (pattern.test(content)) {
      errors.push(`claim governance: ${rel} contains ${label} — use UNVERIFIED_WORDING from @tecbunny/core/verified-credentials`);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Report                                                              */
/* ------------------------------------------------------------------ */

for (const warning of warnings) console.warn(`WARN  ${warning}`);

if (errors.length > 0) {
  console.error('\nSEO contract validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s).`);
  process.exitCode = 1;
} else {
  console.log(`Validated SEO/AI-discovery contract: ${PUBLIC_ROUTES.length} public routes, ${UTILITY_ROUTES.length} utility routes, global discovery surface.`);
  if (warnings.length > 0) console.log(`${warnings.length} warning(s) above are advisory.`);
}
