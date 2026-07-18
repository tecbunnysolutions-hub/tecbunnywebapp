export declare const projectsRouter: import("@trpc/server").TRPCBuiltRouter<{
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
//# sourceMappingURL=projects.d.ts.map