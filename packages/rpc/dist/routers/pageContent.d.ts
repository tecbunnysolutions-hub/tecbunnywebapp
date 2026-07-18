export declare const pageContentRouter: import("@trpc/server").TRPCBuiltRouter<{
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
    get: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            key?: string | undefined;
        } | undefined;
        output: {
            id: string;
            page_key: string;
            title: string;
            content: {
                title: string;
                sections: never[];
            };
            seo_metadata: {};
            is_published: boolean;
            status: string;
            created_at: string;
            updated_at: string;
        };
        meta: object;
    }>;
    update: import("@trpc/server").TRPCMutationProcedure<{
        input: {
            pageKey: string;
            title?: string | undefined;
            content?: any;
            metaDescription?: string | undefined;
            metaKeywords?: string | undefined;
        };
        output: {
            id: string;
            page_key: string;
            title: string;
            content: any;
            meta_description: string | undefined;
            meta_keywords: string | undefined;
            status: string;
            created_at: string;
            updated_at: string;
        };
        meta: object;
    }>;
    list_all: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: never[];
        meta: object;
    }>;
}>>;
//# sourceMappingURL=pageContent.d.ts.map