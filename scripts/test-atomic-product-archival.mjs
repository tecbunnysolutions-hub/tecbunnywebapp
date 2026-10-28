import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const first = '00000000-0000-4000-8000-000000000001';
const legacy = '00000000-0000-4000-8000-000000000002';
const rollback = '00000000-0000-4000-8000-000000000003';
try {
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE TYPE public.record_status AS ENUM ('draft','active','inactive','archived','deleted');
    CREATE TABLE public.products (
      id uuid PRIMARY KEY, title text, status public.record_status NOT NULL,
      price numeric NOT NULL DEFAULT 10, is_deleted boolean DEFAULT false,
      deleted_at timestamptz, deleted_by uuid, updated_at timestamptz DEFAULT now()
    );
    CREATE TABLE public.order_items (id integer PRIMARY KEY, product_id uuid REFERENCES public.products(id));
    INSERT INTO public.products(id,title,status,is_deleted,deleted_at) VALUES
      ('${first}', 'Historical inactive product','inactive',false,NULL),
      ('${legacy}', 'Legacy archive without snapshot','archived',true,now()),
      ('${rollback}', 'Atomic rollback probe','active',false,NULL);
    INSERT INTO public.order_items VALUES (1,'${first}');
    GRANT ALL ON public.products TO service_role;
    CREATE FUNCTION public.soft_delete_product(uuid) RETURNS void LANGUAGE sql
      AS 'UPDATE public.products SET is_deleted=true WHERE id=$1';
    CREATE FUNCTION public.restore_product(uuid) RETURNS void LANGUAGE sql
      AS 'UPDATE public.products SET is_deleted=false WHERE id=$1';
    -- Supabase defaults can otherwise leave service UPDATE/DELETE privileges behind.
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
  `);
  await db.exec(await readFile(new URL('../supabase/migrations/20261027000000_product_archival_columns.sql', import.meta.url), 'utf8'));
  const migration = await readFile(new URL('../supabase/migrations/20261028000000_atomic_product_archival.sql', import.meta.url), 'utf8');
  await db.exec(migration);
  // Reproduce an already-installed table with the older inherited service grants.
  await db.exec(`GRANT ALL ON public.product_archival_events TO service_role;
    GRANT ALL ON SEQUENCE public.product_archival_events_id_seq TO anon, authenticated, service_role;`);
  const grantRepair = await readFile(new URL('../supabase/migrations/20261028000001_product_archival_audit_grants.sql', import.meta.url), 'utf8');
  await db.exec(grantRepair);
  await db.exec(grantRepair);
  const row = async (sql, parameters = []) => (await db.query(sql, parameters)).rows[0];
  const archive = async (id, reason = 'Retired') => (await row('SELECT public.archive_product_atomic($1,$2,$3) AS result', [id, 'superadmin-root-id', reason])).result;
  const restore = async id => (await row('SELECT public.restore_product_atomic($1,$2) AS result', [id, 'superadmin-root-id'])).result;

  for (const role of ['anon', 'authenticated']) {
    await db.exec(`SET ROLE ${role}`);
    await assert.rejects(archive(first), error => error.code === '42501');
    await assert.rejects(db.query('SELECT * FROM public.product_archival_events'), error => error.code === '42501');
    await assert.rejects(db.query("SELECT nextval('public.product_archival_events_id_seq')"), error => error.code === '42501');
    await assert.rejects(db.query('SELECT public.soft_delete_product($1)', [first]), error => error.code === '42501');
    await db.exec('RESET ROLE');
  }
  await db.exec('SET ROLE service_role');
  const archived = await archive(first);
  assert.equal(archived.changed, true);
  assert.equal(archived.is_deleted, true);
  assert.equal(archived.status, 'archived');
  assert.ok(archived.archived_at);
  assert.equal(archived.archived_by, null, 'Virtual root actor must not enter a UUID column');
  assert.equal((await archive(first)).changed, false, 'Retries must be idempotent');
  const snapshot = await row('SELECT * FROM public.product_archival_events WHERE product_id=$1', [first]);
  assert.equal(snapshot.actor_id, 'superadmin-root-id');
  assert.equal(snapshot.before_state.status, 'inactive');
  assert.equal(snapshot.after_state.status, 'archived');
  assert.equal(snapshot.before_state.price, 10);
  const restored = await restore(first);
  assert.equal(restored.status, 'inactive', 'Restore must not accidentally publish an inactive product');
  assert.equal(restored.is_deleted, false);
  assert.equal(restored.archived_at, null);
  assert.equal((await restore(first)).changed, false);
  await assert.rejects(restore(legacy), error => error.code === '23514');
  await assert.rejects(db.query('DELETE FROM public.product_archival_events'), error => error.code === '42501');
  await assert.rejects(db.query("UPDATE public.product_archival_events SET reason='tampered'"), error => error.code === '42501');
  await assert.rejects(db.query("SELECT setval('public.product_archival_events_id_seq',100)"), error => error.code === '42501');
  await db.exec('RESET ROLE');
  assert.equal(Number((await row('SELECT count(*) AS count FROM public.product_archival_events')).count), 2);
  assert.equal((await row('SELECT product_id FROM public.order_items WHERE id=1')).product_id, first);

  await db.exec(`CREATE FUNCTION public.reject_test_audit() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN IF NEW.reason = 'rollback-probe' THEN RAISE EXCEPTION 'Injected audit failure'; END IF; RETURN NEW; END $$;
    CREATE TRIGGER reject_test_audit BEFORE INSERT ON public.product_archival_events
      FOR EACH ROW EXECUTE FUNCTION public.reject_test_audit();`);
  await assert.rejects(archive(rollback, 'rollback-probe'));
  const unchanged = await row('SELECT status,is_deleted,archived_at FROM public.products WHERE id=$1', [rollback]);
  assert.equal(unchanged.status, 'active');
  assert.equal(unchanged.is_deleted, false);
  assert.equal(unchanged.archived_at, null, 'Audit insert failure must roll back the product update');
  await db.exec(migration);
  assert.equal(Number((await row('SELECT count(*) AS count FROM public.products')).count), 3);
  assert.equal(Number((await row('SELECT count(*) AS count FROM public.product_archival_events')).count), 2);
  console.log('PASS: atomic archival preserves history/FKs/status, rejects browser roles, retries safely, rolls back on audit failure, and migrates repeatably');
} finally {
  await db.close();
}
