// Supabase Storage Service - Simple approach using Supabase client
import { createClient } from '@supabase/supabase-js';

import { logger } from './logger';
import { isSupabaseServiceConfigured, requireSupabaseServiceEnv } from './supabase/env';
import { optimizeImage, createOptimizeImageStream } from './image-processor';
import { Readable } from 'stream';

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient(operation: string) {
  ensureSupabaseConfigured(operation);
  if (!supabase) {
    const { url, serviceKey } = requireSupabaseServiceEnv();
    supabase = createClient(url, serviceKey);
  }
  return supabase;
}

function ensureSupabaseConfigured(operation: string) {
  if (!isSupabaseServiceConfigured) {
    logger.warn('supabase_storage_not_configured', { operation });
    throw new Error('Supabase storage is not configured');
  }
}

export interface SupabaseUploadResult {
  url: string;
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadToSupabase(
  file: File | Buffer | string | Readable,
  folder: string = 'uploads',
  options?: {
    publicAccess?: boolean;
    fileName?: string;
  }
): Promise<SupabaseUploadResult> {
  try {
    ensureSupabaseConfigured('upload');

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    let fileName = options?.fileName || `${timestamp}-${randomId}`;
    
    // Add appropriate file extension if missing
    if (file instanceof File && !fileName.includes('.')) {
      const extension = file.name.split('.').pop();
      if (extension) {
        fileName += `.${extension}`;
      }
    }
    
    // Sanitize fileName to prevent path traversal
    fileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const folderName = folder.replace(/[^a-zA-Z0-9\-_]/g, '');
    
    let fileData: ArrayBuffer | Buffer | Readable;
    let contentType = 'application/octet-stream';

    // Handle different input types
    if (file instanceof File) {
      fileData = Buffer.from(await file.arrayBuffer());
      contentType = file.type;
    } else if (Buffer.isBuffer(file)) {
      fileData = file;
    } else if (typeof file === 'string') {
      fileData = Buffer.from(file, 'base64');
    } else if (file instanceof Readable) {
      fileData = file;
    } else {
      throw new Error('Invalid file format');
    }

    // Process image if it's an image
    let width, height, format;
    if (contentType.startsWith('image/') && !contentType.includes('svg')) {
      if (fileData instanceof Readable) {
        // Stream processing
        fileData = fileData.pipe(createOptimizeImageStream());
        contentType = 'image/webp';
        fileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
      } else {
        // Buffer processing
        const optimized = await optimizeImage(fileData as Buffer);
        fileData = optimized.buffer;
        width = optimized.width;
        height = optimized.height;
        format = optimized.format;
        contentType = 'image/webp';
        fileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
      }
    }

    const filePath = `${folderName}/${fileName}`;

    // Upload to Supabase Storage
    const client = getSupabaseClient('upload');

    const { error } = await client.storage
      .from('images')
      .upload(filePath, fileData, {
        contentType,
        upsert: true,
        cacheControl: '3600'
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = client.storage
      .from('images')
      .getPublicUrl(filePath);

    const result: SupabaseUploadResult = {
      url: publicUrlData.publicUrl,
      public_id: filePath,
      secure_url: publicUrlData.publicUrl,
      width,
      height,
      format,
      bytes: Buffer.isBuffer(fileData) ? fileData.length : undefined
    };

    return result;

  } catch (error) {
    logger.error('Supabase upload error:', { error });
    throw error;
  }
}

/**
 * Upload favicon to Supabase
 */
export async function uploadFavicon(file: File | Buffer): Promise<SupabaseUploadResult> {
  return uploadToSupabase(file, 'favicons', { publicAccess: true });
}

/**
 * Upload logo to Supabase
 */
export async function uploadLogo(file: File | Buffer): Promise<SupabaseUploadResult> {
  return uploadToSupabase(file, 'logos', { publicAccess: true });
}

/**
 * Upload product image to Supabase
 */
export async function uploadProductImage(file: File | Buffer): Promise<SupabaseUploadResult> {
  return uploadToSupabase(file, 'products', { publicAccess: true });
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFromSupabase(filePath: string): Promise<boolean> {
  try {
    ensureSupabaseConfigured('delete');

    const client = getSupabaseClient('delete');

    const { error } = await client.storage
      .from('images')
      .remove([filePath]);

    if (error) {
      logger.error('Delete error:', { error });
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Delete error:', { error });
    return false;
  }
}

/**
 * Get signed URL for private files
 */
export async function getSupabaseSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
  try {
    ensureSupabaseConfigured('signed_url');

    const client = getSupabaseClient('signed_url');

    const { data, error } = await client.storage
      .from('images')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw new Error(`Failed to get signed URL: ${error.message}`);
    }

    return data.signedUrl;
  } catch (error) {
    logger.error('Signed URL error:', { error });
    throw error;
  }
}

