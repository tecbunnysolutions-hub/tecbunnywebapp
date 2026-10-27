import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import postcss from 'postcss';

const apps = ['public', 'mgmt', 'superadmin', 'api', 'waba', 'webmail'];
const css = readFileSync('packages/ui/src/styles/tokens.css', 'utf8');
const tree = postcss.parse(css);
const light = {};
const dark = {};
tree.walkRules(rule => {
  if (![':root', ':root.dark'].includes(rule.selector)) return;
  for (const declaration of rule.nodes) {
    if (declaration.type === 'decl' && declaration.prop.startsWith('--')) {
      (rule.selector === ':root.dark' ? dark : light)[declaration.prop] = declaration.value;
    }
  }
});
function resolve(tokens, key) {
  const value = tokens[key];
  assert.ok(value, `Missing ${key}`);
  return value.replace(/var\((--[\w-]+)\)/g, (_, name) => resolve(tokens, name));
}
function luminance(channels) {
  const [h, saturation, lightness] = channels.replaceAll('%', '').split(/\s+/).map(Number);
  const s = saturation / 100, l = lightness / 100;
  const a = s * Math.min(l, 1 - l);
  const rgb = [0, 8, 4].map(n => {
    const k = (n + h / 30) % 12;
    const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return rgb.reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
}
const pairs = [
  ['foreground', 'background', 4.5], ['foreground', 'card', 4.5],
  ['muted-foreground', 'card', 4.5], ['muted-foreground', 'background', 4.5],
  ['primary-foreground', 'primary', 4.5], ['primary-foreground', 'primary-hover', 4.5],
  ['accent-foreground', 'accent', 4.5], ['success-foreground', 'success', 4.5],
  ['warning-foreground', 'warning', 4.5], ['destructive-foreground', 'destructive', 4.5],
  ['success', 'card', 4.5], ['warning', 'card', 4.5], ['destructive', 'card', 4.5],
  ['primary', 'card', 4.5], ['input', 'card', 3], ['ring', 'background', 3],
];
const contrast = [];
for (const [mode, tokens] of [['light', light], ['dark', { ...light, ...dark }]]) {
  for (const [foreground, background, minimum] of pairs) {
    const a = luminance(resolve(tokens, '--' + foreground));
    const b = luminance(resolve(tokens, '--' + background));
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    contrast.push({ mode, foreground, background, ratio: Number(ratio.toFixed(2)), minimum });
    assert.ok(ratio >= minimum, `${mode} ${foreground}/${background}: ${ratio.toFixed(2)} < ${minimum}`);
  }
}
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
}
const ledger = readFileSync('docs/redesign/coverage-ledger.md', 'utf8');
const originalPages = new Set([...ledger.matchAll(/apps\/[\w-]+\/src\/app\/[^\s|`]*page\.tsx/g)].map(match => match[0]));
const pages = apps.flatMap(app => walk(`apps/${app}/src/app`)).filter(file => /(?:^|[\\/])page\.tsx$/.test(file)).map(file => file.replaceAll('\\', '/'));
assert.equal(pages.length, originalPages.size, 'Page entrypoint count changed; reconcile the ledger');
for (const file of pages) assert.ok(originalPages.has(file), `Page absent from ledger: ${file}`);
for (const file of originalPages) assert.ok(existsSync(file), `Original page removed: ${file}`);
for (const app of apps) {
  const source = readFileSync(`apps/${app}/src/app/globals.css`, 'utf8');
  assert.ok(source.includes('packages/ui/src/styles/tokens.css'), `${app} does not consume shared tokens`);
  postcss.parse(source);
  assert.ok(readFileSync(`apps/${app}/src/app/layout.tsx`, 'utf8').includes(app === 'public' ? 'ThemeProvider' : 'ThemeControls'));
}
const report = { pagesPreserved: pages.length, appsUsingSharedTokens: apps, contrast, scope: 'Source and token invariants; not a full accessibility or workflow certification.' };
if (process.argv.includes('--build')) {
  for (const app of apps) assert.ok(existsSync(`apps/${app}/.next/BUILD_ID`), `Missing production build for ${app}`);
  const manifest = JSON.parse(readFileSync('apps/public/.next/routes-manifest.json', 'utf8'));
  const csp = manifest.headers.flatMap(route => route.headers).find(header => header.key.toLowerCase() === 'content-security-policy')?.value;
  assert.ok(csp, 'Production response policy missing');
  assert.ok(csp.split(';').find(rule => rule.trim().startsWith('script-src '))?.includes('https://challenges.cloudflare.com'), 'Existing CAPTCHA script host is blocked');
  assert.ok(csp.split(';').find(rule => rule.trim().startsWith('frame-src '))?.includes('https://challenges.cloudflare.com'), 'Existing CAPTCHA frame host is blocked');
  assert.ok(!csp.includes("'unsafe-eval'"), 'Development script evaluation escaped into production');
  report.productionBuildsPresent = apps;
  report.productionCaptchaPolicy = 'verified';
}
writeFileSync('docs/redesign/source-validation.json', JSON.stringify(report, null, 2) + '\n');
console.log(`Validated ${pages.length} preserved page entrypoints, ${apps.length} shared-theme consumers, and ${contrast.length} contrast pairs.`);
