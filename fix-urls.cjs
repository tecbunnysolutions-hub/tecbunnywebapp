const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL="(.+?)"/);
const keyMatch = env.match(/SUPABASE_SERVICE_ROLE_KEY="(.+?)"/);

const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];

async function fixUrls() {
  const fetchProducts = await fetch(supabaseUrl + '/rest/v1/products?select=id,title,image,images', {
    headers: {
      'apikey': supabaseKey,
      'Authorization': 'Bearer ' + supabaseKey
    }
  });
  
  const products = await fetchProducts.json();
  let updatedCount = 0;
  
  for (const p of products) {
    let changed = false;
    let newImage = p.image;
    let newImages = p.images;
    
    if (newImage && newImage.includes('fbcsagupcxheyiusjfak.supabase.co')) {
      newImage = newImage.replace('fbcsagupcxheyiusjfak.supabase.co', 'yzrznydkqcacjiwalmlw.supabase.co');
      changed = true;
    }
    
    if (newImages && Array.isArray(newImages)) {
      newImages = newImages.map(img => {
        if (img.includes('fbcsagupcxheyiusjfak.supabase.co')) {
          changed = true;
          return img.replace('fbcsagupcxheyiusjfak.supabase.co', 'yzrznydkqcacjiwalmlw.supabase.co');
        }
        return img;
      });
    }
    
    if (changed) {
      await fetch(supabaseUrl + '/rest/v1/products?id=eq.' + p.id, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': 'Bearer ' + supabaseKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          image: newImage,
          images: newImages
        })
      });
      updatedCount++;
      console.log('Fixed URL for:', p.title);
    }
  }
  
  console.log('Total fixed:', updatedCount);
}

fixUrls();
