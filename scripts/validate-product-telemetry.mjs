import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const telemetryPath = join(root, 'packages/ui/src/product-telemetry.ts');
const source = readFileSync(telemetryPath, 'utf8');
const usageFiles = [
  'packages/ui/src/components/CommandPalette.tsx',
  'packages/admin-ui/src/shared/OrderDataTable.tsx',
  'apps/waba/src/components/waba/ChatMain.tsx',
  'apps/webmail/src/app/inbox/page.tsx',
  'apps/superadmin/src/app/superadmin/mgmt/system-health/page.tsx',
].map((file) => readFileSync(join(root, file), 'utf8')).join('\n');

const requiredEvents = [
  'command_palette_action_selected',
  'order_table_view_saved',
  'waba_canned_reply_inserted',
  'webmail_reply_staged',
  'launch_health_blocker_viewed',
];

const requiredSnippets = [
  'productTelemetryEvents',
  'ProductTelemetryEvent',
  'trackProductEvent',
  'tecbunny:product-telemetry',
];

const missing = [
  ...requiredEvents.filter((event) => !source.includes(event)).map((event) => `event: ${event}`),
  ...requiredEvents.filter((event) => !usageFiles.includes(event)).map((event) => `usage: ${event}`),
  ...requiredSnippets.filter((snippet) => !source.includes(snippet)).map((snippet) => `snippet: ${snippet}`),
];

if (missing.length > 0) {
  console.error('Product telemetry validation failed. Missing required launch telemetry contract entries:');
  for (const item of missing) console.error(`- ${item}`);
  process.exitCode = 1;
} else {
  console.log('Validated product telemetry event contract.');
}