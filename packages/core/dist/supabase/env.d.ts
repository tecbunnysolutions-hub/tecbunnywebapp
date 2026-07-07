type PublicSupabaseEnv = {
    url: string;
    publicKey: string;
    keySource: 'publishable' | 'anon';
    runtimeEnv: 'production' | 'development';
};
type ServiceSupabaseEnv = {
    url: string;
    serviceKey: string;
};
export declare function getSupabaseRuntimeEnv(): 'production' | 'development';
export declare function resolveSupabasePublicEnv(): PublicSupabaseEnv;
export declare const isSupabasePublicConfigured: boolean;
export declare function requireSupabasePublicEnv(): PublicSupabaseEnv;
export declare function resolveSupabaseServiceEnv(): ServiceSupabaseEnv;
export declare const isSupabaseServiceConfigured: boolean;
export declare function requireSupabaseServiceEnv(): ServiceSupabaseEnv;
export {};
//# sourceMappingURL=env.d.ts.map