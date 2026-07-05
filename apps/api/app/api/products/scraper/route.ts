import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseServiceConfigured } from '@/lib/supabase/server';
import { processAndUploadExternalImage } from '@/lib/image-processor';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-superadmin-username, x-superadmin-password',
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
    const { 
      title, price, mrp, category, brand, description, imageUrl, sourceUrl,
      shortDescription, seoTitle, seoDescription, modelNo, warrantyPeriod, warrantyType, additional1, additional2, additional3
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Bad Request: Product title is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 4. Parse Price and MRP
    let parsedPrice = 0;
    if (price) {
      // Remove currency symbols, commas, and other non-digit/non-dot characters
      const cleanPriceStr = price.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleanPriceStr);
      if (!isNaN(parsed)) {
        parsedPrice = parsed;
      }
    }

    let parsedMrp = null;
    if (mrp) {
      const cleanMrpStr = mrp.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleanMrpStr);
      if (!isNaN(parsed)) {
        parsedMrp = parsed;
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

    // 7. Process and Upload image to Supabase Storage
    let finalImageUrl = imageUrl || null;
    if (imageUrl) {
      try {
        const uploadedUrl = await processAndUploadExternalImage(imageUrl, supabase);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      } catch (err) {
        console.error('[Scraper Image Upload Warning]:', err);
      }
    }
    
    const productPayload = {
      handle,
      name: title,
      title: title,
      description: description || '',
      price: parsedPrice,
      mrp: parsedMrp,
      category: category || null,
      brand: brand || null,
      image: finalImageUrl,
      images: finalImageUrl ? [finalImageUrl] : [],
      status: 'active', // Saved as active directly
      product_type: 'physical',
      specifications: {
        ...(modelNo && { 'Model No.': modelNo }),
        ...(warrantyPeriod && { 'Warranty Period': warrantyPeriod }),
        ...(warrantyType && { 'Warranty Type': warrantyType }),
        ...(additional1 && { 'Additional 1': additional1 }),
        ...(additional2 && { 'Additional 2': additional2 }),
        ...(additional3 && { 'Additional 3': additional3 }),
        ...(seoTitle && { seo_title: seoTitle }),
        ...(seoDescription && { seo_description: seoDescription })
      },
      short_description: shortDescription || null,
      tags: ['scraped'],
      is_active: true,
      stock_quantity: 1,
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
