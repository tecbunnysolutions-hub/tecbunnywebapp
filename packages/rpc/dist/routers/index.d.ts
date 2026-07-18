export declare const appRouter: import("@trpc/server").TRPCBuiltRouter<{
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
    pageContent: import("@trpc/server").TRPCBuiltRouter<{
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
    featureFlags: import("@trpc/server").TRPCBuiltRouter<{
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
            output: import("@tecbunny/config").FeatureFlagDictionary;
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
    contactMessages: import("@trpc/server").TRPCBuiltRouter<{
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
    projects: import("@trpc/server").TRPCBuiltRouter<{
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
            output: any[];
            meta: object;
        }>;
        create: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                name: string;
                explanation: string;
                target_amount: number;
                motive: string;
                detailed_information: string;
                amount_raised?: number | undefined;
                status?: string | undefined;
            };
            output: any;
            meta: object;
        }>;
        delete: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string | number;
            };
            output: {
                success: boolean;
            };
            meta: object;
        }>;
    }>>;
    coupons: import("@trpc/server").TRPCBuiltRouter<{
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
            output: any[];
            meta: object;
        }>;
        getByCode: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                code: string;
            };
            output: any;
            meta: object;
        }>;
        getById: import("@trpc/server").TRPCQueryProcedure<{
            input: {
                id: string;
            };
            output: any;
            meta: object;
        }>;
        create: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                code: string;
                type: string;
                value: number;
                title?: string | undefined;
                description?: string | undefined;
                min_purchase?: number | null | undefined;
                usage_limit?: number | null | undefined;
                usage_count?: number | null | undefined;
                per_user_limit?: number | null | undefined;
                applicable_category?: string | null | undefined;
                applicable_product_id?: string | null | undefined;
                start_date?: string | undefined;
                expiry_date?: string | null | undefined;
                status?: string | undefined;
            };
            output: {
                coupon: any;
                message: string;
            };
            meta: object;
        }>;
        update: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
                code?: string | undefined;
                title?: string | undefined;
                description?: string | undefined;
                type?: string | undefined;
                value?: number | undefined;
                min_purchase?: number | null | undefined;
                usage_limit?: number | null | undefined;
                usage_count?: number | null | undefined;
                per_user_limit?: number | null | undefined;
                applicable_category?: string | null | undefined;
                applicable_product_id?: string | null | undefined;
                status?: string | undefined;
                start_date?: string | undefined;
                expiry_date?: string | null | undefined;
            };
            output: {
                coupon: any;
                message: string;
            };
            meta: object;
        }>;
        delete: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
            };
            output: {
                message: string;
            };
            meta: object;
        }>;
    }>>;
    offers: import("@trpc/server").TRPCBuiltRouter<{
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
            input: {
                activeOnly?: boolean | undefined;
                featuredOnly?: boolean | undefined;
                homepageOnly?: boolean | undefined;
                includeExpired?: boolean | undefined;
            } | undefined;
            output: {
                offers: import("./offers").NormalizedOffer[];
                count: number;
            };
            meta: object;
        }>;
        create: import("@trpc/server").TRPCMutationProcedure<{
            input: any;
            output: {
                offer: any;
                message: string;
            };
            meta: object;
        }>;
        update: import("@trpc/server").TRPCMutationProcedure<{
            input: any;
            output: {
                offer: any;
                message: string;
            };
            meta: object;
        }>;
        delete: import("@trpc/server").TRPCMutationProcedure<{
            input: {
                id: string;
            };
            output: {
                message: string;
            };
            meta: object;
        }>;
    }>>;
}>>;
export type AppRouter = typeof appRouter;
//# sourceMappingURL=index.d.ts.map