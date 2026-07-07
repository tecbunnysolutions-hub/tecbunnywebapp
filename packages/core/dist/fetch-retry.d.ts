/**
 * fetch-retry.ts
 * A robust fetch wrapper that automatically retries failed requests with exponential backoff.
 * Essential for bulletproof, error-free architecture in unreliable network conditions.
 */
interface FetchRetryOptions extends RequestInit {
    retries?: number;
    backoffDelay?: number;
}
export declare function fetchWithRetry(url: string | URL | Request, options?: FetchRetryOptions): Promise<Response>;
export {};
//# sourceMappingURL=fetch-retry.d.ts.map