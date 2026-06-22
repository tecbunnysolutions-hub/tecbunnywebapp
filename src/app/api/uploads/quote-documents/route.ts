import { NextRequest, NextResponse } from 'next/server';
import { uploadToSupabase } from '@/lib/supabase-storage';
import { logger } from '@/lib/logger';
import { createServiceClient } from '@/lib/supabase/server';
import { verifyQuoteActionToken } from '@/lib/quotes/action-token';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const quoteId = formData.get('quote_id') as string | null;
    const type = formData.get('type') as string | null;
    const actionToken = formData.get('action_token');

    if (!file || !quoteId) {
      return NextResponse.json({ error: 'Missing file or quote_id' }, { status: 400 });
    }

    // Basic size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Basic MIME type validation
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Please upload PDF, JPEG, or PNG.' }, { status: 400 });
    }

    // Validate quote_id exists in the database
    const supabase = createServiceClient();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(quoteId);
    let quoteQuery = supabase.from('quotes').select('id');
    quoteQuery = isUuid ? quoteQuery.eq('id', quoteId) : quoteQuery.eq('quote_number', quoteId);
    const { data: quote, error: quoteError } = await quoteQuery.single();

    if (quoteError || !quote) {
      logger.warn('quote_upload.quote_not_found', { quoteId });
      return NextResponse.json({ error: 'Invalid quote ID' }, { status: 404 });
    }

    if (!verifyQuoteActionToken(actionToken, quote.id, ['advance_payment'])) {
      return NextResponse.json({ error: 'Secure upload link is missing or expired' }, { status: 403 });
    }

    // Upload to Supabase Storage in folder 'quote-documents'
    const result = await uploadToSupabase(file, 'quote-documents');

    logger.info('quote_document_upload.success', {
      quoteId,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      publicUrl: result.secure_url
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      path: result.public_id
    });
  } catch (error: any) {
    logger.error('quote_document_upload.failed', { error });
    return NextResponse.json({
      error: 'Failed to upload document',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
