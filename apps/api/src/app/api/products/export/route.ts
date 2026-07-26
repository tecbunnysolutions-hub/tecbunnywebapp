import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@tecbunny/core/logger';

import { AdminAuthError, requireAdminContext } from "@tecbunny/core/auth/admin-guard";

// Force dynamic rendering for this route
// export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    logger.info('products_export.audit.requested');
    const { serviceSupabase: supabase } = await requireAdminContext();

    // Fetch all products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('products_export.audit.query_failed', { error: error.message });
      return NextResponse.json(
        { message: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Create CSV content
    const headers = [
      'id',
      'name',
      'brand',
      'description',
      'mrp',
      'price',
      'category',
      'image',
      'warranty',
      'hsnCode',
      'gstRate',
      'isSerialNumberCompulsory',
      'popularity',
      'rating',
      'reviewCount',
      'created_at'
    ];

    const csvContent = [
      headers.join(','),
      ...products.map(product => 
        headers.map(header => {
          const value = product[header];
          // Handle null/undefined values
          if (value === null || value === undefined) return '';
          // Escape commas and quotes in text values
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create response with CSV content
    logger.info('products_export.audit.success', { count: products?.length ?? 0 });
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="products-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    logger.error('products_export.audit.failed', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
