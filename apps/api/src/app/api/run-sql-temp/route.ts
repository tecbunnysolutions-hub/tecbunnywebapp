import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const prisma = new PrismaClient();
  const dbUrl = process.env.DATABASE_URL || '';
  const maskedDbUrl = dbUrl.replace(/(:\/\/.*?):(.*?)@/, '$1:***@');
  try {
    const results = [];
    
    // 1. Create public.products view mapped to prd_products, prd_variants, prd_categories, and prd_tax_classes
    console.log("Creating public.products view...");
    const productsViewSql = `
      CREATE OR REPLACE VIEW public.products WITH (security_invoker = true) AS 
      SELECT 
        p.id,
        p.org_id,
        p.title,
        p.slug,
        p.description,
        p.status::text as status,
        p.created_at,
        p.updated_at,
        p.deleted_at,
        p.title as name,
        p.slug as handle,
        p.slug as permalink,
        coalesce(pr.base_price, 0)::numeric as price,
        coalesce(pr.compare_at_price, 0)::numeric as mrp,
        v.sku,
        coalesce(s.qty, 0)::integer as stock,
        coalesce(s.qty, 0)::integer as stock_quantity,
        c.name as category,
        m.url as imageUrl,
        m.url as image,
        t.gst_rate as gst_rate,
        t.hsn_sac_code as hsn_code
      FROM public.prd_products p
      LEFT JOIN public.prd_variants v ON p.id = v.product_id
      LEFT JOIN public.prd_pricing pr ON v.id = pr.variant_id
      LEFT JOIN (
        SELECT variant_id, sum(quantity_on_hand) as qty 
        FROM public.inv_stock 
        GROUP BY variant_id
      ) s ON v.id = s.variant_id
      LEFT JOIN public.prd_categories c ON p.category_id = c.id
      LEFT JOIN public.prd_tax_classes t ON p.tax_class_id = t.id
      LEFT JOIN (
        SELECT DISTINCT ON (product_id) product_id, url 
        FROM public.prd_media 
        ORDER BY product_id, display_order ASC
      ) m ON p.id = m.product_id;
    `;
    results.push({
      step: 'products_view',
      result: await prisma.$executeRawUnsafe(productsViewSql)
    });
    
    // 2. Create public.settings view mapped to cms_settings
    console.log("Creating public.settings view...");
    const settingsViewSql = `
      CREATE OR REPLACE VIEW public.settings WITH (security_invoker = true) AS 
      SELECT 
        key,
        value,
        description
      FROM public.cms_settings;
    `;
    results.push({
      step: 'settings_view',
      result: await prisma.$executeRawUnsafe(settingsViewSql)
    });

    // 3. Create public.sys_users_prisma view mapped to sys_users + auth.users
    console.log("Creating public.sys_users_prisma view...");
    const usersViewSql = `
      CREATE OR REPLACE VIEW public.sys_users_prisma WITH (security_invoker = true) AS
      SELECT 
        u.id,
        au.email,
        coalesce(u.first_name || ' ' || u.last_name, u.first_name, u.last_name, '') as name,
        u.phone as phone_number,
        u.org_id as organization_id,
        u.branch_id,
        (SELECT role_id FROM public.sys_user_roles ur WHERE ur.user_id = u.id LIMIT 1) as role_id,
        u.metadata as managed_pincodes,
        u.created_at as "createdAt"
      FROM public.sys_users u
      JOIN auth.users au ON u.id = au.id;
    `;
    results.push({
      step: 'users_view',
      result: await prisma.$executeRawUnsafe(usersViewSql)
    });

    // 4. Grant schema usage
    console.log("Granting usage on public schema...");
    results.push({
      step: 'schema_usage',
      result: await prisma.$executeRawUnsafe(`
        GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
      `)
    });

    // 5. Grant select on the views
    console.log("Granting select on views...");
    results.push({
      step: 'grant_products_view',
      result: await prisma.$executeRawUnsafe(`
        GRANT SELECT ON public.products TO anon, authenticated, service_role;
      `)
    });
    
    results.push({
      step: 'grant_settings_view',
      result: await prisma.$executeRawUnsafe(`
        GRANT SELECT ON public.settings TO anon, authenticated, service_role;
      `)
    });

    results.push({
      step: 'grant_users_view',
      result: await prisma.$executeRawUnsafe(`
        GRANT SELECT ON public.sys_users_prisma TO service_role;
      `)
    });

    // 6. Grant access to all tables for service_role
    console.log("Granting full access to all tables in public schema for service_role...");
    results.push({
      step: 'grant_all_tables_service_role',
      result: await prisma.$executeRawUnsafe(`
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
      `)
    });

    // 7. Grant select access to all tables for public/anon
    console.log("Granting select access to all tables in public schema for anon and authenticated...");
    results.push({
      step: 'grant_all_tables_public',
      result: await prisma.$executeRawUnsafe(`
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
      `)
    });

    return NextResponse.json({ success: true, results, dbUrl: maskedDbUrl });
  } catch (error) {
    console.error("SQL execution error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message, dbUrl: maskedDbUrl }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
