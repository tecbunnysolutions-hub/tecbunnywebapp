import { faker } from '@faker-js/faker';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAdminDb } from '@tecbunny/core/db/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly if available
const envPath = path.resolve(__dirname, '../../../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8');
  envConfig.split('\n').forEach((line) => {
    const match = line.match(/^([^=:#]+?)[=:](.*)/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

async function clearDatabase(db: any) {
  console.log('🧹 Wiping existing data...');
  try {
    await db.supabase.from('service_tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await db.supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await db.supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // For profiles, since we are doing dev seeding, we can wipe the auth users created earlier
    // But auth.admin.deleteUser exists, so we might not need to wipe profiles directly if we just create new ones.
    // However, deleting profiles is good.
    await db.supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('✅ Wiped existing data from service_tickets, orders, profiles, and customers.');
  } catch (error) {
    console.warn('⚠️ Some data might not have been wiped due to constraints:', error);
  }
}

async function seedCustomersAndOrders(db: any, count = 10) {
  console.log(`🌱 Seeding ${count} customers and orders...`);
  
  const customers = [];
  for (let i = 0; i < count; i++) {
    customers.push({
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.string.numeric(10), // Safe numeric phone to avoid unique/format issues
    });
  }

  const { error: custError } = await db.supabase.from('customers').insert(customers);
  if (custError) {
    console.error('❌ Error seeding customers:', custError);
    return;
  }
  
  const orders = [];
  for (let i = 0; i < count * 2; i++) {
    const cust = faker.helpers.arrayElement(customers);
    orders.push({
      id: faker.string.uuid(),
      order_id: faker.string.alphanumeric(10).toUpperCase(),
      customer_id: cust.id,
      type: faker.helpers.arrayElement(['Delivery', 'Pickup', 'Service']),
      total_amount: parseFloat(faker.commerce.price({ min: 110, max: 1100 })),
      payment_method: faker.helpers.arrayElement(['Credit Card', 'UPI', 'Cash on Delivery']),
      status: faker.helpers.arrayElement(['Pending', 'Processing', 'Delivered', 'Cancelled'])
    });
  }

  const { error: ordError } = await db.supabase.from('orders').insert(orders);
  if (ordError) {
    console.error('❌ Error seeding orders:', ordError);
  } else {
    console.log('✅ Customers and Orders seeded successfully.');
  }
}

async function seedAuthProfilesAndTickets(db: any, count = 10) {
  console.log(`🌱 Seeding ${count} auth users, profiles, and service tickets...`);
  const profiles = [];
  
  for (let i = 0; i < count; i++) {
    const email = faker.internet.email();
    const { data: authData, error: authError } = await db.supabase.auth.admin.createUser({
      email,
      password: 'password123',
      email_confirm: true
    });
    
    if (authError || !authData.user) {
      console.warn(`Failed to create auth user ${email}:`, authError?.message);
      continue;
    }
    
    const profile = {
      id: authData.user.id,
      full_name: faker.person.fullName(),
      phone: faker.string.numeric(10),
      email: email,
      role: faker.helpers.arrayElement(['user', 'admin', 'sales_agent'])
    };
    
    const { error: profError } = await db.supabase.from('profiles').insert(profile);
    if (profError) {
      console.error(`❌ Error inserting profile for ${email}:`, profError);
    } else {
      profiles.push(profile);
    }
  }

  if (profiles.length === 0) {
    console.warn('⚠️ No profiles created, skipping service tickets.');
    return;
  }

  const tickets = [];
  for (let i = 0; i < count * 2; i++) {
    tickets.push({
      id: faker.string.uuid(),
      customer_id: faker.helpers.arrayElement(profiles).id,
      issue_description: faker.lorem.paragraph(),
      priority: faker.helpers.arrayElement(['Normal', 'High', 'Urgent']),
      status: faker.helpers.arrayElement(['Open', 'In Progress', 'Closed'])
    });
  }

  const { error: tktError } = await db.supabase.from('service_tickets').insert(tickets);
  if (tktError) {
    console.error('❌ Error seeding service tickets:', tktError);
  } else {
    console.log('✅ Auth users, Profiles, and Service Tickets seeded successfully.');
  }
}

async function main() {
  console.log('🚀 Starting database reset & seed process...');
  try {
    const db = getAdminDb();
    
    await clearDatabase(db);
    await seedCustomersAndOrders(db, 10);
    await seedAuthProfilesAndTickets(db, 10);
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding process failed:', err);
  }
}

main();
