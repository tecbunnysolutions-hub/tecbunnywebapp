const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const updateFile = path.join(process.cwd(), 'supabase', 'update_products.sql');
const outputFile = path.join(migrationsDir, 'final_schema.sql');

const filesToMerge = [
  '20260608000000_final_schema.sql',
  '20260619000000_global_app_config.sql',
  '20260620000000_performance_database_hardening.sql',
  '20260621000000_storage_security_hardening.sql',
  '20260621095702_create_otp_verifications.sql',
  '20260621230000_dynamic_rbac_schema.sql',
  '20260622000000_immutable_audit_trails.sql'
];

let finalContent = '-- CONSOLIDATED SUPABASE SCHEMA --\n';
finalContent += '-- Note: This file aggregates all sequential migrations into a single file.\n\n';

for (const file of filesToMerge) {
  const filePath = path.join(migrationsDir, file);
  if (fs.existsSync(filePath)) {
    finalContent += `\n\n-- =============================================\n`;
    finalContent += `-- MERGED MIGRATION: ${file}\n`;
    finalContent += `-- =============================================\n\n`;
    finalContent += fs.readFileSync(filePath, 'utf8');
  } else {
    console.warn(`File not found: ${filePath}`);
  }
}

if (fs.existsSync(updateFile)) {
    finalContent += `\n\n-- =============================================\n`;
    finalContent += `-- MERGED: update_products.sql\n`;
    finalContent += `-- =============================================\n\n`;
    finalContent += fs.readFileSync(updateFile, 'utf8');
}

fs.writeFileSync(outputFile, finalContent, 'utf8');
console.log('Successfully consolidated all migrations into final_schema.sql');
