@echo off
setlocal

set /p PASSWORD="Enter new superadmin password: "

node -e "
const pass = '%PASSWORD%';
const enc = new TextEncoder();
async function run() {
  const buf = new ArrayBuffer(32);
  const salt = new Uint8Array(buf);
  crypto.getRandomValues(salt);
  const key = await crypto.subtle.importKey('raw', enc.encode(pass), 'PBKDF2', false, ['deriveBits']);
  const derived = new Uint8Array(await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-256', salt, iterations:600000 }, key, 256));
  const b64 = b => btoa(String.fromCharCode(...b)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  const hash = 'pbkdf2v1:600000:' + b64(salt) + ':' + b64(derived);
  console.log('');
  console.log('=== Copy this value into Vercel / your .env ===');
  console.log('');
  console.log('SUPERADMIN_PASSWORD_HASH=' + hash);
  console.log('');
  console.log('Then REMOVE SUPERADMIN_PASSWORD from your environment.');
  console.log('');
}
run().catch(e => { console.error(e.message); process.exit(1); });
"

pause
endlocal
