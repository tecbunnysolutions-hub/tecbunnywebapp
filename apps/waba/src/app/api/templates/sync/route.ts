import { NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

import { withAuditEvent } from '@tecbunny/core/enterprise-analytics';
import { syncInfobipTemplates } from '@/services/infobipService';
import { requireApiRole } from '@tecbunny/core/server-role-guard';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    logger.info('waba_templates_sync.audit.requested');
    const auth = await requireApiRole({ allowedRoles: ['admin', 'marketing_manager', 'superadmin', 'manager'] });
    if (auth.error) {
      logger.warn('waba_templates_sync.audit.unauthorized');
      return auth.error;
    }

    const result = await withAuditEvent({
      application: 'waba',
      module: 'templates',
      screen: '/api/templates/sync',
      action: 'whatsapp_template_provider_sync',
      description: 'Synchronized WhatsApp templates from provider',
      entityType: 'whatsapp_template_provider',
      entityId: 'infobip',
      oldValue: null,
      newValue: { provider: 'infobip' },
      reason: 'waba_template_provider_sync',
      context: { userId: auth.session?.user?.id, userEmail: auth.session?.user?.email, role: auth.role },
      apiEndpoint: '/api/templates/sync',
      httpMethod: 'POST',
      databaseTable: 'Template',
      priority: 'high',
    }, async () => syncInfobipTemplates());
    if (!result.success) {
      logger.error('waba_templates_sync.audit.failed', { details: result.error, status: result.status || 502 });
      return NextResponse.json({ error: 'Template sync failed', details: result.error }, { status: result.status || 502 });
    }

    logger.info('waba_templates_sync.audit.success');
    return NextResponse.json(result);
  } catch (error) {
    logger.error('waba_templates_sync.audit.exception', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Template sync failed' }, { status: 500 });
  }
}