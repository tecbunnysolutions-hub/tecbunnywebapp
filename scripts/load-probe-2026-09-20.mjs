// One-off load probe: 60 requests, 10 concurrent, against production /api/products.
// Evidence drill for load-testing-runtime.md (2026-09-20).
const url = 'https://www.tecbunny.com/api/products?limit=1';
const TOTAL = 60;
const CONC = 10;

(async () => {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < TOTAL) {
      const i = idx++;
      const t0 = Date.now();
      try {
        const r = await fetch(url);
        await r.arrayBuffer();
        results.push({ i, status: r.status, ms: Date.now() - t0 });
      } catch (e) {
        results.push({ i, status: 'ERR', ms: Date.now() - t0, err: String(e).slice(0, 80) });
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));
  const times = results.map((r) => r.ms).sort((a, b) => a - b);
  const p = (q) => times[Math.min(times.length - 1, Math.floor(q * times.length))];
  const byStatus = {};
  for (const r of results) byStatus[r.status] = (byStatus[r.status] || 0) + 1;
  console.log('total=' + results.length, 'statuses=' + JSON.stringify(byStatus));
  console.log(
    'min=' + times[0] + 'ms p50=' + p(0.5) + 'ms p95=' + p(0.95) +
    'ms p99=' + p(0.99) + 'ms max=' + times[times.length - 1] + 'ms'
  );
  const errs = results.filter((r) => r.err || r.status >= 400);
  console.log('errors=' + errs.length);
  if (errs.length) console.log(errs.slice(0, 5));
})();
