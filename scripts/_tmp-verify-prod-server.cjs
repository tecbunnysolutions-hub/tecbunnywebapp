const http = require('http');
const fs = require('fs');

function get(path) {
  return new Promise((resolve, reject) => {
    http
      .get({ host: 'localhost', port: 9010, path }, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      })
      .on('error', reject);
  });
}

(async () => {
  const home = await get('/');
  console.log('HOME status:', home.status);
  console.log('HOME cache-control:', home.headers['cache-control']);
  console.log('HOME CSP:', home.headers['content-security-policy'] ? 'present' : 'none');

  const ck = await get('/checkout');
  console.log('CHECKOUT status:', ck.status, '(', ck.headers['location'] || 'no-redirect', ')');
  console.log('CHECKOUT cache-control:', ck.headers['cache-control']);
  console.log('CHECKOUT CSP:', ck.headers['content-security-policy'] ? 'present' : 'none');

  fs.writeFileSync(process.env.TEMP + '/checkout-prod.html', ck.body);
  fs.writeFileSync(process.env.TEMP + '/home-prod.html', home.body);

  const scripts = ck.body.match(/<script[^>]*src="[^"]*_next[^"]*"[^>]*>/g) || [];
  console.log('CHECKOUT framework scripts found:', scripts.length);
  const nonced = scripts.filter((s) => s.includes('nonce=')).length;
  console.log('CHECKOUT framework scripts WITH nonce:', nonced);
  if (scripts[0]) console.log('sample:', scripts[0].slice(0, 220));
})();
