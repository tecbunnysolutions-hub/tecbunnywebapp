import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';
import pg from 'pg';

// Read object identities from the restored snapshot, then fetch only those objects.
// Payloads and their private path manifest remain in the owner-only backup folder.
const base = 'C:/Users/tecbu/.codex/private-backups/tecbunny-readiness-20261030';
const directory = path.join(base, 'storage-capture');
assert.ok(!fs.existsSync(directory), 'Capture directory exists; inspect before retrying');
const config = JSON.parse(fs.readFileSync(path.join(base, 'native-restore/client.json')));
assert.equal(config.host, '127.0.0.1'); assert.equal(config.port, 15432);
const client = new pg.Client(config);
const env = dotenv.parse(fs.readFileSync('C:/TEC/tecbunnywebapp/.env.local'));
const origin = new URL(env.NEXT_PUBLIC_SUPABASE_URL);
assert.equal(origin.origin, 'https://yzrznydkqcacjiwalmlw.supabase.co');
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY;
assert.ok(key);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const normalETag = value => String(value ?? '').replace(/^W\//, '').replaceAll('"', '');
const report = { startedAt: new Date().toISOString(), status: 'fail', source: 'object identities and ETags from restored 30 October snapshot', objects: 0, bytes: 0 };
try {
  await client.connect();
  const objects = (await client.query('SELECT id,bucket_id,name,metadata FROM storage.objects ORDER BY id')).rows;
  assert.equal(objects.length, 230, 'Snapshot scope changed; review before export');
  fs.mkdirSync(directory); const manifest = []; let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < objects.length) {
      const item = objects[cursor++]; assert.match(item.id, /^[a-f0-9-]{36}$/);
      const url = new URL('/storage/v1/object/' + encodeURIComponent(item.bucket_id) + '/' + item.name.split('/').map(encodeURIComponent).join('/'), origin);
      const response = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` }, redirect: 'error', signal: AbortSignal.timeout(20_000) });
      assert.equal(response.status, 200, 'Object read failed; names and bodies are not logged');
      const bytes = Buffer.from(await response.arrayBuffer());
      assert.ok(bytes.length <= 16 * 1024 * 1024, 'Object exceeds export budget');
      const expected = normalETag(item.metadata?.eTag), actual = normalETag(response.headers.get('etag'));
      assert.ok(expected && actual && expected === actual, 'Object version differs from database snapshot');
      assert.equal(bytes.length, Number(item.metadata.size), 'Object size differs from snapshot');
      report.bytes += bytes.length; assert.ok(report.bytes <= 64 * 1024 * 1024);
      fs.writeFileSync(path.join(directory, `${item.id}.bin`), bytes, { flag: 'wx' });
      manifest.push({ id: item.id, bucket: item.bucket_id, name: item.name, bytes: bytes.length, sha256: digest(bytes), snapshotETagMatched: true });
      report.objects++;
    }
  }));
  fs.writeFileSync(path.join(directory, 'private-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  const tar = path.join(base, 'private-storage.tar');
  assert.equal(spawnSync('tar', ['-cf', tar, '-C', directory, '.'], { stdio: 'ignore' }).status, 0, 'Private archive creation failed');
  const encrypted = path.join(base, 'storage-backup.cms');
  assert.equal(spawnSync('C:/Program Files/Git/usr/bin/openssl.exe', ['cms', '-encrypt', '-stream', '-aes-256-gcm', '-binary',
    '-in', tar, '-out', encrypted, '-outform', 'DER', '-recip', path.join(base, 'recipient.pem'),
    '-keyopt', 'rsa_padding_mode:oaep', '-keyopt', 'rsa_oaep_md:sha256'], { stdio: 'ignore' }).status, 0, 'Storage encryption failed');
  report.status = 'pass'; report.snapshotETagsMatched = true; report.encryptedSha256 = digest(fs.readFileSync(encrypted));
  report.encryptedBytes = fs.statSync(encrypted).size;
  report.limitations = ['Files have not been restored to a separate Supabase Storage service', 'No recurring schedule or retention policy established'];
} catch (error) {
  report.failureCode = error.code ?? 'CAPTURE_FAILED'; console.error('Storage capture failed; inspect private state before retrying'); process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(base, 'storage-capture-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report)); await client.end();
}
