import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import readline from 'node:readline';
import pg from 'pg';

// Restore only into the separately initialized, private loopback test cluster.
const base = 'C:/Users/tecbu/.codex/private-backups/tecbunny-readiness-20261030';
const bin = 'C:/Users/tecbu/.codex/tools/postgresql-17.11-5/unpacked/pgsql/bin';
const config = JSON.parse(fs.readFileSync(path.join(base, 'native-restore/client.json')));
assert.equal(config.host, '127.0.0.1'); assert.equal(config.port, 15432);
assert.equal(config.user, 'readiness_restore'); assert.equal(config.database, 'postgres');
const metadata = JSON.parse(fs.readFileSync(path.join(base, 'source-metadata.json')));
const archive = path.join(base, 'private-database.dump');
assert.equal(fs.readFileSync(archive).subarray(0, 5).toString(), 'PGDMP');
const env = { ...process.env, PGHOST: '127.0.0.1', PGHOSTADDR: '127.0.0.1', PGPORT: '15432',
  PGUSER: config.user, PGDATABASE: 'postgres', PGPASSWORD: config.password, PGSSLMODE: 'disable' };
delete env.PGSERVICE; delete env.PGSERVICEFILE;
const quote = value => '"' + value.replaceAll('"', '""') + '"';
const client = new pg.Client({ ...config, connectionTimeoutMillis: 5000 });
const began = performance.now();
const report = { startedAt: new Date().toISOString(), environment: 'private native Windows PostgreSQL 17.11, loopback-only, synthetic operator credential',
  sourceCapture: '20261030T122433Z-11bd227c', status: 'fail', limitations: [
    'Logical application/Auth/storage-metadata restore; not managed Supabase failover',
    'Storage object bytes are separate: source has 230 objects, 8812253 bytes',
    'Provider configuration, database login passwords, schedules and sustained RPO are not restored',
    'Measured timing covers restore and row-count checks on a prepared target; excludes provisioning, key retrieval, transfer and service failover',
    'Source object owners remapped to the isolated restore operator; provider authentication and HTTP RBAC are not tested'] };
try {
  await client.connect();
  const identity = (await client.query('SELECT current_user,inet_server_port() AS port')).rows[0];
  assert.equal(identity.current_user, 'readiness_restore'); assert.equal(identity.port, 15432);
  for (const role of metadata.roles) {
    assert.notEqual(role.rolname, config.user);
    const exists = (await client.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [role.rolname])).rowCount;
    if (!exists) await client.query(`CREATE ROLE ${quote(role.rolname)} NOLOGIN ${role.rolsuper ? 'SUPERUSER' : 'NOSUPERUSER'} ${role.rolinherit ? 'INHERIT' : 'NOINHERIT'} ${role.rolbypassrls ? 'BYPASSRLS' : 'NOBYPASSRLS'}`);
  }
  await client.query('CREATE SCHEMA IF NOT EXISTS extensions');
  for (const extension of ['btree_gin', 'citext', 'pg_stat_statements', 'pg_trgm', 'pgcrypto', 'uuid-ossp']) {
    await client.query(`CREATE EXTENSION IF NOT EXISTS ${quote(extension)} WITH SCHEMA extensions`);
  }
  const log = fs.openSync(path.join(base, 'private-restore.log'), 'w');
  let result;
  try {
    result = spawnSync(path.join(bin, 'pg_restore.exe'), ['--clean', '--if-exists', '--exit-on-error', '--no-owner', '--no-password',
      '--host=127.0.0.1', '--port=15432', '--username=readiness_restore', '--dbname=postgres', archive],
    { env, stdio: ['ignore', log, log], timeout: 20 * 60_000 });
  } finally { fs.closeSync(log); }
  report.restoreExitCode = result.status; report.restoreErrorCode = result.error?.code ?? null;
  assert.equal(result.status, 0, `Native restore failed (exit ${result.status}); inspect the owner-only private log`);
  console.log('Native archive restore completed; checking all archived table row counts');
  const sqlFile = path.join(base, 'private-data-verification.sql');
  const output = fs.openSync(sqlFile, 'w');
  try {
    const extracted = spawnSync(path.join(bin, 'pg_restore.exe'), ['--data-only', '--file=-', archive], { env, stdio: ['ignore', output, 'pipe'], timeout: 120_000 });
    assert.equal(extracted.status, 0, 'Archive data verification extraction failed');
  } finally { fs.closeSync(output); }
  const expected = new Map(); let table = null;
  const identifier = '(?:[a-z_][a-z0-9_$]*|"(?:[^"]|"")+")';
  const relation = new RegExp(`^${identifier}\\.${identifier}$`);
  for await (const line of readline.createInterface({ input: fs.createReadStream(sqlFile), crlfDelay: Infinity })) {
    if (table !== null) {
      if (line === '\\.') table = null;
      else expected.set(table, expected.get(table) + 1);
    } else {
      const match = /^COPY (.+) \(.+\) FROM stdin;$/.exec(line);
      if (match) { assert.ok(relation.test(match[1]), 'Unexpected archive relation identifier'); table = match[1]; expected.set(table, 0); }
    }
  }
  assert.equal(table, null, 'Incomplete COPY data in archive');
  assert.ok(expected.size > 400, 'Incomplete application schema coverage');
  let rows = 0;
  for (const [name, count] of expected) {
    const actual = Number((await client.query(`SELECT count(*) AS n FROM ONLY ${name}`)).rows[0].n);
    assert.equal(actual, count, `Restored row count mismatch: ${name}`); rows += actual;
  }
  report.status = 'pass'; report.tablesVerified = expected.size; report.rowsVerified = rows;
  report.policiesRestored = Number((await client.query('SELECT count(*) AS n FROM pg_policies')).rows[0].n);
  report.recoveryVerificationMs = Math.round(performance.now() - began);
  report.withinApproved60MinuteDataRestoreTarget = report.recoveryVerificationMs < 3_600_000;
  console.log(JSON.stringify({ status: report.status, tablesVerified: expected.size, rowsVerified: rows, recoveryVerificationMs: report.recoveryVerificationMs }));
} catch (error) {
  report.failure = error instanceof assert.AssertionError ? error.message : error.code ?? 'private restore error';
  console.error(`Native recovery failed: ${report.failure}`); process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(base, 'native-recovery-report.json'), JSON.stringify(report, null, 2) + '\n');
  await client.end();
}
