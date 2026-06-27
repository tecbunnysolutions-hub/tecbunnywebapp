import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function downloadImage(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return { buffer: Buffer.from(buffer), contentType };
  } catch (err) {
    console.error('Error downloading image:', url, err.message);
    return null;
  }
}

async function uploadToSupabase(buffer, contentType, filename) {
  const filePath = `products/migrated/${Date.now()}-${filename}`;
  
  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error('Error uploading to Supabase:', error.message);
    return null;
  }

  // The image-utils handles mapping this path if we just save the filePath
  return filePath;
}

function isExternal(url) {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http') && !url.includes('supabase');
}

async function run() {
  console.log('Fetching products...');
  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Found ${products.length} products. Scanning for external images...`);

  for (const product of products) {
    let updated = false;
    let newImage = product.image;
    let newImages = product.images ? [...product.images] : [];

    if (isExternal(product.image)) {
      console.log(`Migrating main image for product ${product.id}`);
      const downloaded = await downloadImage(product.image);
      if (downloaded) {
        const ext = downloaded.contentType.split('/')[1] || 'jpg';
        const uploadedPath = await uploadToSupabase(downloaded.buffer, downloaded.contentType, `${product.id}-main.${ext}`);
        if (uploadedPath) {
          newImage = uploadedPath;
          updated = true;
        }
      }
    }

    if (product.images && Array.isArray(product.images)) {
      for (let i = 0; i < product.images.length; i++) {
        if (isExternal(product.images[i])) {
          console.log(`Migrating gallery image ${i} for product ${product.id}`);
          const downloaded = await downloadImage(product.images[i]);
          if (downloaded) {
            const ext = downloaded.contentType.split('/')[1] || 'jpg';
            const uploadedPath = await uploadToSupabase(downloaded.buffer, downloaded.contentType, `${product.id}-gallery-${i}.${ext}`);
            if (uploadedPath) {
              newImages[i] = uploadedPath;
              updated = true;
            }
          }
        }
      }
    }

    if (updated) {
      console.log(`Updating database for product ${product.id}...`);
      const { error: updateError } = await supabase
        .from('products')
        .update({ image: newImage, images: newImages })
        .eq('id', product.id);
        
      if (updateError) {
        console.error('Failed to update product', product.id, updateError.message);
      } else {
        console.log(`Successfully migrated images for product ${product.id}`);
      }
    }
  }

  console.log('Migration complete.');
}

run();
