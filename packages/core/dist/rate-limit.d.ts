export type Result = {
    allowed: boolean;
    remaining?: number;
    reset?: number;
};
export interface RateLimitOptions {
    limit: number;
    windowMs: number;
}
export declare function rateLimit(key: string, bucketName: string, opts: RateLimitOptions): boolean;
export declare function rateLimit(key: string, limit: number, windowMs: number): Promise<Result>;
export declare function remaining(key: string, bucketName: string, opts: RateLimitOptions): number | undefined;
export declare function bucketResetMs(key: string, bucketName: string): number | undefined;
//# sourceMappingURL=rate-limit.d.ts.map