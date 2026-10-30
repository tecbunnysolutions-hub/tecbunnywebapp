import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const sql = await readFile(new URL('../supabase/migrations/20261027000001_communication_preferences_service_read.sql', import.meta.url), 'utf8');
for (const relation of ['table', 'view']) {
  const db = new PGlite();
  try {
    await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
      GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
      CREATE TABLE preferences_source (id uuid PRIMARY KEY);`);
    await db.exec(relation === 'view'
      ? 'CREATE VIEW user_communication_preferences AS SELECT id FROM preferences_source'
      : 'CREATE TABLE user_communication_preferences (id uuid PRIMARY KEY)');
    await db.exec(sql);
    await db.exec(sql);
    for (const role of ['anon', 'authenticated', 'service_role']) {
      const { rows } = await db.query(`SELECT has_table_privilege('${role}', 'user_communication_preferences', 'SELECT') AS allowed`);
      assert.equal(rows[0].allowed, role === 'service_role');
      const write = await db.query(`SELECT has_table_privilege('${role}', 'user_communication_preferences', 'INSERT,UPDATE,DELETE') AS allowed`);
      assert.equal(write.rows[0].allowed, false);
    }
    await db.exec('SET ROLE service_role');
    await db.query('SELECT id FROM user_communication_preferences LIMIT 0');
    console.log(`PASS: repeatable ${relation} read grant allows service role only and adds no writes`);
  } finally {
    await db.close();
  }
}
