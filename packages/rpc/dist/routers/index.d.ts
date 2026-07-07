export declare const appRouter: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
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
    pageContent: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
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
        get: import("@trpc/server").BuildProcedure<"query", {
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
                key?: string | undefined;
            } | undefined;
            _input_out: {
                key?: string | undefined;
            } | undefined;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, {
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
                pageKey: string;
                title?: string | undefined;
                content?: any;
                metaDescription?: string | undefined;
                metaKeywords?: string | undefined;
            };
            _input_out: {
                pageKey: string;
                title?: string | undefined;
                content?: any;
                metaDescription?: string | undefined;
                metaKeywords?: string | undefined;
            };
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, {
            id: string;
            page_key: string;
            title: string;
            content: any;
            meta_description: string | undefined;
            meta_keywords: string | undefined;
            status: string;
            created_at: string;
            updated_at: string;
        }>;
        list_all: import("@trpc/server").BuildProcedure<"query", {
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
            _input_in: typeof import("@trpc/server").unsetMarker;
            _input_out: typeof import("@trpc/server").unsetMarker;
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, never[]>;
    }>;
    featureFlags: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
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
        }, import("@tecbunny/config").FeatureFlagDictionary>;
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
}>;
export type AppRouter = typeof appRouter;
//# sourceMappingURL=index.d.ts.map