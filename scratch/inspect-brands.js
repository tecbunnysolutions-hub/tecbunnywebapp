import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectBrands() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, brand');

    if (error) throw error;

    const brandCounts = {};
    products.forEach(p => {
      brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    });

    console.log('Current Brand Counts:');
    console.log(brandCounts);
  } catch (err) {
    console.error(err);
  }
}

inspectBrands();
