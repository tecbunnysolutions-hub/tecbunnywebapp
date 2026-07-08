interface NormalizedOffer {
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
export declare const offersRouter: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
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
            activeOnly?: boolean | undefined;
            featuredOnly?: boolean | undefined;
            homepageOnly?: boolean | undefined;
            includeExpired?: boolean | undefined;
        } | undefined;
        _input_out: {
            activeOnly: boolean;
            featuredOnly: boolean;
            homepageOnly: boolean;
            includeExpired: boolean;
        } | undefined;
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, {
        offers: NormalizedOffer[];
        count: number;
    }>;
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
        _input_in: any;
        _input_out: any;
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, {
        offer: any;
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
        _input_in: any;
        _input_out: any;
        _output_in: typeof import("@trpc/server").unsetMarker;
        _output_out: typeof import("@trpc/server").unsetMarker;
    }, {
        offer: any;
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
export {};
//# sourceMappingURL=offers.d.ts.map