import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const extensionDir = path.join(root, 'extension');

const requiredFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'popup.js',
  'options.html',
  'options.js',
  'README.md',
  'icons/icon16.png',
  'icons/icon32.png',
  'icons/icon48.png',
  'icons/icon128.png',
];

const requiredApiFiles = [
  'apps/api/src/app/api/extension-security.ts',
  'apps/api/src/app/api/auth/extension/route.ts',
  'apps/api/src/app/api/products/scraper/route.ts',
  'apps/api/src/app/api/products/scraper/ai/route.ts',
  'packages/core/src/image-processor.ts',
];

function fail(message) {
  throw new Error(`[chrome-extension] ${message}`);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) fail(message);
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(extensionDir, file)), `missing extension file: ${file}`);
}

for (const file of requiredApiFiles) {
  assert(fs.existsSync(path.join(root, file)), `missing API/core file: ${file}`);
}

const manifest = JSON.parse(read('extension/manifest.json'));
assert(manifest.manifest_version === 3, 'manifest_version must be 3');
assert(manifest.minimum_chrome_version, 'minimum_chrome_version is required');
assert(!manifest.host_permissions?.includes('<all_urls>'), 'host_permissions must not include <all_urls>');
assert(manifest.host_permissions?.length === 1 && manifest.host_permissions[0] === 'https://www.tecbunny.com/*', 'host_permissions must be limited to Tecbunny API origin');
assert(manifest.permissions?.includes('activeTab'), 'activeTab permission is required for user-initiated scraping');
assert(manifest.permissions?.includes('scripting'), 'scripting permission is required for executeScript');
assert(manifest.permissions?.includes('storage'), 'storage permission is required for session state');
assert(manifest.options_page === 'options.html', 'options_page must be options.html');

const csp = manifest.content_security_policy?.extension_pages || '';
assert(csp.includes("script-src 'self'"), 'CSP must restrict scripts to self');
assert(csp.includes("object-src 'none'"), 'CSP must disable object sources');
assert(csp.includes('connect-src https://www.tecbunny.com'), 'CSP must restrict connections to Tecbunny API');

for (const iconPath of Object.values(manifest.icons || {})) {
  const icon = fs.readFileSync(path.join(extensionDir, iconPath));
  assert(icon.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), `${iconPath} must be a PNG`);
}

const popupHtml = read('extension/popup.html');
assert(!/fonts\.googleapis|fonts\.gstatic/.test(popupHtml), 'popup must not load remote fonts');
assert(!/<script[^>]+https?:\/\//i.test(popupHtml), 'popup must not load remote scripts');

const extensionSources = ['extension/background.js', 'extension/content.js', 'extension/popup.js', 'extension/options.js']
  .map((file) => read(file))
  .join('\n');

assert(!/eval\s*\(|new Function\s*\(/.test(extensionSources), 'extension must not use eval or Function constructor');
assert(!/chrome\.storage\.local\.set\([^)]*(superadminPass|accessToken)/s.test(read('extension/popup.js')), 'tokens/passwords must not be stored in chrome.storage.local');
assert(/chrome\.storage\.session\.set\(\{ accessToken/.test(read('extension/popup.js')), 'accessToken must be stored in chrome.storage.session');
assert(/validateProductPayload/.test(read('extension/background.js')), 'background messages must validate product payloads');
assert(/slice\(0, MAX_RAW_TEXT_LENGTH\)/.test(read('extension/content.js')), 'content script must cap raw text');

const extensionSecurity = read('apps/api/src/app/api/extension-security.ts');
assert(/CHROME_EXTENSION_ID/.test(extensionSecurity), 'API CORS must support configured Chrome extension ID');
assert(/CHROME_EXTENSION_ALLOWED_ORIGINS/.test(extensionSecurity), 'API CORS must support configured allowed extension origins');
assert(!/Access-Control-Allow-Origin['"]:\s*['"]\*/.test(extensionSecurity), 'extension security helper must not allow wildcard CORS');

const authRoute = read('apps/api/src/app/api/auth/extension/route.ts');
assert(!/refresh_token/.test(authRoute), 'extension auth route must not return refresh tokens');
assert(/assertExtensionOrigin/.test(authRoute), 'extension auth route must validate origin');

const scraperRoute = read('apps/api/src/app/api/products/scraper/route.ts');
assert(/requireExtensionAdmin/.test(scraperRoute), 'scraper route must require extension admin auth');
assert(/status:\s*'draft'/.test(scraperRoute), 'scraped products must be created as draft');
assert(!/is_active\s*:/.test(scraperRoute), 'scraper route must not write schema-dependent is_active column');

const aiRoute = read('apps/api/src/app/api/products/scraper/ai/route.ts');
assert(/requireExtensionAdmin/.test(aiRoute), 'AI scraper route must require extension admin auth');

const imageProcessor = read('packages/core/src/image-processor.ts');
assert(/validatePublicRemoteUrl/.test(imageProcessor), 'external image processor must validate public remote URLs');
assert(/redirect:\s*'manual'/.test(imageProcessor), 'external image processor must block redirect-following fetches');
assert(/content-type/.test(imageProcessor), 'external image processor must check response content type');
assert(/return ''/.test(imageProcessor), 'external image processor must fail closed without preserving unsafe source URLs');

console.log('Chrome extension enterprise validation passed.');