export interface NormalizedOffer {
    id: string;
    title: string;
    description: string;
    discount_type: string;
    discount_value: number | null;
    minimum_purchase_amount: number | null;
    maximum_discount_amount: number | null;
    offer_code: string | null;
    start_date: string;
    end_date: string;
    is_active: boolean;
    is_featured: boolean;
    display_on_homepage: boolean;
    customer_eligibility: string;
    banner_text: string | null;
    banner_color: string | null;
    terms_and_conditions: string | null;
    priority: number;
    usage_limit: number | null;
    usage_count: number;
    usage_limit_per_customer: number | null;
    created_at: string | null;
    updated_at: string | null;
}
export declare const offersRouter: import("@trpc/server").TRPCBuiltRouter<{
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
            offers: NormalizedOffer[];
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
//# sourceMappingURL=offers.d.ts.map