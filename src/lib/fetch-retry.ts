/**
 * fetch-retry.ts
 * A robust fetch wrapper that automatically retries failed requests with exponential backoff.
 * Essential for bulletproof, error-free architecture in unreliable network conditions.
 */

interface FetchRetryOptions extends RequestInit {
  retries?: number;
  backoffDelay?: number;
}

export async function fetchWithRetry(
  url: string | URL | Request, 
  options: FetchRetryOptions = {}
): Promise<Response> {
  const { retries = 3, backoffDelay = 500, ...fetchOptions } = options;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);
      
      // If response is successful or a client error (e.g., 400, 401, 404), do not retry.
      // We only retry on server errors (5xx) or network failures.
      if (!response.ok && response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      return response; // Success or non-retryable error
    } catch (error) {
      if (attempt === retries) {
        // Max retries reached, throw the last error
        throw error;
      }
      
      // Exponential backoff with jitter
      // attempt 0: ~500ms
      // attempt 1: ~1000ms
      // attempt 2: ~2000ms
      const delay = backoffDelay * Math.pow(2, attempt) + Math.random() * 100;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error("Unreachable");
}
