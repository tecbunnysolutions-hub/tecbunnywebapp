import { createClient } from '@tecbunny/database';
import { NextResponse } from 'next/server';
import { APIResponseBuilder } from "@tecbunny/core/api-response";
import { logger } from '@tecbunny/core/logger';


export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    logger.info('faqs.audit.requested');
    const supabase = await createClient();

    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('id, category, question, answer, display_order, is_published, created_at, updated_at')
      .eq('is_published', true)
      .order('category', { ascending: true })
      .order('display_order', { ascending: true });

    if (error) {
      logger.error('faqs.audit.query_failed', { error: error.message });
      return APIResponseBuilder.internalServerError('Failed to fetch FAQs', {
        error: error.message,
      });
    }

    logger.info('faqs.audit.success', { count: faqs?.length ?? 0 });
    const response = APIResponseBuilder.success({ faqs });
    response.headers.set('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (error: any) {
    logger.error('faqs.audit.failed', { error: error?.message ?? String(error) });
    return APIResponseBuilder.internalServerError('An unexpected error occurred while fetching FAQs', {
      error: error.message,
    });
  }
}
