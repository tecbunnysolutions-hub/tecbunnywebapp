export interface ResilientFetchOptions extends RequestInit {
    retries?: number;
    dedupeKey?: string;
}
/**
 * Resilient Network Client
 * A highly optimized fetch wrapper featuring exponential backoff,
 * stale request dropping via AbortController, and humanized error mapping.
 */
export declare function resilientFetch(url: string, options?: ResilientFetchOptions): Promise<Response>;
//# sourceMappingURL=apiClient.d.ts.map