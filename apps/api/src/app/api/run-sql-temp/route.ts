import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const prisma = new PrismaClient();
  try {
    const results: any[] = [];
    
    // 1. Create public.products view mapped to prd_products with fallback column names
    console.log("Creating public.products view...");
    const productsViewSql = `
      CREATE OR REPLACE VIEW public.products AS 
      SELECT 
        id,
        org_id,
        title,
        slug,
        description,
        status::text as status,
        created_at,
        updated_at,
        deleted_at,
        title as name,
        slug as handle,
        slug as permalink
      FROM public.prd_products;
    `;
    results.push({
      step: 'products_view',
      result: await prisma.$executeRawUnsafe(productsViewSql)
    });
    
    // 2. Create public.settings view mapped to cms_settings
    console.log("Creating public.settings view...");
    const settingsViewSql = `
      CREATE OR REPLACE VIEW public.settings AS 
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

    // 3. Grant schema usage
    console.log("Granting usage on public schema...");
    results.push({
      step: 'schema_usage',
      result: await prisma.$executeRawUnsafe(`
        GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
      `)
    });

    // 4. Grant select on the new views
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

    // 5. Grant access to all tables for service_role
    console.log("Granting full access to all tables in public schema for service_role...");
    results.push({
      step: 'grant_all_tables_service_role',
      result: await prisma.$executeRawUnsafe(`
        GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
      `)
    });

    // 6. Grant select access to all tables for public/anon
    console.log("Granting select access to all tables in public schema for anon and authenticated...");
    results.push({
      step: 'grant_all_tables_public',
      result: await prisma.$executeRawUnsafe(`
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
      `)
    });

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("SQL execution error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
