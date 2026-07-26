import { NextRequest } from 'next/server';

import { APIResponseBuilder } from "@tecbunny/core/api-response";
import { getCustomSetupBlueprintSummary, fetchCustomSetupTemplateBySlug } from "@tecbunny/core/custom-setup-service";
import { logger } from "@tecbunny/core";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const includeRaw = searchParams.get('includeRaw');
  logger.info('custom_setups.audit.requested', { slug, includeRaw: includeRaw === 'true' });

  if (!slug) {
    return APIResponseBuilder.badRequest('Missing required "slug" query parameter');
  }

  try {
    const summary = await getCustomSetupBlueprintSummary(slug);

    if (!summary) {
      return APIResponseBuilder.notFound('Custom setup template not found');
    }

    if (includeRaw === 'true') {
      const template = await fetchCustomSetupTemplateBySlug(slug);
      logger.info('custom_setups.audit.success', { slug, mode: 'raw' });
      return APIResponseBuilder.success({ template, summary });
    }

    logger.info('custom_setups.audit.success', { slug, mode: 'summary' });
    return APIResponseBuilder.success({ summary });
  } catch (error) {
    logger.error('custom_setups.audit.failed', {
      slug,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error
    });
    return APIResponseBuilder.internalServerError('Failed to fetch custom setup template');
  }
}
