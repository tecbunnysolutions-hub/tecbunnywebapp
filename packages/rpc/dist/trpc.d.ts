import { TRPCError } from '@trpc/server';
import superjson from 'superjson';
export declare const t: import("@trpc/server").TRPCRootObject<{
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
}, object, {
    transformer: typeof superjson;
    errorFormatter({ shape }: {
        error: TRPCError;
        type: import("@trpc/server").ProcedureType | "unknown";
        path: string | undefined;
        input: unknown;
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
        } | undefined;
        shape: import("@trpc/server").TRPCDefaultErrorShape;
    }): import("@trpc/server").TRPCDefaultErrorShape;
}, {
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
}>;
export declare const router: import("@trpc/server").TRPCRouterBuilder<{
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
}>;
export declare const publicProcedure: import("@trpc/server").TRPCProcedureBuilder<{
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
}, object, object, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
export declare const protectedProcedure: import("@trpc/server").TRPCProcedureBuilder<{
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
}, object, {
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
}, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, import("@trpc/server").TRPCUnsetMarker, false>;
//# sourceMappingURL=trpc.d.ts.map