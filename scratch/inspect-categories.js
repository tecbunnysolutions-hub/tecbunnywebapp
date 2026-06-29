import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectCategories() {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, category, subcategory');

    if (error) throw error;

    console.log(`Total Products: ${products.length}`);
    const categoriesMap = {};
    
    products.forEach(p => {
      const cat = `${p.category || 'N/A'} -> ${p.subcategory || 'N/A'}`;
      categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
    });

    console.log('\nDistinct Category structures (Category -> Subcategory):');
    console.log(JSON.stringify(categoriesMap, null, 2));

    console.log('\nSample Products:');
    products.slice(0, 10).forEach(p => {
      console.log(`- ${p.name.slice(0, 40)}... | Cat: ${p.category} | Sub: ${p.subcategory}`);
    });
  } catch (error) {
    console.error('Inspection failed:', error);
  }
}

inspectCategories();
