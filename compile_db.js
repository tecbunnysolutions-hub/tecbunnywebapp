const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const outputFile = path.join(__dirname, 'database.sql');
const outputResetFile = path.join(__dirname, 'database.reset.sql');

async function compileDB() {
    console.log('Starting Database Compilation (Chronological Concatenation)...');
    
    // We STRICTLY exclude legacy files to satisfy the "Remove Duplicates & Keep Best Version" rule.
    const excludedFiles = [
        '20240101000000_initial_schema.sql',
        '20260711000001_payment_transaction_rpc.sql',
        '20260715000000_superadmin_os_core.sql'
    ];

    let files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql') && !excludedFiles.includes(f));
        
    // Sort chronologically using natural locale comparison
    files.sort((a, b) => a.localeCompare(b));

    console.log(`Found ${files.length} migration files to compile.`);

    let tablesAndViews = [];

    for (const file of files) {
        let content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        tablesAndViews.push(`\n-- ==========================================\n-- MODULE: ${file}\n-- ==========================================\n`);
        tablesAndViews.push(content.trim());
    }

    const compiledSQL = tablesAndViews.join('\n\n') + '\n\n';

    // Output prod-safe database.sql (no DROP SCHEMA)
    fs.writeFileSync(outputFile, compiledSQL, 'utf8');
    console.log(`Success! Wrote non-destructive database schema to ${outputFile}`);

    // Output dev-only database.reset.sql (with DROP SCHEMA reset header)
    const resetHeader = `-- ==========================================
-- 0. RESET SCHEMA (Idempotency)
-- ==========================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;

`;
    fs.writeFileSync(outputResetFile, resetHeader + compiledSQL, 'utf8');
    console.log(`Success! Wrote dev-only database reset schema to ${outputResetFile}`);
}

compileDB().catch(console.error);

