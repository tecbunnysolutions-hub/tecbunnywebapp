export declare const PRODUCTION_API_URL: string;
export declare const STAGING_API_URL: string;
export declare const LOCAL_API_URL: string;
export declare const DOCKER_API_URL: string;

export interface ResolveApiBaseUrlOptions {
  /** Page hostname; defaults to window.location.hostname in the browser. */
  hostname?: string;
  /** Server/build target: 'staging' | 'local' | 'docker'; defaults to the API_TARGET CI flag. */
  target?: string;
}

export declare function resolveApiBaseUrl(options?: ResolveApiBaseUrlOptions): string;
