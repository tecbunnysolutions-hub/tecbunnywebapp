const { PrismaClient } = require('@prisma/client');

async function run() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres:rIsMDeJHtOfDaA75@db.yzrznydkqcacjiwalmlw.supabase.co:5432/postgres"
      }
    }
  });

  try {
    console.log("Executing SQL grant command...");
    const result1 = await prisma.$executeRawUnsafe(
      `GRANT EXECUTE ON FUNCTION public.get_current_org_id() TO public;`
    );
    console.log("Grant execute on get_current_org_id success:", result1);

    // Let's also check if there is get_current_org_id(uuid) or other signatures, or if this succeeded.
  } catch (err) {
    console.error("SQL Grant failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
