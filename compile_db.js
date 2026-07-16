const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
const outputFile = path.join(__dirname, 'database.sql');

async function compileDB() {
    console.log('Starting Database Compilation...');
    
    // 1. Get all SQL files and sort them chronologically
    // We STRICTLY exclude legacy files to satisfy the "Remove Duplicates & Keep Best Version" rule.
    const excludedFiles = [
        '20240101000000_initial_schema.sql',
        '20260711000001_payment_transaction_rpc.sql',
        '20260715000000_superadmin_os_core.sql'
    ];

    let files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql') && !excludedFiles.includes(f));
        
    // Enforce explicit dependency order for core identity tables
    const priorityOrder = [
        '20260715000002_enterprise_audit_core.sql', // sys_audit_logs
        '20260715000003_rbac_module.sql',           // sys_roles, sys_permissions
        '20260715000005_core_iam.sql'               // org_organizations, sys_users
    ];

    files.sort((a, b) => {
        const indexA = priorityOrder.indexOf(a);
        const indexB = priorityOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    console.log(`Found ${files.length} migration files.`);

    let enums = new Set();
    let functions = new Set();
    let tablesAndViews = [];
    let automationBlocks = [];

    // Regex patterns
    const enumRegex = /DO \$\$ BEGIN\s+CREATE TYPE public\.enum_[^;]+;\s*EXCEPTION WHEN duplicate_object THEN null;\s*END \$\$;/g;
    
    // To match the massive trigger assignment DO blocks
    const doBlockRegex = /DO \$\$\s*DECLARE\s*tbl TEXT;\s*BEGIN\s*FOR tbl IN[\s\S]*?END \$\$;/g;
    
    // The core audit functions from script 002
    const functionRegex = /CREATE OR REPLACE FUNCTION public\.trg_[^;]+;\s*\$\$\s*LANGUAGE plpgsql( SECURITY DEFINER)?;?/g;

    for (const file of files) {
        let content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

        // Extract ENUMs (Idempotent blocks)
        const matchedEnums = content.match(enumRegex) || [];
        matchedEnums.forEach(e => enums.add(e));
        content = content.replace(enumRegex, ''); // Remove from main body

        // Extract Audit Functions
        const matchedFunctions = content.match(functionRegex) || [];
        matchedFunctions.forEach(f => functions.add(f));
        content = content.replace(functionRegex, '');

        // Extract dynamic DO blocks (Trigger & RLS assignment loops)
        const matchedDoBlocks = content.match(doBlockRegex) || [];
        matchedDoBlocks.forEach(d => {
            // Guarantee idempotency by stripping any manual drops and strictly injecting them before CREATE
            let safeBlock = d.replace(/EXECUTE format\('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl\);\s*/g, '');
            safeBlock = safeBlock.replace(/EXECUTE format\('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl\);\s*/g, '');
            
            // Inject strictly before CREATE TRIGGER
            safeBlock = safeBlock.replace(
                "EXECUTE format('CREATE TRIGGER trg_%I_updated_at",
                "EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', tbl, tbl);\n        EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_audit ON public.%I', tbl, tbl);\n        EXECUTE format('CREATE TRIGGER trg_%I_updated_at"
            );
            
            // Guarantee idempotency for policies by dropping before creating
            safeBlock = safeBlock.replace(
                /EXECUTE format\('CREATE POLICY "([^"]+)" ON public\.%I (.*?)\);\s*/g,
                "EXECUTE format('DROP POLICY IF EXISTS \"$1\" ON public.%I', tbl, tbl);\n        EXECUTE format('CREATE POLICY \"$1\" ON public.%I $2);\n        "
            );
            
            automationBlocks.push(safeBlock);
        });
        content = content.replace(doBlockRegex, '');

        tablesAndViews.push(`\n-- ==========================================\n-- MODULE: ${file}\n-- ==========================================\n`);
        tablesAndViews.push(content.trim());
    }

    // 2. Assemble the chunked parts
    let resetSQL = `-- ==========================================
-- 0. RESET SCHEMA (Idempotency)
-- ==========================================
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;

-- 2. ENUM TYPES
`;

    let finalSQL = `-- ==========================================
-- ENTERPRISE SUPERADMIN OS DATABASE
-- ==========================================
-- This file contains the fully integrated, merged, and optimized 
-- production database schema. Capable of supporting millions of records.
-- ==========================================\n\n` + resetSQL;


    // Write deduplicated ENUMs
    finalSQL += Array.from(enums).join('\n\n') + '\n\n';

    // 3. FUNCTIONS (Core Audit & Utilities)
    finalSQL += `-- 3. CORE FUNCTIONS\n`;
    finalSQL += Array.from(functions).join('\n\n') + '\n\n';

    // 4. TABLES, CONSTRAINTS, INDEXES, VIEWS (Chronological execution prevents FK breaks)
    finalSQL += `-- 4. TABLES, FOREIGN KEYS, INDEXES, VIEWS\n`;
    finalSQL += tablesAndViews.join('\n\n') + '\n\n';

    // 5. AUTOMATED TRIGGERS & RLS POLICIES (Applied at the end once all tables exist)
    finalSQL += `-- 5. DYNAMIC TRIGGERS & RLS AUTOMATION\n`;
    finalSQL += automationBlocks.join('\n\n') + '\n\n';

    // Save the monolithic file
    fs.writeFileSync(outputFile, finalSQL, 'utf8');
    
    // Save chunked files to bypass max_locks_per_transaction in Supabase editor
    let part1 = `-- PART 1: INIT, ENUMS, & FUNCTIONS\n${resetSQL}\n${Array.from(enums).join('\n\n')}\n\n${Array.from(functions).join('\n\n')}`;
    let part2 = `-- PART 2: TABLES, FKs, & VIEWS\n${tablesAndViews.join('\n\n')}`;
    let part3 = `-- PART 3: DYNAMIC TRIGGERS & RLS\n${automationBlocks.join('\n\n')}`;
    
    fs.writeFileSync(path.join(__dirname, 'db_part1.sql'), part1, 'utf8');
    fs.writeFileSync(path.join(__dirname, 'db_part2.sql'), part2, 'utf8');
    fs.writeFileSync(path.join(__dirname, 'db_part3.sql'), part3, 'utf8');

    console.log(`\nSuccess! Wrote fully integrated database to ${outputFile}`);
    console.log(`Also generated db_part1.sql, db_part2.sql, and db_part3.sql for safe execution.`);
}

compileDB().catch(console.error);
