import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { getAdminDb } from '@tecbunny/core/db';
import { TRPCError } from '@trpc/server';
import { logger } from '@tecbunny/core';

const createMessageSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().min(5).max(160),
  phone: z.string().min(6).max(32).optional().or(z.literal('').transform(() => undefined)),
  subject: z.string().min(2).max(160).optional().or(z.literal('').transform(() => undefined)),
  message: z.string().min(10).max(5000),
  company_name: z.string().max(160).optional().or(z.literal('').transform(() => undefined)),
  origin_path: z.string().max(240).optional(),
  form_identifier: z.string().max(100).optional(),
  utm_source: z.string().max(160).optional(),
  utm_medium: z.string().max(160).optional(),
  utm_campaign: z.string().max(160).optional(),
});

function classifyInquiry(input: {
  originPath?: string;
  formIdentifier?: string;
  subject?: string;
}) {
  const originPath = input.originPath?.split('?')[0]?.trim() || '';
  const formIdentifier = input.formIdentifier?.trim().toLowerCase() || '';
  const subject = input.subject?.trim().toLowerCase() || '';

  if (originPath === '/webdev' || formIdentifier === 'web_development_contact' || subject.includes('web development')) {
    return {
      category: 'Sales' as const,
      originKey: 'web_development',
      originPath: '/webdev',
    };
  }

  if (
    originPath === '/services/smart-infrastructure'
    || formIdentifier === 'smart_infrastructure_proposal'
  ) {
    return {
      category: 'Services' as const,
      originKey: 'smart_infrastructure',
      originPath: '/services/smart-infrastructure',
    };
  }

  if (formIdentifier === 'services_core_desk') {
    return {
      category: 'Services' as const,
      originKey: 'services_core_desk',
      originPath: originPath || '/services',
    };
  }

  return {
    category: 'Sales' as const,
    originKey: 'general_contact',
    originPath: originPath || '/contact',
  };
}

export const contactMessagesRouter = router({
  submit: publicProcedure
    .input(createMessageSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        logger.info('rpc_contact_messages.audit.submit_requested', {
          formIdentifier: input.form_identifier ?? null,
          originPath: input.origin_path ?? null,
        });
        const db = getAdminDb();
        const classification = classifyInquiry({
          originPath: input.origin_path,
          formIdentifier: input.form_identifier,
          subject: input.subject,
        });

        const payload = {
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          phone: input.phone?.trim() || null,
          subject: input.subject?.trim() || null,
          message: input.message.trim(),
          status: 'New',
          ip_address: null, // TRPC ctx doesn't easily expose IP by default, omit or pass from client
          company_name: input.company_name?.trim() || null,
          inquiry_category: classification.category,
          origin_key: classification.originKey,
          origin_path: classification.originPath,
          form_identifier: input.form_identifier?.trim().toLowerCase() || null,
          utm_source: input.utm_source?.trim() || null,
          utm_medium: input.utm_medium?.trim() || null,
          utm_campaign: input.utm_campaign?.trim() || null,
          last_activity_at: new Date().toISOString(),
        };

        const result = await db.from('contact_messages').insert(payload).select('id').single();
        if (result.error) {
          logger.error('rpc_contact_messages.audit.submit_failed', { error: result.error.message });
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: result.error.message });
        }
        logger.info('rpc_contact_messages.audit.submit_success', { id: result.data?.id ?? null });
        return { success: true, id: result.data.id };
      } catch (err) {
        logger.error('rpc_contact_messages.audit.submit_unhandled', { error: err instanceof Error ? err.message : String(err) });
        if (err instanceof TRPCError) throw err;
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Unexpected error' });
      }
    }),
});
