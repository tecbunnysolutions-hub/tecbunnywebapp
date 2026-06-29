import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const brandMapping = {
  'zebronic': 'Zebronics',
  'zebronics': 'Zebronics',
  'coconut': 'Coconut',
  'cp plus': 'CP Plus',
  'cp-plus': 'CP Plus',
  'sandisk': 'SanDisk',
  'tp-link': 'TP-Link',
  'quick heal': 'Quick Heal'
};

async function restructureBrands() {
  try {
    console.log('Fetching products...');
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, brand');

    if (error) throw error;

    console.log(`Found ${products.length} products. Updating brands...`);
    
    let updatedCount = 0;
    for (const product of products) {
      if (!product.brand) continue;
      
      const normalizedBrand = product.brand.toLowerCase().trim();
      let targetBrand = null;
      
      // Match exact mapped brands
      if (brandMapping[normalizedBrand]) {
        targetBrand = brandMapping[normalizedBrand];
      }
      
      if (targetBrand && product.brand !== targetBrand) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ brand: targetBrand })
          .eq('id', product.id);

        if (updateError) {
          console.error(`Failed to update brand for "${product.name}":`, updateError.message);
        } else {
          updatedCount++;
          console.log(`Updated [${product.name.slice(0, 30)}...] Brand: [${product.brand}] -> [${targetBrand}]`);
        }
      }
    }

    console.log(`\nBrand Restructure Complete. Total products updated: ${updatedCount}/${products.length}`);
  } catch (err) {
    console.error('Error running brand restructure:', err);
  }
}

restructureBrands();
