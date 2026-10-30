import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { PGlite } from '@electric-sql/pglite';

// Synthetic, isolated PostgreSQL fixture. This does NOT export production or
// establish managed Supabase recovery, storage recovery, API RBAC, or capacity.
const output = new URL('../scratch/readiness-fixture/', import.meta.url);
const sha = value => createHash('sha256').update(value).digest('hex');
const uid = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const roles = ['manager', 'sales_manager', 'sales', 'sales-staff', 'sales-external',
  'sales_executive', 'store_executive', 'sales_agent', 'marketing_executive',
  'support', 'delivery', 'warehouse', 'hr', 'marketing_manager', 'service_manager',
  'service_engineer', 'accounts', 'admin', 'superadmin', 'customer', 'seller', 'unknown'];
let assertions = 0;
const equal = (actual, expected, message) => { assert.deepEqual(actual, expected, message); assertions++; };
const denied = async operation => { await assert.rejects(operation, error => error.code === '42501'); assertions++; };
let db = new PGlite();
const migrations = {};
try {
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
    CREATE TABLE public.profiles(id uuid PRIMARY KEY,email text,role text,company_id text,branch_id text);
    INSERT INTO public.profiles VALUES
      ('${uid(1)}','one@example.test','sales_manager','org-a','branch-a'),
      ('${uid(2)}','two@example.test','sales_manager','org-a','branch-b'),
      ('${uid(3)}','three@example.test','sales_manager','org-b','branch-a');
    CREATE TABLE public."Conversation"(sender_number text PRIMARY KEY,assigned_to uuid REFERENCES public.profiles(id));
    CREATE TABLE public."Message"(id text PRIMARY KEY,sender_number text REFERENCES public."Conversation"(sender_number));
    INSERT INTO public."Conversation" VALUES ('own','${uid(1)}'),('other-branch','${uid(2)}'),('other-org','${uid(3)}'),('unowned',NULL);
    INSERT INTO public."Message" VALUES ('m-own','own'),('m-other-branch','other-branch'),('m-other-org','other-org'),('m-unowned','unowned');
    CREATE POLICY legacy_open ON public."Conversation" FOR SELECT TO authenticated USING (true);
    CREATE POLICY legacy_open ON public."Message" FOR SELECT TO authenticated USING (true);
    CREATE TABLE public.orders(id text PRIMARY KEY,total numeric,payment_status text,payment_method text,status text,updated_at timestamptz);
    INSERT INTO public.orders VALUES ('order-a',100,'Pending',NULL,'Pending',now());
    CREATE TYPE public.record_status AS ENUM ('draft','active','inactive','archived','deleted');
    CREATE TABLE public.products(id uuid PRIMARY KEY,title text,status public.record_status NOT NULL,
      price numeric NOT NULL DEFAULT 10,is_deleted boolean DEFAULT false,deleted_at timestamptz,
      deleted_by uuid,updated_at timestamptz DEFAULT now());
    INSERT INTO public.products(id,title,status) VALUES ('${uid(4)}','Synthetic item','inactive');
    CREATE TABLE public.order_items(id int PRIMARY KEY,product_id uuid REFERENCES public.products(id));
    INSERT INTO public.order_items VALUES (1,'${uid(4)}');
    GRANT ALL ON public.products TO service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;`);
  for (const name of ['20260925000000_atomic_gateway_settlement.sql',
    '20260925000001_waba_conversation_ownership.sql', '20261027000000_product_archival_columns.sql',
    '20261028000000_atomic_product_archival.sql', '20261028000001_product_archival_audit_grants.sql']) {
    const bytes = await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url));
    migrations[name] = sha(bytes);
    await db.exec(bytes.toString());
  }
  // Seed a real settled ledger row and an archival audit event before backup.
  await db.exec(`INSERT INTO public.payment_transactions(order_id,transaction_id,payment_method,amount)
    VALUES ('order-a','test-payu-a','payu',100);
    SELECT public.settle_gateway_payment('order-a','test-payu-a','payu','success',100,'{}');
    SELECT public.archive_product_atomic('${uid(4)}','synthetic-operator','fixture-recovery');`);
  const matrix = async () => {
    for (const role of roles) {
      await db.query('UPDATE public.profiles SET role=$1,company_id=$2,branch_id=$3 WHERE id=$4', [role, 'org-a', 'branch-a', uid(1)]);
      await db.exec(`SET ROLE authenticated; SET request.jwt.claim.sub='${uid(1)}'`);
      const global = ['admin', 'superadmin'].includes(role);
      const allowed = !['customer', 'seller', 'unknown'].includes(role);
      const expected = global ? ['other-branch', 'other-org', 'own', 'unowned'] : allowed ? ['own'] : [];
      equal((await db.query('SELECT sender_number FROM public."Conversation" ORDER BY sender_number')).rows.map(r => r.sender_number), expected, `${role} conversation scope`);
      equal((await db.query('SELECT id FROM public."Message" ORDER BY id')).rows.map(r => r.id), expected.map(id => `m-${id}`), `${role} message scope`);
      await denied(db.query('DELETE FROM public."Conversation"'));
      await denied(db.query('UPDATE public."Message" SET id=id'));
      await denied(db.query('SELECT public.archive_product_atomic($1,$2,$3)', [uid(4), 'forged', 'denied']));
      await denied(db.query('SELECT public.settle_gateway_payment($1,$2,$3,$4,$5,$6)', ['order-a','test-payu-a','payu','success',100,'{}']));
      await db.exec('RESET ROLE');
    }
    await db.query('UPDATE public.profiles SET role=$1,branch_id=NULL WHERE id=$2', ['sales_manager', uid(1)]);
    await db.exec(`SET ROLE authenticated; SET request.jwt.claim.sub='${uid(1)}'`);
    equal((await db.query('SELECT sender_number FROM public."Conversation" ORDER BY sender_number')).rows.map(r => r.sender_number), ['other-branch', 'own'], 'organization staff with no branch');
    await db.exec(`SET request.jwt.claim.sub='${uid(99)}'`);
    equal((await db.query('SELECT * FROM public."Conversation"')).rows, [], 'no profile');
    await db.exec('RESET ROLE; SET ROLE anon');
    await denied(db.query('SELECT * FROM public."Conversation"'));
    await denied(db.query('SELECT * FROM public."Message"'));
    await db.exec('RESET ROLE; SET ROLE service_role');
    await denied(db.query('DELETE FROM public.product_archival_events'));
    await denied(db.query("UPDATE public.product_archival_events SET reason='tamper'"));
    await denied(db.query("SELECT setval('public.product_archival_events_id_seq',100)"));
    await db.exec('RESET ROLE');
    await assert.rejects(db.query('UPDATE public."Conversation" SET assigned_to=$1 WHERE sender_number=$2', [uid(3), 'own']), /outside conversation ownership/); assertions++;
    await assert.rejects(db.query('UPDATE public."Conversation" SET organization_id=$1 WHERE sender_number=$2', ['org-b', 'own']), /immutable/); assertions++;
  };
  await matrix();
  const snapshot = async () => {
    const queries = {
      profiles: 'SELECT * FROM public.profiles ORDER BY id',
      conversations: 'SELECT * FROM public."Conversation" ORDER BY sender_number',
      messages: 'SELECT * FROM public."Message" ORDER BY id',
      orders: 'SELECT * FROM public.orders ORDER BY id',
      ledger: 'SELECT * FROM public.payment_transactions ORDER BY id',
      products: 'SELECT * FROM public.products ORDER BY id',
      orderItems: 'SELECT * FROM public.order_items ORDER BY id',
      audit: 'SELECT * FROM public.product_archival_events ORDER BY id',
      policies: 'SELECT * FROM pg_policies WHERE schemaname=\'public\' ORDER BY tablename,policyname',
      grants: 'SELECT table_name,grantee,privilege_type FROM information_schema.table_privileges WHERE table_schema=\'public\' ORDER BY table_name,grantee,privilege_type',
    };
    const result = {};
    for (const [name, sql] of Object.entries(queries)) result[name] = (await db.query(sql)).rows;
    return result;
  };
  const before = await snapshot();
  const checkpointAt = new Date().toISOString();
  const backupStart = performance.now();
  const dump = Buffer.from(await (await db.dumpDataDir('gzip')).arrayBuffer());
  await mkdir(output, { recursive: true });
  const backupFile = new URL('synthetic-postgres-backup.tar.gz', output);
  await writeFile(backupFile, dump);
  const backupMs = Math.round(performance.now() - backupStart);
  const expectedHash = sha(dump);
  // Destruction is confined to this disposable synthetic instance.
  await db.exec('DELETE FROM public."Message"; DELETE FROM public."Conversation"; DELETE FROM public.order_items;');
  equal((await db.query('SELECT * FROM public."Message"')).rows, [], 'injected fixture data loss');
  await db.close();
  const restoreStart = performance.now();
  const bytes = await readFile(backupFile);
  equal(sha(bytes), expectedHash, 'on-disk backup integrity');
  const corrupt = Buffer.from(bytes); corrupt[0] ^= 1;
  assert.notEqual(sha(corrupt), expectedHash, 'corruption must fail the pre-restore checksum gate'); assertions++;
  db = new PGlite({ loadDataDir: new Blob([bytes]) });
  equal(await snapshot(), before, 'restored fixture rows, constraints-related data, policies and grants');
  await matrix();
  equal((await db.query('SELECT public.settle_gateway_payment($1,$2,$3,$4,$5,$6) AS result', ['order-a','test-payu-a','payu','success',100,'{}'])).rows[0].result.duplicate, true, 'settlement replay after restore');
  await db.query('SELECT public.restore_product_atomic($1,$2)', [uid(4), 'synthetic-operator']);
  equal(Number((await db.query('SELECT count(*) AS n FROM public.product_archival_events')).rows[0].n), 2, 'audit sequence and functions usable after restore');
  equal((await db.query('SELECT status FROM public.products WHERE id=$1', [uid(4)])).rows[0].status, 'inactive', 'restore preserves pre-archive publication status');
  const report = {
    recordedAt: new Date().toISOString(), revision: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    runnerSha256: sha(await readFile(new URL(import.meta.url))),
    environment: 'local Windows / PGlite 0.4.3 / synthetic data / no network or production credentials',
    status: 'pass', assertions, rolesTested: roles, migrations, checkpointAt,
    backup: { bytes: bytes.length, sha256: expectedHash, durationMs: backupMs },
    recoveryVerificationMs: Math.round(performance.now() - restoreStart),
    verified: ['WABA role, organization and branch RLS before and after restore', 'ownership immutability',
      'browser denial of privileged settlement and archival RPCs', 'archival audit append-only grants',
      'saved database rows/policies/grants', 'settlement replay idempotency', 'archival sequence and status restoration'],
    limitations: ['Selected application schema fixture only; not a full production backup',
      'PGlite snapshot format; not pg_dump/pg_restore or managed Supabase recovery',
      'Does not test HTTP authorization, Supabase Auth refresh, Storage objects or external providers',
      'Timings are local fixture measurements, not production RPO/RTO or VPS capacity evidence'],
  };
  await writeFile(new URL('report.json', output), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { await db.close(); }
