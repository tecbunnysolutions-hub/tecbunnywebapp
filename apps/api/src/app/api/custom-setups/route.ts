import { NextRequest } from 'next/server';

import { APIResponseBuilder } from "@tecbunny/core/api-response";
import { getCustomSetupBlueprintSummary, fetchCustomSetupTemplateBySlug } from "@tecbunny/core/custom-setup-service";
import { logger } from "@tecbunny/core";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const includeRaw = searchParams.get('includeRaw');

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
      return APIResponseBuilder.success({ template, summary });
    }

    return APIResponseBuilder.success({ summary });
  } catch (error) {
    logger.error('api.custom_setups.fetch_failed', {
      slug,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error
    });
    return APIResponseBuilder.internalServerError('Failed to fetch custom setup template');
  }
}
