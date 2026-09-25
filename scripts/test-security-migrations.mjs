import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Run the actual migrations against isolated, in-memory PostgreSQL. No network
// or application credentials are used by this regression test.
const owner = '00000000-0000-0000-0000-000000000001';
const foreign = '00000000-0000-0000-0000-000000000002';
for (const legacyLedger of [false, true, 'minimal']) {
const db = new PGlite();
try {
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    CREATE TABLE public.orders (id text PRIMARY KEY, total numeric, payment_status text, payment_method text, status text, updated_at timestamptz);
    CREATE TABLE public.profiles (id uuid PRIMARY KEY, email text, role text, company_id text, branch_id text);
    CREATE TABLE public."Conversation" (sender_number text PRIMARY KEY, assigned_to uuid);
    CREATE TABLE public."Message" (id text PRIMARY KEY, sender_number text);
    INSERT INTO public.profiles VALUES ('${owner}', 'owner@example.test', 'sales_manager', 'org-a', 'branch-a'), ('${foreign}', 'foreign@example.test', 'sales_manager', 'org-b', 'branch-b');
    INSERT INTO public."Conversation" VALUES ('own', '${owner}'), ('foreign', '${foreign}'), ('unowned', NULL);
    INSERT INTO public."Message" VALUES ('m-own', 'own'), ('m-foreign', 'foreign'), ('m-unowned', 'unowned');
    CREATE POLICY old_open_read ON public."Conversation" FOR SELECT TO authenticated USING (true);
    CREATE POLICY old_open_read ON public."Message" FOR SELECT TO authenticated USING (true);
    GRANT USAGE ON SCHEMA public, auth TO authenticated, service_role;
    INSERT INTO public.orders VALUES ('one', 100, 'Pending', NULL, 'Pending', now()), ('two', 200, 'Pending', NULL, 'Pending', now());
  `);
  if (legacyLedger === true) {
    await db.exec(`CREATE TABLE public.payment_transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id text NOT NULL,
      transaction_id text NOT NULL, amount numeric(14,2) NOT NULL,
      status text NOT NULL DEFAULT 'initiated', gateway_response jsonb NOT NULL DEFAULT '{}',
      created_at timestamptz NOT NULL DEFAULT now()
    );
    INSERT INTO public.payment_transactions (order_id, transaction_id, amount)
      VALUES ('one', 'legacy-unknown-gateway', 100)`);
  }
  if (legacyLedger === 'minimal') {
    await db.exec(`CREATE TABLE public.payment_transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), legacy_payload jsonb
    );
    INSERT INTO public.payment_transactions (legacy_payload) VALUES ('{"reference":"old-one"}'), ('{"reference":"old-two"}')`);
  }
  const settlementMigration = await readFile(new URL('../supabase/migrations/20260925000000_atomic_gateway_settlement.sql', import.meta.url), 'utf8');
  for (const name of ['20260925000000_atomic_gateway_settlement.sql', '20260925000001_waba_conversation_ownership.sql']) {
    await db.exec(await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8'));
  }
  // A failed SQL-editor attempt may be rerun after applying the correction.
  await db.exec(settlementMigration);
  if (legacyLedger === true) {
    assert.deepEqual((await db.query("SELECT amount, payment_method, status FROM public.payment_transactions WHERE transaction_id='legacy-unknown-gateway'")).rows[0], {
      amount: '100.00', payment_method: null, status: 'initiated',
    });
    await assert.rejects(db.query("SELECT public.settle_gateway_payment('one', 'legacy-unknown-gateway', 'payu', 'success', 100, '{}')"), /Unknown payment transaction/);
  }
  if (legacyLedger === 'minimal') {
    const historical = (await db.query('SELECT legacy_payload, order_id, transaction_id, payment_method, amount, status, gateway_response, created_at FROM public.payment_transactions ORDER BY legacy_payload->>\'reference\'')).rows;
    assert.deepEqual(historical, ['old-one', 'old-two'].map(reference => ({
      legacy_payload: { reference }, order_id: null, transaction_id: null, payment_method: null,
      amount: null, status: null, gateway_response: null, created_at: null,
    })));
  }
  console.log(`PASS: ${legacyLedger === 'minimal' ? 'minimal legacy ledger missing all settlement columns, preserved history' : legacyLedger ? 'existing ledger missing payment_method, preserved history' : 'fresh ledger'} and repeatable settlement migration`);
  await db.exec(`INSERT INTO public.payment_transactions (order_id, transaction_id, payment_method, amount) VALUES ('one', 'cf-one', 'cashfree', 100), ('two', 'payu-two', 'payu', 200)`);
  const settle = (order, transaction, method, status, amount, gateway = {}) => db.query(
    'SELECT public.settle_gateway_payment($1,$2,$3,$4,$5,$6) AS result',
    [order, transaction, method, status, amount, JSON.stringify(gateway)]
  );
  const paid = { order_id: 'cf-one', order_currency: 'INR', order_status: 'PAID' };
  await assert.rejects(settle('two', 'cf-one', 'cashfree', 'success', 100, paid), /mismatch/);
  await assert.rejects(settle('one', 'cf-one', 'cashfree', 'success', 1, paid), /mismatch/);
  await assert.rejects(settle('one', 'cf-one', 'cashfree', 'success', 100, { ...paid, order_currency: 'USD' }), /mismatch/);
  await db.exec(`CREATE FUNCTION reject_order_update() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'simulated write failure'; END $$;
    CREATE TRIGGER reject_order_update BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION reject_order_update()`);
  await assert.rejects(settle('one', 'cf-one', 'cashfree', 'success', 100, paid), /simulated write failure/);
  assert.equal((await db.query("SELECT status FROM public.payment_transactions WHERE transaction_id='cf-one'")).rows[0].status, 'initiated');
  await db.exec('DROP TRIGGER reject_order_update ON public.orders');
  assert.equal((await settle('one', 'cf-one', 'cashfree', 'success', 100, paid)).rows[0].result.status, 'success');
  assert.equal((await settle('one', 'cf-one', 'cashfree', 'success', 100, paid)).rows[0].result.duplicate, true);
  await settle('two', 'payu-two', 'payu', 'success', 200);
  assert.equal((await settle('two', 'payu-two', 'payu', 'failed', 200)).rows[0].result.status, 'success');
  assert.equal((await db.query("SELECT payment_status FROM public.orders WHERE id='two'")).rows[0].payment_status, 'Payment Confirmed');
  await db.exec(`SET ROLE authenticated`);
  await assert.rejects(settle('one', 'cf-one', 'cashfree', 'success', 100, paid), /permission denied/);
  await db.exec('RESET ROLE');
  console.log('PASS: payment reference/amount/currency validation, atomic rollback, idempotency, late failure and service-only permissions');

  assert.deepEqual((await db.query(`SELECT organization_id, branch_id FROM public."Conversation" WHERE sender_number='own'`)).rows[0], { organization_id: 'org-a', branch_id: 'branch-a' });
  await db.exec(`UPDATE public."Conversation" SET assigned_to=NULL WHERE sender_number='own'`);
  assert.equal((await db.query(`SELECT organization_id FROM public."Conversation" WHERE sender_number='own'`)).rows[0].organization_id, 'org-a');
  await assert.rejects(db.exec(`UPDATE public."Conversation" SET assigned_to='${foreign}' WHERE sender_number='own'`), /outside conversation ownership/);
  await assert.rejects(db.exec(`UPDATE public."Conversation" SET organization_id='org-b' WHERE sender_number='own'`), /immutable/);
  await db.exec(`SET ROLE authenticated; SET request.jwt.claim.sub='${owner}'`);
  assert.deepEqual((await db.query('SELECT sender_number FROM public."Conversation"')).rows, [{ sender_number: 'own' }]);
  assert.deepEqual((await db.query('SELECT id FROM public."Message"')).rows, [{ id: 'm-own' }]);
  await assert.rejects(db.exec(`UPDATE public."Conversation" SET assigned_to=NULL`), /permission denied/);
  await db.exec(`RESET ROLE; UPDATE public.profiles SET branch_id='other' WHERE id='${owner}'; SET ROLE authenticated`);
  assert.equal((await db.query('SELECT * FROM public."Conversation"')).rows.length, 0);
  await db.exec(`RESET ROLE; UPDATE public.profiles SET role='admin' WHERE id='${owner}'; SET ROLE authenticated`);
  assert.equal((await db.query('SELECT * FROM public."Conversation"')).rows.length, 3);
  console.log('PASS: canonical ownership backfill, unassignment, cross-tenant assignment denial, immutability and restrictive tenant/branch RLS');
} finally {
  await db.close();
}
}
