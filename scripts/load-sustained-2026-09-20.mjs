// Sustained load probe: 200 requests, 20 concurrent, against production public endpoints.
// Evidence drill for load-testing-runtime.md (2026-09-20, heavier profile).
const targets = [
  'https://www.tecbunny.com/api/products?limit=1',
  'https://www.tecbunny.com/api/offers',
  'https://www.tecbunny.com/api/settings',
];
const TOTAL = 200;
const CONC = 20;

(async () => {
  const results = [];
  let idx = 0;
  const started = Date.now();
  async function worker() {
    while (idx < TOTAL) {
      const i = idx++;
      const url = targets[i % targets.length];
      const t0 = Date.now();
      try {
        const r = await fetch(url);
        await r.arrayBuffer();
        results.push({ i, url, status: r.status, ms: Date.now() - t0 });
      } catch (e) {
        results.push({ i, url, status: 'ERR', ms: Date.now() - t0, err: String(e).slice(0, 80) });
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  const elapsed = (Date.now() - started) / 1000;
  const times = results.map((r) => r.ms).sort((a, b) => a - b);
  const p = (q) => times[Math.min(times.length - 1, Math.floor(q * times.length))];
  const byStatus = {};
  for (const r of results) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  const byUrl = {};
  for (const r of results) {
    const k = r.url.split('/api/')[1];
    byUrl[k] = byUrl[k] || { n: 0, errs: 0, max: 0 };
    byUrl[k].n++;
    if (r.status !== 200) byUrl[k].errs++;
    byUrl[k].max = Math.max(byUrl[k].max, r.ms);
  }
  console.log('elapsed=' + elapsed.toFixed(1) + 's rps=' + (TOTAL / elapsed).toFixed(1));
  console.log('total=' + results.length, 'statuses=' + JSON.stringify(byStatus));
  console.log(
    'min=' + times[0] + 'ms p50=' + p(0.5) + 'ms p90=' + p(0.9) +
    'ms p95=' + p(0.95) + 'ms p99=' + p(0.99) + 'ms max=' + times[times.length - 1] + 'ms'
  );
  console.log('per-endpoint:', JSON.stringify(byUrl, null, 1));
  const errs = results.filter((r) => r.err || r.status >= 400);
  console.log('errors=' + errs.length);
  if (errs.length) console.log(errs.slice(0, 5));
})();
