import { Readable } from 'stream';
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
export declare function uploadToSupabase(file: File | Buffer | string | Readable, folder?: string, options?: {
    publicAccess?: boolean;
    fileName?: string;
}): Promise<SupabaseUploadResult>;
/**
 * Upload favicon to Supabase
 */
export declare function uploadFavicon(file: File | Buffer): Promise<SupabaseUploadResult>;
/**
 * Upload logo to Supabase
 */
export declare function uploadLogo(file: File | Buffer): Promise<SupabaseUploadResult>;
/**
 * Upload product image to Supabase
 */
export declare function uploadProductImage(file: File | Buffer): Promise<SupabaseUploadResult>;
/**
 * Delete file from Supabase Storage
 */
export declare function deleteFromSupabase(filePath: string): Promise<boolean>;
/**
 * Get signed URL for private files
 */
export declare function getSupabaseSignedUrl(filePath: string, expiresIn?: number): Promise<string>;
//# sourceMappingURL=supabase-storage.d.ts.map