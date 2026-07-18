export declare const couponsRouter: import("@trpc/server").TRPCBuiltRouter<{
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
//# sourceMappingURL=coupons.d.ts.map