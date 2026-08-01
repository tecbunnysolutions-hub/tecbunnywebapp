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

// Support other environment files as well
const envLocalPath = path.resolve(__dirname, '../../../.env.local');
if (fs.existsSync(envLocalPath)) {
  const envConfig = fs.readFileSync(envLocalPath, 'utf-8');
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
    // Delete in order of dependencies
    await db.supabase.from('sup_tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await db.supabase.from('oms_payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await db.supabase.from('oms_orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await db.supabase.from('prd_products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await db.supabase.from('sls_leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await db.supabase.from('crm_customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await db.supabase.from('sys_users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await db.supabase.from('org_branches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await db.supabase.from('org_organizations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Also delete legacy tables if they exist and are populated
    await db.supabase.from('service_tickets').delete().neq('id', '00000000-0000-0000-0000-000000000000').maybeSingle();
    await db.supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000').maybeSingle();
    await db.supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000').maybeSingle();
    await db.supabase.from('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000').maybeSingle();

    console.log('✅ Wiped existing data successfully.');
  } catch (error) {
    console.warn('⚠️ Some data might not have been wiped due to constraints or missing tables:', error);
  }
}

async function seedData(db: any) {
  console.log('🌱 Seeding new organizations, branches, users, customers, products, orders, and tickets...');
  
  // 1. Create Organization
  const orgId = faker.string.uuid();
  const orgName = faker.company.name();
  const { error: orgError } = await db.supabase.from('org_organizations').insert({
    id: orgId,
    name: orgName,
    registration_number: faker.string.numeric(8),
    tax_id: `GST${faker.string.numeric(10)}`,
    industry: 'Technology',
    status: 'ACTIVE'
  });
  if (orgError) {
    console.error('❌ Error seeding organization:', orgError);
    return;
  }

  // 2. Create Branch
  const branchId = faker.string.uuid();
  const branchName = `${orgName} Mumbai HQ`;
  const { error: branchError } = await db.supabase.from('org_branches').insert({
    id: branchId,
    org_id: orgId,
    name: branchName,
    code: 'HQ',
    is_headquarters: true
  });
  if (branchError) {
    console.error('❌ Error seeding branch:', branchError);
    return;
  }

  // 3. Create Users & Profiles
  const userIds: string[] = [];
  for (let i = 0; i < 3; i++) {
    const email = faker.internet.email();
    const { data: authData, error: authError } = await db.supabase.auth.admin.createUser({
      email,
      password: 'password123',
      email_confirm: true
    });

    if (authError || !authData?.user) {
      console.warn(`Failed to create auth user ${email}:`, authError?.message);
      continue;
    }

    const userId = authData.user.id;
    userIds.push(userId);

    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const { error: userError } = await db.supabase.from('sys_users').insert({
      id: userId,
      org_id: orgId,
      branch_id: branchId,
      employee_code: `EMP-${faker.string.numeric(4)}`,
      first_name: firstName,
      last_name: lastName,
      phone: faker.string.numeric(10),
      is_active: true
    });

    if (userError) {
      console.error(`❌ Error inserting sys_user for ${email}:`, userError);
    }

    // Also populate legacy profiles table for compatibility
    await db.supabase.from('profiles').insert({
      id: userId,
      full_name: `${firstName} ${lastName}`,
      phone: faker.string.numeric(10),
      email: email,
      role: i === 0 ? 'admin' : 'user'
    }).maybeSingle();
  }

  // 4. Create Customers
  const customerIds: string[] = [];
  const customersData = [];
  for (let i = 0; i < 5; i++) {
    const custId = faker.string.uuid();
    customerIds.push(custId);
    customersData.push({
      id: custId,
      org_id: orgId,
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.string.numeric(10),
      status: 'ACTIVE',
      lifetime_value: parseFloat(faker.commerce.price({ min: 100, max: 10000 })),
      last_purchase_date: new Date().toISOString()
    });
  }

  const { error: custError } = await db.supabase.from('crm_customers').insert(customersData);
  if (custError) {
    console.error('❌ Error seeding crm_customers:', custError);
  } else {
    console.log('✅ CRM Customers seeded successfully.');
  }

  // 5. Create Products
  const productIds: string[] = [];
  const productsData = [];
  for (let i = 0; i < 5; i++) {
    const prodId = faker.string.uuid();
    productIds.push(prodId);
    const title = faker.commerce.productName();
    productsData.push({
      id: prodId,
      org_id: orgId,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: faker.commerce.productDescription(),
      status: 'ACTIVE'
    });
  }

  const { error: prodError } = await db.supabase.from('prd_products').insert(productsData);
  if (prodError) {
    console.error('❌ Error seeding prd_products:', prodError);
  } else {
    console.log('✅ Products seeded successfully.');
  }

  // 6. Create Orders & Payments
  const ordersData = [];
  const paymentsData = [];
  for (let i = 0; i < 10; i++) {
    const orderId = faker.string.uuid();
    const customerId = faker.helpers.arrayElement(customerIds);
    const amount = parseFloat(faker.commerce.price({ min: 500, max: 5000 }));
    
    ordersData.push({
      id: orderId,
      org_id: orgId,
      customer_id: customerId,
      order_number: `ORD-${faker.string.numeric(6)}`,
      order_status: 'DELIVERED',
      payment_status: 'PAID',
      grand_total: amount,
      created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
    });

    paymentsData.push({
      id: faker.string.uuid(),
      amount,
      status: 'SUCCESS',
      created_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  const { error: ordError } = await db.supabase.from('oms_orders').insert(ordersData);
  if (ordError) {
    console.error('❌ Error seeding oms_orders:', ordError);
  } else {
    console.log('✅ Orders seeded successfully.');
  }

  const { error: payError } = await db.supabase.from('oms_payments').insert(paymentsData);
  if (payError) {
    console.error('❌ Error seeding oms_payments:', payError);
  } else {
    console.log('✅ Payments seeded successfully.');
  }

  // 7. Create Tickets
  const ticketsData = [];
  for (let i = 0; i < 5; i++) {
    ticketsData.push({
      id: faker.string.uuid(),
      org_id: orgId,
      ticket_number: `TKT-${faker.string.numeric(5)}`,
      subject: faker.lorem.sentence(),
      status: 'OPEN',
      created_at: new Date().toISOString()
    });
  }

  const { error: tktError } = await db.supabase.from('sup_tickets').insert(ticketsData);
  if (tktError) {
    console.error('❌ Error seeding sup_tickets:', tktError);
  } else {
    console.log('✅ Service Tickets seeded successfully.');
  }
}

async function seedDataSafe(db: any) {
  console.log('🌱 Safely initializing organization, branch, and linking existing users (skip wipe)...');

  // 1. Ensure/Create Organization
  let orgId = faker.string.uuid();
  const orgName = 'Tecbunny Platform Org';
  
  // Check if we already have an organization
  const { data: existingOrgs } = await db.supabase.from('org_organizations').select('id').limit(1);
  if (existingOrgs && existingOrgs.length > 0) {
    orgId = existingOrgs[0].id;
    console.log(`ℹ️ Using existing organization: ${orgId}`);
  } else {
    const { error: orgError } = await db.supabase.from('org_organizations').insert({
      id: orgId,
      name: orgName,
      registration_number: faker.string.numeric(8),
      tax_id: `GST${faker.string.numeric(10)}`,
      industry: 'Technology',
      status: 'ACTIVE'
    });
    if (orgError) {
      console.error('❌ Error seeding organization:', orgError);
      return;
    }
    console.log(`✅ Created initial organization: ${orgId}`);
  }

  // 2. Ensure/Create Branch
  let branchId = faker.string.uuid();
  const { data: existingBranches } = await db.supabase.from('org_branches').select('id').eq('org_id', orgId).limit(1);
  if (existingBranches && existingBranches.length > 0) {
    branchId = existingBranches[0].id;
    console.log(`ℹ️ Using existing branch: ${branchId}`);
  } else {
    const { error: branchError } = await db.supabase.from('org_branches').insert({
      id: branchId,
      org_id: orgId,
      name: `${orgName} Headquarters`,
      code: 'HQ',
      is_headquarters: true
    });
    if (branchError) {
      console.error('❌ Error seeding branch:', branchError);
      return;
    }
    console.log(`✅ Created initial branch: ${branchId}`);
  }

  // 3. Link Existing Auth Users to sys_users
  try {
    const { data: authUsersData, error: listError } = await db.supabase.auth.admin.listUsers();
    if (listError) {
      console.error('❌ Failed to retrieve existing auth users:', listError);
    } else {
      const usersList = authUsersData?.users || [];
      console.log(`ℹ️ Found ${usersList.length} users in Supabase Auth.`);
      
      for (const user of usersList) {
        // Check if user already exists in sys_users
        const { data: existingUser } = await db.supabase
          .from('sys_users')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingUser) {
          const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'User';
          const lastName = user.user_metadata?.last_name || '';

          const { error: userError } = await db.supabase.from('sys_users').insert({
            id: user.id,
            org_id: orgId,
            branch_id: branchId,
            employee_code: `EMP-${faker.string.numeric(4)}`,
            first_name: firstName,
            last_name: lastName,
            phone: user.phone || faker.string.numeric(10),
            is_active: true
          });

          if (userError) {
            console.error(`❌ Error inserting sys_user for ${user.email}:`, userError);
          } else {
            console.log(`✅ Linked existing user ${user.email} to sys_users.`);
          }

          // Also populate profiles table if missing
          await db.supabase.from('profiles').insert({
            id: user.id,
            full_name: `${firstName} ${lastName}`.trim(),
            phone: user.phone || faker.string.numeric(10),
            email: user.email,
            role: 'admin'
          }).maybeSingle();
        } else {
          console.log(`ℹ️ User ${user.email} is already linked.`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Error during safe user linking:', err);
  }
}

async function main() {
  const isSafeMode = process.argv.includes('--safe');
  console.log(`🚀 Starting database reset & seed process... [Safe Mode: ${isSafeMode}]`);
  try {
    const db = getAdminDb();
    if (!isSafeMode) {
      await clearDatabase(db);
      await seedData(db);
    } else {
      await seedDataSafe(db);
    }
    console.log('🎉 Database seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding process failed:', err);
  }
}

main();
