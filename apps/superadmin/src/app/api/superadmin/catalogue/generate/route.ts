import { NextRequest, NextResponse } from 'next/server';

import { generateCataloguePdf } from '@tecbunny/core/catalogue-pdf-generator';
import { logger } from '@tecbunny/core/logger';
import { createServiceClient } from '@tecbunny/database/admin';
import { requireSuperadminApi } from '@/lib/superadmin-api';

export async function POST(request: NextRequest) {
  const auth = await requireSuperadminApi('superadmin_catalogue');
  if (!auth.authorized) return auth.response;
  logger.info('superadmin_catalogue.audit.generate_requested', { userId: auth.user?.id ?? null });

  try {
    const body = await request.json().catch(() => ({}));
    const productIds = Array.isArray(body.productIds) ? body.productIds.filter((id: unknown) => typeof id === 'string') : [];
    const serviceIds = Array.isArray(body.serviceIds) ? body.serviceIds.filter((id: unknown) => typeof id === 'string') : [];
    const includePricing = body.includePricing !== false;

    if (productIds.length === 0 && serviceIds.length === 0) {
      logger.warn('superadmin_catalogue.audit.generate_invalid_payload');
      return NextResponse.json({ error: 'Select at least one product or service' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const [productResult, serviceResult] = await Promise.all([
      productIds.length
        ? supabase.from('products').select('id,name,title,description,price,mrp,category,brand').in('id', productIds)
        : Promise.resolve({ data: [], error: null }),
      serviceIds.length
        ? supabase.from('services').select('id,name,title,description,price,mrp,category').in('id', serviceIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (productResult.error) throw productResult.error;
    if (serviceResult.error) throw serviceResult.error;

    const pdf = await generateCataloguePdf({
      products: productResult.data ?? [],
      services: serviceResult.data ?? [],
      includePricing,
    });

    logger.info('superadmin_catalogue.audit.generate_success', {
      productCount: productResult.data?.length ?? 0,
      serviceCount: serviceResult.data?.length ?? 0,
      includePricing,
    });
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="catalogue-${new Date().toISOString().slice(0, 10)}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    logger.error('superadmin_catalogue.audit.generate_failed', { error });
    logger.error('superadmin_catalogue.generate_failed', { error });
    return NextResponse.json({ error: 'Failed to generate catalogue' }, { status: 500 });
  }
}