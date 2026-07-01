// scripts/apply-migrations.js
import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dns from 'dns/promises';

// Load local environment variables
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Error: DATABASE_URL is missing in .env.local.');
  process.exit(1);
}

// Robust connection string parser to handle passwords with special characters (like '@' or '#')
function parseConnectionString(uri) {
  try {
    const lastAtIndex = uri.lastIndexOf('@');
    if (lastAtIndex === -1) throw new Error('Invalid connection URI');

    // Extract credentials part (removing "postgresql://")
    const credsStart = uri.indexOf('://') + 3;
    const credentialsPart = uri.substring(credsStart, lastAtIndex);
    const hostPart = uri.substring(lastAtIndex + 1);

    const [user, ...passParts] = credentialsPart.split(':');
    const password = passParts.join(':');

    const [hostPort, database] = hostPart.split('/');
    const [host, port] = hostPort.split(':');

    return {
      user,
      password,
      host,
      port: parseInt(port || '5432', 10),
      database
    };
  } catch (err) {
    console.error('Failed to parse database URI:', err.message);
    return null;
  }
}

// DNS resolver helper to bypass Node.js DNS/IPv6 issues
async function resolveHostIP(host) {
  try {
    const results = await dns.lookup(host, { all: true });
    if (results && results.length > 0) {
      // Find first IPv4 address, fallback to first IPv6
      const ipv4 = results.find(r => r.family === 4);
      const address = ipv4 ? ipv4.address : results[0].address;
      console.log(`📡 Resolved DNS ${host} to IP: ${address} (family: ${ipv4 ? 4 : results[0].family})`);
      return address;
    }
  } catch (err) {
    console.warn(`⚠️ DNS lookup failed for ${host}:`, err.message);
  }
  
  // Custom fallback for db.yzrznydkqcacjiwalmlw.supabase.co
  if (host === 'db.yzrznydkqcacjiwalmlw.supabase.co') {
    const ipv6Fallback = '2406:da12:557:f800:ab55:ff88:5af8:8550';
    console.log(`🔄 Applying hardcoded IPv6 fallback for Supabase database: ${ipv6Fallback}`);
    return ipv6Fallback;
  }
  return host; // fallback to hostname
}

async function run() {
  console.log('--- Database Migration Runner ---');
  console.log('Parsing database connection options...');

  const config = parseConnectionString(connectionString);
  if (!config) {
    console.error('❌ Error: Failed to parse database configuration.');
    process.exit(1);
  }

  // Resolve hostname to IP to prevent ENOTFOUND issues
  const ipAddress = await resolveHostIP(config.host);
  config.host = ipAddress;

  console.log(`Connecting to: ${config.host}:${config.port}/${config.database} as user: ${config.user}...`);
  const client = new pg.Client(config);
  
  try {
    await client.connect();
    console.log('✅ Connected to database.');

    const migrationPath = path.resolve('supabase/migrations/20260701100000_create_webhook_tunnel.sql');
    console.log(`Reading migration file: ${migrationPath} ...`);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Executing SQL migration...');
    await client.query(sql);
    console.log('✅ SQL migration executed successfully. Table "webhook_tunnel_queue" created and Realtime enabled.');

  } catch (err) {
    console.error('❌ Error applying migration:', err.message);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

run();
