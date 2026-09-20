import { logger } from './logger';
import { validatePublicRemoteUrl } from './security/network-validation';

// Minimal storage interface — avoids importing @supabase/supabase-js as a hard dep
interface SupabaseLike {
  storage: {
    from(bucket: string): {
      upload(path: string, data: Uint8Array, options: Record<string, unknown>): Promise<{ error: { message: string } | null }>;
      getPublicUrl(path: string): { data: { publicUrl: string } };
    };
  };
}

export interface ProcessedImage {
  buffer: Uint8Array;
  width: number;
  height: number;
  format: string;
}

/**
 * Optimizes an image buffer using Sharp, converting it to WebP format
 * and constraining dimensions for web optimization.
 */
export async function optimizeImage(
  inputBuffer: Uint8Array,
  options: { maxWidth?: number; maxHeight?: number } = { maxWidth: 1920, maxHeight: 1920 }
): Promise<ProcessedImage> {
  try {
    const sharp = (await import('sharp')).default;
    const image = sharp(inputBuffer);
    await image.metadata();

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
export async function createOptimizeImageStream(
  options: { maxWidth?: number; maxHeight?: number } = { maxWidth: 1920, maxHeight: 1920 }
): Promise<any> {
  const sharp = (await import('sharp')).default;
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
const EXTERNAL_IMAGE_FETCH_TIMEOUT_MS = 8000;

/**
 * Downloads an external image, optimizes it, and uploads it to Supabase storage.
 * Returns the new Supabase public URL.
 */
export async function processAndUploadExternalImage(
  url: string,
  supabase: SupabaseLike
): Promise<string> {
  // If it's not a valid URL or already a Supabase storage URL, skip
  if (!url || !url.startsWith('http') || url.includes('.supabase.co/storage/')) {
    return url;
  }

  // Strip Cloudflare Image Resizing transform proxy so the origin image is fetched directly.
  // Pattern: https://host/cdn-cgi/image/{options}/{original_path}
  if (url.includes('/cdn-cgi/image/')) {
    try {
      const u = new URL(url);
      const stripped = u.pathname.replace(/^\/cdn-cgi\/image\/[^/]+\//, '/');
      url = u.protocol + '//' + u.host + stripped;
    } catch {
      // leave url unchanged if parsing fails
    }
  }

  try {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      throw new Error('Invalid image URL');
    }

    const isPublicTarget = await validatePublicRemoteUrl(parsedUrl);
    if (!isPublicTarget) {
      throw new Error('Image URL target is not allowed');
    }

    logger.info('fetching_external_image', { url });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), EXTERNAL_IMAGE_FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(parsedUrl.href, {
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': parsedUrl.origin + '/',
        },
      });
    } finally {
      clearTimeout(timeout);
    }
    
    if (response.status >= 300 && response.status < 400) {
      throw new Error('Redirecting image URLs are not allowed');
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      throw new Error('Remote URL did not return an image');
    }

    const contentLengthStr = response.headers.get('content-length');
    if (contentLengthStr && parseInt(contentLengthStr, 10) > MAX_FILE_SIZE) {
      throw new Error('Image exceeds maximum file size of 10MB');
    }

    const arrayBuffer = await response.arrayBuffer();
    const imgData = new Uint8Array(arrayBuffer);

    if (imgData.byteLength > MAX_FILE_SIZE) {
      throw new Error('Image exceeds maximum file size of 10MB');
    }

    // Optimize the image to webp
    const optimizedImage = await optimizeImage(imgData);
    
    // Generate unique filename
    const filename = `products/${globalThis.crypto.randomUUID()}-${Date.now()}.webp`;

    logger.info('uploading_external_image_to_supabase', { filename, size: optimizedImage.buffer.byteLength });

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
    return '';
  }
}
