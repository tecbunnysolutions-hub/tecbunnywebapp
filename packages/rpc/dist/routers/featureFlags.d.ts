import { FeatureFlagDictionary } from '@tecbunny/config';
export declare const featureFlagsRouter: import("@trpc/server").TRPCBuiltRouter<{
    ctx: {
        req: Request;
        resHeaders: Headers;
        session: {
            user: import("@supabase/auth-js").User;
        } | {
            user: {
                id: string;
                email: string;
            };
        } | null;
        role: any;
    };
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: true;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    getAll: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: FeatureFlagDictionary;
        meta: object;
    }>;
    toggle: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            key: string;
            enabled: boolean;
        };
        output: any;
        meta: object;
    }>;
}>>;
//# sourceMappingURL=featureFlags.d.ts.map