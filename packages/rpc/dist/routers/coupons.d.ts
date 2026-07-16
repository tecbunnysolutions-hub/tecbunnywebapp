export declare const couponsRouter: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
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
    }, any[]>;
    getByCode: import("@trpc/server").BuildProcedure<"query", {
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
            code: string;
        };
        _input_out: {
            code: string;
        };
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, any>;
    getById: import("@trpc/server").BuildProcedure<"query", {
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
            id: string;
        };
        _input_out: {
            id: string;
        };
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, any>;
    create: import("@trpc/server").BuildProcedure<"mutation", {
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
        _input_out: {
            code: string;
            type: string;
            value: number;
            status: string;
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
        };
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, {
        coupon: any;
        message: string;
    }>;
    update: import("@trpc/server").BuildProcedure<"mutation", {
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
        _input_out: {
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
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, {
        coupon: any;
        message: string;
    }>;
    delete: import("@trpc/server").BuildProcedure<"mutation", {
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
            id: string;
        };
        _input_out: {
            id: string;
        };
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, {
        message: string;
    }>;
}>;
//# sourceMappingURL=coupons.d.ts.map