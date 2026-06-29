import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function testPooler() {
  console.log("Testing connection via pooler...");
  const client = new Client({
    user: 'postgres.yzrznydkqcacjiwalmlw',
    password: process.env.SUPABASE_DB_PASSWORD || 'Bunny@6010#1',
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("SUCCESS: Connected via pooler!");
    const res = await client.query("SELECT VERSION();");
    console.log("Version info:", res.rows[0]);
  } catch (err) {
    console.error("FAILED to connect via pooler:", err);
  } finally {
    await client.end();
  }
}

testPooler();
