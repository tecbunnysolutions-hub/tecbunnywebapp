// AWS S3 Storage Service
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getPresignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@tecbunny/core';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
export const isS3Configured = Boolean(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && S3_BUCKET_NAME);
let s3Client = null;
// Configure AWS
if (isS3Configured) {
    s3Client = new S3Client({
        region: AWS_REGION,
        credentials: {
            accessKeyId: AWS_ACCESS_KEY_ID,
            secretAccessKey: AWS_SECRET_ACCESS_KEY
        }
    });
}
function ensureS3Configured(operation) {
    if (!isS3Configured || !s3Client) {
        logger.warn('s3_storage_not_configured', { operation });
        throw new Error('S3 storage is not configured');
    }
}
/**
 * Upload file to S3
 */
export async function uploadToS3(file, folder = 'uploads', options) {
    try {
        ensureS3Configured('upload');
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
        const key = `${folder}/${fileName}`;
        let fileBuffer;
        let contentType = 'application/octet-stream';
        // Handle different input types
        if (file instanceof File) {
            fileBuffer = Buffer.from(await file.arrayBuffer());
            contentType = file.type;
        }
        else if (Buffer.isBuffer(file)) {
            fileBuffer = file;
        }
        else if (typeof file === 'string') {
            fileBuffer = Buffer.from(file, 'base64');
        }
        else {
            throw new Error('Invalid file format');
        }
        // Upload to S3
        const uploadParams = {
            Bucket: S3_BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
            ACL: options?.publicAccess !== false ? 'public-read' : undefined,
            CacheControl: 'max-age=31536000' // 1 year
        };
        await s3Client.send(new PutObjectCommand(uploadParams));
        // Generate public URL
        const url = `https://${S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
        const result = {
            url,
            public_id: key,
            secure_url: url,
            bytes: fileBuffer.length
        };
        return result;
    }
    catch (error) {
        logger.error('S3 upload error:', { error });
        throw error;
    }
}
/**
 * Upload hero banner image to S3
 */
export async function uploadHeroBanner(file, folder = 'hero-banners') {
    return uploadToS3(file, folder, { publicAccess: true });
}
/**
 * Upload product image to S3
 */
export async function uploadProductImage(file) {
    return uploadToS3(file, 'products', { publicAccess: true });
}
/**
 * Delete file from S3
 */
export async function deleteFromS3(key) {
    try {
        ensureS3Configured('delete');
        const deleteParams = {
            Bucket: S3_BUCKET_NAME,
            Key: key
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
        return true;
    }
    catch (error) {
        logger.error('S3 delete error:', { error });
        return false;
    }
}
/**
 * Get signed URL for private S3 files
 */
export async function getS3SignedUrl(key, expiresIn = 3600) {
    try {
        ensureS3Configured('signed_url');
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET_NAME,
            Key: key
        });
        return await getPresignedUrl(s3Client, command, { expiresIn });
    }
    catch (error) {
        logger.error('S3 signed URL error:', { error });
        throw error;
    }
}
