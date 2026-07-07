import { FeatureFlagDictionary } from '@tecbunny/config';
export declare const featureFlagsRouter: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
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
    errorShape: import("@trpc/server").DefaultErrorShape;
    transformer: typeof import("superjson").default;
}>, {
    getAll: import("@trpc/server").BuildProcedure<"query", {
        _config: import("@trpc/server").RootConfig<{
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
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: typeof import("superjson").default;
        }>;
        _ctx_out: {
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
        _input_in: typeof import("@trpc/server").unsetMarker;
        _input_out: typeof import("@trpc/server").unsetMarker;
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
        _meta: object;
    }, FeatureFlagDictionary>;
    toggle: import("@trpc/server").BuildProcedure<"mutation", {
        _config: import("@trpc/server").RootConfig<{
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
            errorShape: import("@trpc/server").DefaultErrorShape;
            transformer: typeof import("superjson").default;
        }>;
        _meta: object;
        _ctx_out: {
            session: {
                user: import("@supabase/auth-js").User | {
                    id: string;
                    email: string;
                };
            } | {
                user: import("@supabase/auth-js").User | {
                    id: string;
                    email: string;
                };
            };
            role: any;
            req: Request;
            resHeaders: Headers;
        };
        _input_in: {
            key: string;
            enabled: boolean;
        };
        _input_out: {
            key: string;
            enabled: boolean;
        };
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, any>;
}>;
//# sourceMappingURL=featureFlags.d.ts.map