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

/**
 * Validated API Client
 * Wraps resilientFetch and validates the JSON response body against a provided Zod schema.
 */
import { z } from "zod";

export async function validatedFetch<T>(
  url: string,
  schema: z.ZodSchema<T>,
  options: ResilientFetchOptions = {}
): Promise<T> {
  const response = await resilientFetch(url, options);

  // Read response text to allow for helpful error messages on parse failure
  const responseText = await response.text();
  let json: any;
  try {
    json = JSON.parse(responseText);
  } catch (err) {
    throw new Error(`Failed to parse response as JSON. Received: ${responseText.substring(0, 100)}...`);
  }

  const parsed = schema.safeParse(json);
  
  if (!parsed.success) {
    console.error(`[API Schema Error] Validating response from ${url}`, parsed.error.flatten());
    if (process.env.NODE_ENV === "development") {
      throw new Error(`API Validation Error at ${url}: ${JSON.stringify(parsed.error.flatten())}`);
    }
    // In production, we might want to return the raw data or throw a generic error depending on strictness
    throw new Error(`API Validation Error at ${url}`);
  }

  return parsed.data;
}
