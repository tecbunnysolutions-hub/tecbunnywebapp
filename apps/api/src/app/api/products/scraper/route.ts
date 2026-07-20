import { createSupabaseServiceClient, isSupabaseServiceConfigured } from "@tecbunny/core/server";;
import { NextRequest, NextResponse } from 'next/server';
import { processAndUploadExternalImage } from "@tecbunny/core/image-processor";
import { ExtensionAuthError, extensionJson, extensionOptionsResponse, requireExtensionAdmin } from '../../extension-security';

export async function OPTIONS(request: NextRequest) {
  return extensionOptionsResponse(request);
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate Request Manually
    // Since /api/products is public in middleware, we must verify the token here.
    await requireExtensionAdmin(request);

    // 2. Validate Supabase Configuration
    if (!isSupabaseServiceConfigured) {
      return extensionJson(
        request,
        { error: 'Service configuration error: Supabase service role is not configured' },
        { status: 503 }
      );
    }

    // 3. Parse and Validate Request Body
    const body = await request.json();
    const { 
      title, price, mrp, category, brand, description, imageUrl, sourceUrl,
      shortDescription, seoTitle, seoDescription, modelNo, warrantyPeriod, warrantyType, additional1, additional2, additional3
    } = body;

    if (!title) {
      return extensionJson(
        request,
        { error: 'Bad Request: Product title is required' },
        { status: 400 }
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
    const supabase = createSupabaseServiceClient();

    // 7. Process and Upload image to Supabase Storage
    let finalImageUrl = null;
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
      status: 'draft',
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
      stock_quantity: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    let insertResult = await supabase
      .from('products')
      .insert([productPayload])
      .select()
      .single();

    if (insertResult.error && /short_description/i.test(insertResult.error.message || '')) {
      const fallbackPayload = { ...productPayload } as Record<string, unknown>;
      delete fallbackPayload.short_description;
      if (!fallbackPayload.description && shortDescription) {
        fallbackPayload.description = shortDescription;
      }

      insertResult = await supabase
        .from('products')
        .insert([fallbackPayload])
        .select()
        .single();
    }

    const { data, error } = insertResult;

    if (error) {
      console.error('[Scraper Import Error]:', error);
      return extensionJson(
        request,
        { error: `Database Insert Error: ${error.message}` },
        { status: 500 }
      );
    }

    return extensionJson(
      request,
      { success: true, product: data },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Scraper API Exception]:', error);
    return extensionJson(
      request,
      { error: `Internal Server Error: ${error.message || error}` },
      { status: error instanceof ExtensionAuthError ? error.status : 500 }
    );
  }
}
