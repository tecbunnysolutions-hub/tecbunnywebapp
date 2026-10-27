const { chromium } = require('playwright');
const fs = require('fs');

// Exercise existing preview tabs without submitting a draft or changing orders.
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const results = [];
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.goto('http://localhost:9003/seller/dashboard', { waitUntil: 'domcontentloaded' });
    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.locator('select[aria-label="Color theme"]').selectOption(width === 390 ? 'dark' : 'light');
      for (const tab of ['OVERVIEW', 'PRODUCTS', 'ORDERS', 'SETTLEMENTS']) {
        await page.getByRole('button', { name: tab, exact: true }).click();
        const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
        results.push({ width, tab, ...dimensions, overflow: dimensions.document > dimensions.viewport });
      }
    }
    fs.writeFileSync('docs/redesign/seller-layout-results.json', JSON.stringify(results, null, 2) + '\n');
    if (results.some(result => result.overflow)) throw new Error('Seller preview tab overflow found');
    console.log(`Passed ${results.length} seller tab/viewport checks without submitting data.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
