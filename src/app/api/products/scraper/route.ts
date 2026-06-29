import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseServiceConfigured } from '@/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate Request using Superadmin credentials
    const usernameHeader = request.headers.get('x-superadmin-username') || '';
    const passwordHeader = request.headers.get('x-superadmin-password') || '';

    const expectedUsername = process.env.SUPERADMIN_USER_ID || 'Shubham6010';
    const expectedPassword = process.env.SUPERADMIN_PASSWORD || 'Bunny@6010';

    if (usernameHeader !== expectedUsername || passwordHeader !== expectedPassword) {
      return NextResponse.json(
        { error: 'Forbidden: Invalid Superadmin credentials.' },
        { status: 403, headers: corsHeaders }
      );
    }

    // 2. Validate Supabase Configuration
    if (!isSupabaseServiceConfigured) {
      return NextResponse.json(
        { error: 'Service configuration error: Supabase service role is not configured' },
        { status: 503, headers: corsHeaders }
      );
    }

    // 3. Parse and Validate Request Body
    const body = await request.json();
    const { title, price, description, imageUrl, sourceUrl } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Bad Request: Product title is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 4. Parse Price
    let parsedPrice = 0;
    if (price) {
      // Remove currency symbols, commas, and other non-digit/non-dot characters
      const cleanPriceStr = price.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleanPriceStr);
      if (!isNaN(parsed)) {
        parsedPrice = parsed;
      }
    }

    // 5. Generate unique handle slug
    const slugify = (val: string) => {
      return val
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);
    };

    const baseSlug = slugify(title) || 'scraped-product';
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const handle = `${baseSlug}-${randomSuffix}`;

    // 6. Insert Product using Service Role Client (bypasses RLS)
    const supabase = createServiceClient();
    
    const productPayload = {
      handle,
      name: title,
      title: title,
      description: description || '',
      price: parsedPrice,
      image: imageUrl || null,
      images: imageUrl ? [imageUrl] : [],
      status: 'draft', // Saved as draft for admin moderation
      product_type: 'physical',
      specifications: { sourceUrl: sourceUrl || '' },
      tags: ['scraped'],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productPayload])
      .select()
      .single();

    if (error) {
      console.error('[Scraper Import Error]:', error);
      return NextResponse.json(
        { error: `Database Insert Error: ${error.message}` },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, product: data },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error('[Scraper API Exception]:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message || error}` },
      { status: 500, headers: corsHeaders }
    );
  }
}
