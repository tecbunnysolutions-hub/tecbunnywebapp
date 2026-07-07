export declare const isS3Configured: boolean;
export interface S3UploadResult {
    url: string;
    public_id: string;
    secure_url: string;
    width?: number;
    height?: number;
    format?: string;
    bytes?: number;
}
/**
 * Upload file to S3
 */
export declare function uploadToS3(file: File | Buffer | string, folder?: string, options?: {
    publicAccess?: boolean;
    fileName?: string;
}): Promise<S3UploadResult>;
/**
 * Upload hero banner image to S3
 */
export declare function uploadHeroBanner(file: File | Buffer, folder?: string): Promise<S3UploadResult>;
/**
 * Upload product image to S3
 */
export declare function uploadProductImage(file: File | Buffer): Promise<S3UploadResult>;
/**
 * Delete file from S3
 */
export declare function deleteFromS3(key: string): Promise<boolean>;
/**
 * Get signed URL for private S3 files
 */
export declare function getS3SignedUrl(key: string, expiresIn?: number): Promise<string>;
//# sourceMappingURL=s3-storage.d.ts.map