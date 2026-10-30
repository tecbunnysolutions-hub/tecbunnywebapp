import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

for (const existingArchiveDate of [false, true]) {
  const db = new PGlite();
  try {
    await db.exec(`CREATE TABLE public.products (id uuid PRIMARY KEY, title text${existingArchiveDate ? ', archived_at timestamptz' : ''});
      INSERT INTO public.products VALUES ('00000000-0000-0000-0000-000000000001', 'Historical product'${existingArchiveDate ? ", '2026-09-01T00:00:00Z'" : ''});`);
    const sql = await readFile(new URL('../supabase/migrations/20261027000000_product_archival_columns.sql', import.meta.url), 'utf8');
    await db.exec(sql);
    await db.exec(sql);
    const { rows } = await db.query('SELECT title, archived_at, archived_by, archive_reason FROM public.products');
    assert.equal(rows.length, 1);
    assert.equal(rows[0].title, 'Historical product');
    assert.equal(rows[0].archived_at?.toISOString() ?? null, existingArchiveDate ? '2026-09-01T00:00:00.000Z' : null);
    assert.equal(rows[0].archived_by, null);
    assert.equal(rows[0].archive_reason, null);
    await db.exec(`UPDATE public.products SET archived_by = '00000000-0000-0000-0000-000000000002', archive_reason = 'Retired'`);
    await db.exec(sql);
    const result = await db.query('SELECT archived_by, archive_reason FROM public.products');
    assert.equal(result.rows[0].archive_reason, 'Retired');
    assert.equal(result.rows[0].archived_by, '00000000-0000-0000-0000-000000000002');
    console.log(`PASS: archival repair with ${existingArchiveDate ? 'existing' : 'missing'} archive date is repeatable and preserves history`);
  } finally {
    await db.close();
  }
}
