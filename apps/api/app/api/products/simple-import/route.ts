import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, isSupabaseServiceConfigured } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { AdminAuthError, requireAdminContext } from '@/lib/auth/admin-guard';

export async function POST(request: NextRequest) {
  try {
    await requireAdminContext();
    if (!isSupabaseServiceConfigured) {
      logger.error('simple_import.supabase_configuration_missing');
      return NextResponse.json({ error: 'Service configuration error. Please contact support.' }, { status: 503 });
    }
    const supabase = createServiceClient();
    let text = '';
    
    // Handle both FormData (file upload) and JSON (direct CSV data)
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // File upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }
      
      text = await file.text();
    } else if (contentType.includes('application/json')) {
      // Direct CSV data
      const body = await request.json();
      if (!body.csvData) {
        return NextResponse.json({ error: 'No csvData provided' }, { status: 400 });
      }
      text = body.csvData;
    } else {
      return NextResponse.json({ error: 'Invalid content type. Use multipart/form-data for file upload or application/json for direct CSV data' }, { status: 400 });
    }

    // Read and parse CSV content
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 });
    }

    // Parse CSV headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const requiredHeaders = [
      'Type', 'Title', 'Brand', 'Description', 
      'Product Detail', 'Image Link', 'Warranty Details', 
      'Stock Status', 'Status'
    ];

    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json({ 
        error: `Missing required columns: ${missingHeaders.join(', ')}` 
      }, { status: 400 });
    }

    // Helper for handle slugification
    const slugify = (val: string) => {
      return val
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60);
    };

    // Parse data rows
    const productGroups: { [key: string]: { main: any | null; variants: any[] } } = {};

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length !== headers.length) continue;

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || '';
      });

      // Skip empty rows
      if (!row['Title']) continue;

      // Auto-generate handle if missing
      const handleVal = (row['Handle ID'] || slugify(row['Title'])).trim().toLowerCase();
      if (!handleVal) continue;

      const priceVal = parseFloat(row['Sale Price'] || row['Price'] || '0');
      const mrpVal = parseFloat(row['MRP'] || '0');
      const categoryVal = row['Category'] || '';

      const product = {
        handle: handleVal,
        type: (row['Type'] || 'product').toLowerCase(),
        title: row['Title'],
        brand: row['Brand'] || '',
        description: row['Description'] || '',
        short_description: row['Product Detail'] || '',
        image: row['Image Link'] || '',
        images: row['Image Link'] ? [row['Image Link']] : [],
        warranty: row['Warranty Details'] || '',
        stock_status: (row['Stock Status'] || '').toLowerCase() === 'in stock' ? 'in_stock' : 'out_of_stock',
        status: (row['Status'] || '').toLowerCase() === 'active' ? 'active' : 'draft',
        price: isNaN(priceVal) ? 0 : priceVal,
        mrp: isNaN(mrpVal) ? 0 : mrpVal,
        category: categoryVal
      };

      // Group by handle
      if (!productGroups[product.handle]) {
        productGroups[product.handle] = { main: null, variants: [] };
      }

      if (product.type === 'product') {
        productGroups[product.handle].main = product;
      } else if (product.type === 'variant') {
        productGroups[product.handle].variants.push(product);
      }
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each product group
    for (const [handleId, group] of Object.entries(productGroups)) {
      try {
        if (!group.main) {
          errors.push(`Skipping ${handleId}: No main product found`);
          continue;
        }

        const mainProduct = group.main;

        // Insert or update main product
        const { error: insertError } = await supabase
          .from('products')
          .upsert({
            handle: handleId,
            title: mainProduct.title,
            name: mainProduct.title, // satisfy NOT NULL name constraint
            description: mainProduct.description,
            brand: mainProduct.brand,
            short_description: mainProduct.short_description,
            image: mainProduct.image,
            images: mainProduct.images,
            warranty: mainProduct.warranty,
            stock_status: mainProduct.stock_status,
            status: mainProduct.status,
            price: mainProduct.price,
            mrp: mainProduct.mrp,
            category: mainProduct.category
          }, {
            onConflict: 'handle'
          });

        if (insertError) {
          errors.push(`Error inserting ${handleId}: ${insertError.message}`);
          errorCount++;
          continue;
        }

        // Process variants
        for (const variant of group.variants) {
          const variantIndex = group.variants.indexOf(variant) + 1;
          const { error: variantError } = await supabase
            .from('products')
            .upsert({
              handle: `${handleId}-variant-${variantIndex}`,
              title: variant.title,
              name: variant.title, // satisfy NOT NULL name constraint
              description: variant.description,
              brand: variant.brand,
              short_description: variant.short_description,
              image: variant.image,
              images: variant.images,
              warranty: variant.warranty,
              stock_status: variant.stock_status,
              status: variant.status,
              price: variant.price,
              mrp: variant.mrp,
              category: variant.category
            }, {
              onConflict: 'handle'
            });

          if (variantError) {
            errors.push(`Error inserting variant for ${handleId}: ${variantError.message}`);
          }
        }


        successCount++;
      } catch (error) {
        errors.push(`Error processing ${handleId}: ${(error as Error).message}`);
        errorCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import completed: ${successCount} products imported, ${errorCount} errors`,
      details: {
        successCount,
        errorCount,
        totalGroups: Object.keys(productGroups).length,
        errors: errors.slice(0, 10)
      }
    });

  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    logger.error('CSV import error:', { error });
    return NextResponse.json({
      error: 'Import failed'
    }, { status: 500 });
  }
}

// Helper function to parse CSV line with proper quote handling
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}
