import { getAdminDb } from '@tecbunny/core/db/client';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^([^=:#]+?)[=:](.*)/);
    if (match) { process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, ''); }
  });
}

async function main() {
  const db = getAdminDb();
  
  const email = faker.internet.email();
  const res = await db.supabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true
  });
  
  if (res.error) {
    console.error('createUser error:', res.error);
    return;
  }
  
  const userId = res.data.user.id;
  console.log('Created auth user:', userId);
  
  const profileRes = await db.supabase.from('profiles').select('*').eq('id', userId);
  console.log('Auto-created profile?', profileRes.data);
}
main();
