import { readFile } from 'node:fs/promises';
import { createSign } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const account = process.env.GOOGLE_MERCHANT_ACCOUNT_ID || '5887848614';
const source = process.env.GOOGLE_MERCHANT_DATA_SOURCE_ID || '10787386542';
const site = 'https://www.tecbunny.com';
const api = 'https://merchantapi.googleapis.com';

export function productInput(p) {
  const price = ['offer_price', 'selling_price', 'mrp', 'dealer_price']
    .map(k => Number(p[k])).find(n => Number.isFinite(n) && n > 0);
  const text = value => String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const title = text(p.title || p.name);
  const description = text(p.description || p.body_html || p.details);
  const condition = String(p.condition || 'new').toUpperCase();
  if (!p.id || !price || !title || !description || !p.image || p.is_service || p.isService ||
      p.is_active === false || p.is_deleted || p.deleted_at ||
      (p.status && !['active', 'published'].includes(p.status.toLowerCase())) ||
      !['NEW', 'USED', 'REFURBISHED'].includes(condition)) return null;
  let imageLink;
  try {
    imageLink = new URL(p.image, site);
    if (!['https:', 'http:'].includes(imageLink.protocol)) return null;
  } catch { return null; }
  const status = String(p.stock_status || '').toLowerCase().replace(/ /g, '_');
  const availability = status === 'out_of_stock' || Number(p.stock_quantity) === 0 ? 'OUT_OF_STOCK'
    : status === 'in_stock' || Number(p.stock_quantity) > 0 ? 'IN_STOCK' : null;
  if (!availability) return null;
  return {
    offerId: String(p.id), contentLanguage: 'en', feedLabel: 'IN',
    productAttributes: {
      title: title.slice(0, 150), description: description.slice(0, 5000),
      link: `${site}/products/${encodeURIComponent(p.id)}`, imageLink: imageLink.href,
      condition, availability,
      price: { amountMicros: String(Math.round(price * 1_000_000)), currencyCode: 'INR' },
      ...(p.brand || p.vendor ? { brand: text(p.brand || p.vendor) } : {}),
      ...(p.gtin ? { gtins: [String(p.gtin)] } : {}),
      ...(p.mpn ? { mpn: String(p.mpn) } : {}),
    },
  };
}

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(30_000) });
  const body = await response.json();
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${body.error?.message || body.error || 'Request failed'}`);
    error.status = response.status;
    throw error;
  }
  return body;
}

async function accessToken() {
  const file = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!file) throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS to the service account JSON file path.');
  const key = JSON.parse(await readFile(file, 'utf8'));
  if (!key.client_email || !key.private_key) throw new Error('Invalid service account JSON.');
  const encode = value => Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iss: key.client_email, scope: 'https://www.googleapis.com/auth/content',
    aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600,
  })}`;
  const signature = createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url');
  const result = await jsonRequest('https://oauth2.googleapis.com/token', {
    method: 'POST', body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}`,
    }),
  });
  if (!result.access_token) throw new Error('Google did not return an access token.');
  return result.access_token;
}

export async function main() {
  if (process.argv.includes('--status')) {
    const token = await accessToken();
    const headers = { Authorization: `Bearer ${token}` };
    const dataSource = await jsonRequest(`${api}/datasources/v1/accounts/${account}/dataSources/${source}`, { headers });
    console.log(JSON.stringify({ dataSource }));
    let pageToken = '';
    let total = 0;
    const issues = {};
    const sourceCounts = {};
    do {
      const result = await jsonRequest(`${api}/products/v1/accounts/${account}/products?pageSize=250&pageToken=${encodeURIComponent(pageToken)}`, { headers });
      for (const product of result.products || []) {
        total++;
        sourceCounts[product.dataSource] = (sourceCounts[product.dataSource] || 0) + 1;
        for (const issue of product.productStatus?.itemLevelIssues || []) {
          const key = `${issue.code}: ${issue.description}`;
          issues[key] = (issues[key] || 0) + 1;
        }
        if (total <= 2) console.log(JSON.stringify({ offerId: product.offerId, title: product.productAttributes?.title, status: product.productStatus?.destinationStatuses }));
      }
      pageToken = result.nextPageToken || '';
    } while (pageToken);
    console.log(JSON.stringify({ totalProcessedProducts: total, sourceCounts, issues }));
    return;
  }
  if (process.argv.includes('--register')) {
    const developerEmail = process.env.GOOGLE_MERCHANT_DEVELOPER_EMAIL;
    if (!developerEmail) throw new Error('Set GOOGLE_MERCHANT_DEVELOPER_EMAIL to an existing Merchant Center user email.');
    const token = await accessToken();
    const result = await jsonRequest(`${api}/accounts/v1/accounts/${account}/developerRegistration:registerGcp`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ developerEmail }),
    });
    console.log(JSON.stringify(result));
    return;
  }
  const dryRun = !process.argv.includes('--apply');
  if (!/^\d+$/.test(account) || !/^\d+$/.test(source)) throw new Error('Account and source IDs must be numeric.');
  const inputs = [];
  const seen = new Set();
  let skipped = 0;
  for (let page = 1; ; page++) {
    const result = await jsonRequest(`${site}/api/products?limit=100&page=${page}`);
    if (!result.success || !Array.isArray(result.data) || result.warnings?.length) {
      throw new Error('Catalogue unavailable or incomplete; refusing to sync.');
    }
    for (const product of result.data) {
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      const input = productInput(product);
      if (input) inputs.push(input);
      else { skipped++; console.log(`Skipped ${product.id}: incomplete data, service, or hidden product`); }
    }
    if (page >= result.pagination?.pages || result.data.length < 100) break;
    if (page >= 1000) throw new Error('Catalogue pagination exceeded safety limit.');
  }
  console.log(JSON.stringify({ mode: dryRun ? 'preview' : 'apply', account, source, eligible: inputs.length, skipped }));
  if (dryRun || !inputs.length) return;
  let token;
  let expiresAt = 0;
  let failed = 0;
  for (const input of inputs) {
    if (Date.now() >= expiresAt) { token = await accessToken(); expiresAt = Date.now() + 50 * 60_000; }
    try {
      await jsonRequest(`${api}/products/v1/accounts/${account}/productInputs:insert?dataSource=accounts/${account}/dataSources/${source}`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      console.log(`Uploaded ${input.offerId}`);
    } catch (error) {
      if ([401, 403, 429].includes(error.status)) throw error;
      failed++; console.error(`${input.offerId}: ${error.message}`);
    }
  }
  if (failed) throw new Error(`${failed} product uploads failed; rerun to retry (IDs are stable).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
