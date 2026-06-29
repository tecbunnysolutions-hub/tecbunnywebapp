import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("Missing DATABASE_URL in .env.local");
  process.exit(1);
}

// Dynamically import or install pg
let pg;
try {
  pg = await import('pg');
} catch (e) {
  console.log("Installing pg module dynamically...");
  execSync('npm install pg', { stdio: 'inherit' });
  pg = await import('pg');
}

const { Client } = pg.default;

async function run() {
  const sqlPath = path.join(process.cwd(), 'scripts', 'create_upcoming_projects.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log("Connecting to PostgreSQL database...");
  const client = new Client({
    user: 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD || 'Bunny@6010#1',
    host: 'db.yzrznydkqcacjiwalmlw.supabase.co',
    port: 5432,
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("Running create_upcoming_projects.sql DDL migration...");
    await client.query(sql);
    console.log("Migration applied successfully!");
  } catch (err) {
    console.error("Failed to run DDL migration:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
