import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const migrationsDir = path.join(root, 'supabase', 'migrations');

if (!existsSync(migrationsDir)) {
  failures.push('supabase/migrations directory is missing');
} else {
  const migrations = readdirSync(migrationsDir).filter((file) => file.endsWith('.sql'));
  if (migrations.length === 0) failures.push('no SQL migrations found');
  for (const migration of migrations) {
    const sql = readFileSync(path.join(migrationsDir, migration), 'utf8');
    if (/DROP\s+SCHEMA\s+public\s+CASCADE/i.test(sql)) {
      failures.push(`${migration} contains destructive DROP SCHEMA public CASCADE`);
    }
  }
}

if (!existsSync(path.join(root, 'database.reset.sql'))) {
  failures.push('database.reset.sql is missing');
}

if (failures.length) {
  console.error('Database readiness validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Validated database readiness contract: migrations and reset SQL are present.');
}