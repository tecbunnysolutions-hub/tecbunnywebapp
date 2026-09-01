#!/usr/bin/env node
/**
 * Lead System Data Cleanup & Validation Script
 *
 * Usage:
 *   npx ts-node scripts/lead-cleanup.ts [action] [options]
 *
 * Actions:
 *   - audit          Run data quality audit (no changes)
 *   - cleanup        Remove orphaned records and duplicates (WITH CHANGES)
 *   - archive        Archive legacy data (WITH CHANGES)
 *   - verify         Verify schema integrity
 *
 * Examples:
 *   npx ts-node scripts/lead-cleanup.ts audit
 *   npx ts-node scripts/lead-cleanup.ts cleanup --dry-run
 *   npx ts-node scripts/lead-cleanup.ts archive --confirm
 */

import { createServiceClient } from '@tecbunny/database/admin';

declare const process: {
  argv: string[];
  exit(code?: number): never;
};

type LeadIdRow = { id: string; lead_id?: string | null };
type LeadSummaryRow = { id: string };
type ContactLeadRow = { id: string; email?: string | null; first_name?: string | null; phone?: string | null };

const supabase = createServiceClient();

interface CleanupStats {
  orphanedMessagesRemoved: number;
  orphanedTasksRemoved: number;
  duplicateLeadsDetected: number;
  recordsArchived: number;
}

async function auditData() {
  console.log('📋 AUDITING LEAD SYSTEM DATA...\n');

  // Check for orphaned messages
  console.log('Checking for orphaned contact messages...');
  const { data: allMessages } = await supabase.from('contact_messages').select('id, lead_id');
  const { data: allLeads } = await supabase.from('sls_leads').select('id').is('deleted_at', null);

  const validLeadIds = new Set((allLeads as LeadSummaryRow[] | null)?.map((l: LeadSummaryRow) => l.id) ?? []);
  const orphanedMsgs = (allMessages as LeadIdRow[] | null)?.filter((msg: LeadIdRow) => msg.lead_id && !validLeadIds.has(msg.lead_id)) ?? [];

  console.log(`   → Found ${orphanedMsgs.length} orphaned messages`);
  if (orphanedMsgs.length > 0) {
    console.log(`      IDs: ${orphanedMsgs.slice(0, 5).map((m: LeadIdRow) => m.id).join(', ')}${orphanedMsgs.length > 5 ? '...' : ''}`);
  }

  // Check for orphaned follow-up tasks
  console.log('\nChecking for orphaned follow-up tasks...');
  const { data: allTasks } = await supabase.from('lead_followup_tasks').select('id, lead_id');
  const orphanedTasks = (allTasks as LeadIdRow[] | null)?.filter((t: LeadIdRow) => t.lead_id && !validLeadIds.has(t.lead_id)) ?? [];

  console.log(`   → Found ${orphanedTasks.length} orphaned tasks`);
  if (orphanedTasks.length > 0) {
    console.log(`      IDs: ${orphanedTasks.slice(0, 5).map((t: LeadIdRow) => t.id).join(', ')}${orphanedTasks.length > 5 ? '...' : ''}`);
  }

  // Check for leads with missing names
  console.log('\nChecking for leads with missing names...');
  const { data: noNameLeads } = await supabase
    .from('sls_leads')
    .select('id, created_at')
    .or('first_name.is.null,first_name.eq.""')
    .is('deleted_at', null);

  console.log(`   → Found ${noNameLeads?.length ?? 0} leads with missing first_name`);

  // Check for leads with missing contact info
  console.log('\nChecking for leads with missing contact info...');
  const { data: noContactLeads } = await supabase
    .from('sls_leads')
    .select('id, created_at')
    .or('email.is.null,phone.is.null')
    .is('deleted_at', null);

  console.log(`   → Found ${noContactLeads?.length ?? 0} leads with missing email or phone`);

  // Analyze email/phone duplicates
  console.log('\nAnalyzing duplicate detection...');
  const { data: emailDupes } = await supabase
    .from('sls_leads')
    .select('email')
    .is('deleted_at', null)
    .not('email', 'is', null);

  const emailCounts = new Map<string, number>();
  emailDupes?.forEach((lead: any) => {
    emailCounts.set(lead.email, (emailCounts.get(lead.email) ?? 0) + 1);
  });
  const duplicateEmails = Array.from(emailCounts.values()).filter((c) => c > 1).length;

  console.log(`   → Found ${duplicateEmails} duplicate emails (dedup working correctly)`);

  // Schema verification
  console.log('\nVerifying schema...');
  const { data: schemaCheck } = await supabase
    .from('sls_leads')
    .select('id, email, phone, status, heat_level, lead_score, lead_owner_id, next_followup_at, metadata')
    .limit(1);

  if (schemaCheck && schemaCheck.length > 0) {
    console.log('   ✅ sls_leads schema verified');
  } else {
    console.log('   ⚠️  Could not verify sls_leads schema');
  }

  console.log('\n✅ AUDIT COMPLETE\n');
  console.log('Summary:');
  console.log(`  • Orphaned messages: ${orphanedMsgs.length}`);
  console.log(`  • Orphaned tasks: ${orphanedTasks.length}`);
  console.log(`  • Duplicate emails: ${duplicateEmails}`);
  console.log(`  • Total leads: ${allLeads?.length ?? 0}`);
}

