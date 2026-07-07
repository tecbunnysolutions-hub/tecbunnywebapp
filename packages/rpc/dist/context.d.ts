import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
export declare function createContext({ req, resHeaders }: FetchCreateContextFnOptions): Promise<{
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
}>;
export type Context = Awaited<ReturnType<typeof createContext>>;
//# sourceMappingURL=context.d.ts.map