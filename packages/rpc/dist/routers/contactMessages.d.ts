export declare const contactMessagesRouter: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
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
    submit: import("@trpc/server").BuildProcedure<"mutation", {
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
        _input_in: {
            name: string;
            email: string;
            message: string;
            phone?: string | undefined;
            subject?: string | undefined;
            company_name?: string | undefined;
            origin_path?: string | undefined;
            form_identifier?: string | undefined;
            utm_source?: string | undefined;
            utm_medium?: string | undefined;
            utm_campaign?: string | undefined;
        };
        _input_out: {
            name: string;
            email: string;
            message: string;
            phone?: string | undefined;
            subject?: string | undefined;
            company_name?: string | undefined;
            origin_path?: string | undefined;
            form_identifier?: string | undefined;
            utm_source?: string | undefined;
            utm_medium?: string | undefined;
            utm_campaign?: string | undefined;
        };
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, {
        success: boolean;
        id: any;
    }>;
}>;
//# sourceMappingURL=contactMessages.d.ts.map