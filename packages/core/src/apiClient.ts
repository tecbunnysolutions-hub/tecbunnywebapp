// src/lib/apiClient.ts
import { mapHumanError } from "./errorMapper";

export interface ResilientFetchOptions extends RequestInit {
  retries?: number;
  dedupeKey?: string; // Used to abort previous overlapping requests
}

// Global registry of active requests for deduplication
const activeRequests = new Map<string, AbortController>();

/**
 * Resilient Network Client
 * A highly optimized fetch wrapper featuring exponential backoff,
 * stale request dropping via AbortController, and humanized error mapping.
 */
export async function resilientFetch(url: string, options: ResilientFetchOptions = {}): Promise<Response> {
  const { retries = 3, dedupeKey, ...fetchOptions } = options;

  // Drop stale/overlapping requests to prevent race conditions
  if (dedupeKey) {
    if (activeRequests.has(dedupeKey)) {
      activeRequests.get(dedupeKey)?.abort();
    }
    const controller = new AbortController();
    activeRequests.set(dedupeKey, controller);
    fetchOptions.signal = controller.signal;
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        // Only retry on 5xx server errors or 429 rate limits
        if (response.status >= 500 || response.status === 429) {
          throw new Error(`Retryable Error: ${response.status}`);
        }
        // Throw a mapped human error for client errors (4xx)
        throw new Error(mapHumanError(response.status));
      }

      // Cleanup successful request from deduplication map
      if (dedupeKey) activeRequests.delete(dedupeKey);
      return response;

    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Don't retry aborted requests
        throw error;
      }
      
      if (attempt === retries) {
        if (dedupeKey) activeRequests.delete(dedupeKey);
        // Fallback to a general error if no specific message exists
        throw new Error(error.message || mapHumanError(500));
      }

      // Exponential backoff scaling: 250ms -> 500ms -> 1000ms
      const delay = 250 * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error("Unreachable");
}
