import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return readFileSync(join(root, relativePath), 'utf8');
}

function assert(condition, message) {
  if (!condition) {
    failures.push(message);
  }
}

let databaseSql = '';
let rollbackSql = '';
let migrationFiles = [];

try {
  databaseSql = read('database.sql');
} catch {
  failures.push('database.sql is missing or unreadable');
}

try {
  rollbackSql = read('database.reset.sql');
} catch {
  failures.push('database.reset.sql is missing or unreadable');
}

try {
  migrationFiles = readdirSync(join(root, 'supabase/migrations')).filter((f) => f.endsWith('.sql'));
} catch {
  failures.push('supabase/migrations directory is missing or unreadable');
}

if (databaseSql) {
  assert(databaseSql.trim().length > 0, 'database.sql is empty');
  const uncommentedSql = databaseSql
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('--'))
    .join('\n');
  assert(!/DROP\s+SCHEMA/i.test(uncommentedSql), 'database.sql contains executable DROP SCHEMA');
}

if (rollbackSql) {
  assert(rollbackSql.trim().length > 0, 'database.reset.sql is empty');
}

assert(migrationFiles.length > 0, 'no SQL migrations found in supabase/migrations');

if (failures.length > 0) {
  console.error('Database readiness validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log('Validated database readiness contract (baseline SQL, rollback SQL, and migrations present).');
}
