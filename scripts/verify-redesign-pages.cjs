const { chromium } = require('playwright');
const fs = require('fs');

// Read-only page checks. No forms are submitted and no business records change.
const defaultRoutes = [
  '/', '/about', '/services', '/services/cctv-security', '/services/it-support',
  '/services/rfid-locks', '/services/networking', '/webdev', '/contact',
  '/products', '/cart', '/checkout', '/auth/signin', '/auth/signup',
  '/search?query=wifi', '/search?query=unmatched-example', '/portfolio',
  '/resources', '/resources/cctv-planning-guide', '/resources/infrastructure-planning-guide',
  '/info/faqs', '/info/policies', '/info/policies/privacy', '/info/policies/terms',
  '/info/policies/shipping', '/info/policies/return', '/info/policies/refund-cancellation',
  '/info/policies/cookie', '/blog', '/offers', '/customised-setups', '/solutions',
  '/assessment', '/lead-capture', '/about/business-info', '/agents/recruit',
  '/seller/login', '/seller/register', '/seller/kyc', '/seller/dashboard',
  '/payment/failed', '/payment/success', '/auth/verify-email', '/auth/verify-otp',
  '/auth/verification-success', '/auth/change-password', '/profile', '/orders',
  '/ai-research', '/embed/configurator', '/redesign-missing-page',
];
const routes = process.argv.slice(2).length ? process.argv.slice(2) : defaultRoutes;
const baseUrl = process.env.REDESIGN_BASE_URL || 'http://localhost:9003';
const outputPrefix = process.env.REDESIGN_APP || 'public';

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const results = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    const settleTheme = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    for (const path of routes) {
      const errors = [];
      const listener = error => errors.push(error.message);
      page.on('pageerror', listener);
      try {
        const response = await page.goto(baseUrl + path, { waitUntil: 'domcontentloaded', timeout: 120000 });
        const select = page.locator('select[aria-label="Color theme"]');
        await select.selectOption('light', { timeout: 30000 });
        await page.waitForFunction(() => document.documentElement.classList.contains('light'));
        await settleTheme();
        const consent = page.getByRole('button', { name: 'Reject', exact: true });
        if (await consent.isVisible()) await consent.click();
        const light = await page.evaluate(() => ({
          title: document.title,
          headings: [...document.querySelectorAll('h1')].map(node => node.textContent),
          overflow: document.documentElement.scrollWidth > innerWidth,
          background: getComputedStyle(document.body).backgroundColor,
        }));
        if (path === '/') {
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.screenshot({ path: `docs/redesign/${outputPrefix}-home-preview.png` });
        }
        await page.setViewportSize({ width: 390, height: 844 });
        await select.selectOption('dark');
        await page.waitForFunction(() => document.documentElement.classList.contains('dark'));
        await settleTheme();
        const mobile = await page.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth,
          background: getComputedStyle(document.body).backgroundColor,
        }));
        const name = path === '/' ? 'home' : path.split('?')[0].slice(1).replaceAll('/', '-');
        const capture = ['/', '/about', '/services/cctv-security', '/contact', '/cart', '/auth/signin', '/portfolio'];
        if (capture.includes(path) || outputPrefix !== 'public') await page.screenshot({ path: `docs/redesign/${outputPrefix}-${name}-dark-mobile.png`, fullPage: true });
        await page.setViewportSize({ width: 1440, height: 1000 });
        await select.selectOption('light');
        await page.waitForFunction(() => document.documentElement.classList.contains('light'));
        await settleTheme();
        if (capture.includes(path) || outputPrefix !== 'public') await page.screenshot({ path: `docs/redesign/${outputPrefix}-${name}-light-desktop.png`, fullPage: true });
        results.push({ path, url: page.url(), status: response.status(), light, mobile, errors: [...new Set(errors)] });
        console.log(path, response.status(), light.overflow || mobile.overflow ? 'OVERFLOW' : 'width OK', errors.length ? `errors: ${errors.length}` : '');
      } catch (error) {
        results.push({ path, error: error.message });
        console.log(path, 'FAILED', error.message.split('\n')[0]);
      } finally {
        page.removeListener('pageerror', listener);
        fs.writeFileSync(`docs/redesign/${outputPrefix}-browser-results.json`, JSON.stringify(results, null, 2) + '\n');
      }
    }
    if (!routes.includes('/services/cctv-security')) return;
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(baseUrl + '/services/cctv-security', { waitUntil: 'domcontentloaded' });
    const trigger = page.getByRole('button', { name: 'Book a site visit', exact: true }).first();
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Book a site visit' });
    await dialog.waitFor();
    const focusEnteredDialog = await dialog.evaluate(node => node.contains(document.activeElement));
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden' });
    const interaction = {
      focusEnteredDialog,
      escapeClosed: await dialog.count() === 0,
      focusReturned: await trigger.evaluate(node => node === document.activeElement),
      tabletOverflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    };
    fs.writeFileSync('docs/redesign/interaction-results.json', JSON.stringify(interaction, null, 2) + '\n');
    await page.screenshot({ path: 'docs/redesign/service-tablet.png', fullPage: true });
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
