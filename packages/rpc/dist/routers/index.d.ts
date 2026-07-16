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
    contactMessages: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
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
    projects: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
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
                name: string;
                explanation: string;
                target_amount: number;
                motive: string;
                detailed_information: string;
                amount_raised?: number | undefined;
                status?: string | undefined;
            };
            _input_out: {
                name: string;
                explanation: string;
                target_amount: number;
                motive: string;
                detailed_information: string;
                amount_raised?: number | undefined;
                status?: string | undefined;
            };
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, any>;
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
                id: string | number;
            };
            _input_out: {
                id: string | number;
            };
            _output_in: typeof import("@trpc/server").unsetMarker;
            _output_out: typeof import("@trpc/server").unsetMarker;
        }, {
            success: boolean;
        }>;
    }>;
    coupons: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
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
    offers: import("@trpc/server").CreateRouterInner<import("@trpc/server").RootConfig<{
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
            offers: import("./offers").NormalizedOffer[];
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
}>;
export type AppRouter = typeof appRouter;
//# sourceMappingURL=index.d.ts.map