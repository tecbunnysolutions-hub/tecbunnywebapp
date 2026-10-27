const { chromium } = require('playwright');
const fs = require('fs');

// Read-only layout checks; no customer or payment forms are submitted.
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    for (const width of [1366, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/services/it-support', '/services', '/about', '/products', '/cart', '/checkout', '/info/faqs', '/resources', '/customised-setups', '/create-invoice']) {
        await page.goto(`http://127.0.0.1:9003${route}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(350);
        const result = await page.evaluate(() => {
          const header = document.querySelector('#navbar');
          const heading = document.querySelector('main h1');
          const hero = document.querySelector('main .tb-hero');
          const nav = document.querySelector('#navbar nav');
          const links = nav ? [...nav.querySelectorAll('a')] : [];
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            heading: heading?.textContent,
            headingFromHeader: heading && header ? Math.round(heading.getBoundingClientRect().top - header.getBoundingClientRect().bottom) : null,
            heroPadding: hero ? getComputedStyle(hero).paddingTop : null,
            navFont: links[0] ? getComputedStyle(links[0]).fontSize : null,
            navFits: !nav || !nav.getBoundingClientRect().width || links.every(a => a.getBoundingClientRect().left >= nav.getBoundingClientRect().left && a.getBoundingClientRect().right <= nav.getBoundingClientRect().right),
          };
        });
        results.push({ route, width, ...result });
        if (route === '/services/it-support') await page.screenshot({ path: `docs/redesign/spacing-it-support-${width}.png`, fullPage: false });
        console.log(JSON.stringify(results.at(-1)));
      }
    }
    await page.goto('http://127.0.0.1:9003/services/it-support', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Toggle navigation', exact: true }).click();
    const home = page.locator('#mobile-menu').getByRole('link', { name: 'Home', exact: true });
    await home.waitFor({ state: 'visible' });
    await home.click();
    await page.waitForURL('http://127.0.0.1:9003/');
    results.push({ check: 'mobile Home navigation', passed: true });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('http://127.0.0.1:9003/services/it-support', { waitUntil: 'domcontentloaded' });
    const desktopHome = page.locator('#navbar nav').getByRole('link', { name: 'Home', exact: true });
    await desktopHome.waitFor({ state: 'visible' });
    await desktopHome.click();
    await page.waitForURL('http://127.0.0.1:9003/');
    results.push({ check: 'desktop Home navigation at 1280px', passed: true });
    if (results.some(r => r.overflow || r.navFits === false)) process.exitCode = 1;
  } finally {
    fs.writeFileSync('docs/redesign/spacing-browser-results.json', JSON.stringify(results, null, 2) + '\n');
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
