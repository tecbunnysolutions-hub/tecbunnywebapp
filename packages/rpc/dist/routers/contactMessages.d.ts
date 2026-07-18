export declare const contactMessagesRouter: import("@trpc/server").TRPCBuiltRouter<{
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
    submit: import("@trpc/server").TRPCMutationProcedure<{
        input: {
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
        output: {
            success: boolean;
            id: any;
        };
        meta: object;
    }>;
}>>;
//# sourceMappingURL=contactMessages.d.ts.map