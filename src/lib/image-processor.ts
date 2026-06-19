import sharp from 'sharp';
import { logger } from './logger';
import { SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
}

/**
 * Optimizes an image buffer using Sharp, converting it to WebP format
 * and constraining dimensions for web optimization.
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  options: { maxWidth?: number; maxHeight?: number } = { maxWidth: 1920, maxHeight: 1920 }
): Promise<ProcessedImage> {
  try {
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();

    const processedImage = await image
      .resize({
        width: options.maxWidth,
        height: options.maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: processedImage.data,
      width: processedImage.info.width,
      height: processedImage.info.height,
      format: 'webp',
    };
  } catch (error) {
    logger.error('Failed to process image with sharp', { error });
    throw new Error('Image processing failed');
  }
}

/**
 * Returns a Sharp transform stream that can be piped into from a Readable stream
 * and piped out to a Writable stream (e.g., Supabase upload).
 */
export function createOptimizeImageStream(
  options: { maxWidth?: number; maxHeight?: number } = { maxWidth: 1920, maxHeight: 1920 }
): sharp.Sharp {
  return sharp()
    .resize({
      width: options.maxWidth,
      height: options.maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 80 });
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Downloads an external image, optimizes it, and uploads it to Supabase storage.
 * Returns the new Supabase public URL.
 */
export async function processAndUploadExternalImage(
  url: string,
  supabase: SupabaseClient
): Promise<string> {
  // If it's not a valid URL or already a Supabase storage URL, skip
  if (!url || !url.startsWith('http') || url.includes('.supabase.co/storage/')) {
    return url;
  }

  try {
    logger.info('fetching_external_image', { url });
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const contentLengthStr = response.headers.get('content-length');
    if (contentLengthStr && parseInt(contentLengthStr, 10) > MAX_FILE_SIZE) {
      throw new Error('Image exceeds maximum file size of 10MB');
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length > MAX_FILE_SIZE) {
      throw new Error('Image exceeds maximum file size of 10MB');
    }

    // Optimize the image to webp
    const optimizedImage = await optimizeImage(buffer);
    
    // Generate unique filename
    const filename = `products/${crypto.randomUUID()}-${Date.now()}.webp`;

    logger.info('uploading_external_image_to_supabase', { filename, size: optimizedImage.buffer.length });

    const { error } = await supabase.storage
      .from('images')
      .upload(filename, optimizedImage.buffer, {
        contentType: 'image/webp',
        upsert: false,
        cacheControl: '31536000'
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filename);

    return publicUrl;
  } catch (err) {
    logger.error('process_external_image_failed', {
      url,
      error: err instanceof Error ? err.message : String(err)
    });
    // On failure, return the original URL so we don't completely break the product
    return url;
  }
}