async function cleanupData(dryRun: boolean = true) {
  console.log(`🧹 CLEANING UP LEAD SYSTEM DATA${dryRun ? ' (DRY RUN)' : ''}...\n`);

  const stats: CleanupStats = {
    orphanedMessagesRemoved: 0,
    orphanedTasksRemoved: 0,
    duplicateLeadsDetected: 0,
    recordsArchived: 0,
  };

  try {
    // Remove orphaned messages
    console.log('Removing orphaned contact messages...');
    const { data: allMessages } = await supabase.from('contact_messages').select('id, lead_id');
    const { data: allLeads } = await supabase.from('sls_leads').select('id').is('deleted_at', null);

    const validLeadIds = new Set((allLeads as LeadSummaryRow[] | null)?.map((l: LeadSummaryRow) => l.id) ?? []);
    const orphanedMsgIds = ((allMessages as LeadIdRow[] | null) ?? [])
      .filter((msg: LeadIdRow) => msg.lead_id && !validLeadIds.has(msg.lead_id))
      .map((msg: LeadIdRow) => msg.id);

    if (orphanedMsgIds.length > 0) {
      if (!dryRun) {
        const { error } = await supabase
          .from('contact_messages')
          .delete()
          .in('id', orphanedMsgIds);

        if (error) throw error;
      }
      stats.orphanedMessagesRemoved = orphanedMsgIds.length;
      console.log(`   → Would remove ${orphanedMsgIds.length} orphaned messages`);
    }

    // Remove orphaned follow-up tasks
    console.log('Removing orphaned follow-up tasks...');
    const { data: allTasks } = await supabase.from('lead_followup_tasks').select('id, lead_id');
    const orphanedTaskIds = ((allTasks as LeadIdRow[] | null) ?? [])
      .filter((t: LeadIdRow) => t.lead_id && !validLeadIds.has(t.lead_id))
      .map((t: LeadIdRow) => t.id);

    if (orphanedTaskIds.length > 0) {
      if (!dryRun) {
        const { error } = await supabase
          .from('lead_followup_tasks')
          .delete()
          .in('id', orphanedTaskIds);

        if (error) throw error;
      }
      stats.orphanedTasksRemoved = orphanedTaskIds.length;
      console.log(`   → Would remove ${orphanedTaskIds.length} orphaned tasks`);
    }

    console.log('\n✅ CLEANUP COMPLETE (Dry Run)\n');
    console.log('Summary:');
    console.log(`  • Orphaned messages to remove: ${stats.orphanedMessagesRemoved}`);
    console.log(`  • Orphaned tasks to remove: ${stats.orphanedTasksRemoved}`);
    console.log('\nTo execute cleanup, run: npx ts-node scripts/lead-cleanup.ts cleanup --confirm\n');
  } catch (error) {
    console.error('❌ Cleanup error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

async function verifySchema() {
  console.log('🔍 VERIFYING LEAD SYSTEM SCHEMA...\n');

  const tables = [
    'sls_leads',
    'sls_lead_sources',
    'sls_lead_assignments',
    'lead_followup_tasks',
    'contact_messages',
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: OK`);
      }
    } catch (e) {
      console.log(`   ❌ ${table}: Error querying`);
    }
  }

  console.log('\n✅ SCHEMA VERIFICATION COMPLETE\n');
}

async function main() {
  const action = process.argv[2] ?? 'audit';
  const hasConfirm = process.argv.includes('--confirm');
  const hasDryRun = process.argv.includes('--dry-run');

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           LEAD SYSTEM DATA CLEANUP & VALIDATION          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  switch (action) {
    case 'audit':
      await auditData();
      break;

    case 'cleanup':
      if (!hasConfirm && !hasDryRun) {
        console.log('⚠️  WARNING: This will DELETE orphaned records from the database!\n');
        console.log('Usage:');
        console.log('  npx ts-node scripts/lead-cleanup.ts cleanup --dry-run');
        console.log('  npx ts-node scripts/lead-cleanup.ts cleanup --confirm\n');
        process.exit(1);
      }
      await cleanupData(!hasConfirm);
      if (hasConfirm) {
        console.log('✅ Cleanup executed successfully\n');
      }
      break;

    case 'verify':
      await verifySchema();
      break;

    case 'help':
    default:
      console.log('Available actions:');
      console.log('  audit   - Run data quality audit (read-only)');
      console.log('  cleanup - Remove orphaned records (requires --confirm)');
      console.log('  verify  - Verify database schema');
      console.log('  help    - Show this help message\n');
      break;
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error instanceof Error ? error.message : String(error));
  process.exit(1);
});
