import sharp from 'sharp';
import { SupabaseClient } from '@supabase/supabase-js';
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
export declare function optimizeImage(inputBuffer: Buffer, options?: {
    maxWidth?: number;
    maxHeight?: number;
}): Promise<ProcessedImage>;
/**
 * Returns a Sharp transform stream that can be piped into from a Readable stream
 * and piped out to a Writable stream (e.g., Supabase upload).
 */
export declare function createOptimizeImageStream(options?: {
    maxWidth?: number;
    maxHeight?: number;
}): sharp.Sharp;
/**
 * Downloads an external image, optimizes it, and uploads it to Supabase storage.
 * Returns the new Supabase public URL.
 */
export declare function processAndUploadExternalImage(url: string, supabase: SupabaseClient): Promise<string>;
//# sourceMappingURL=image-processor.d.ts.map