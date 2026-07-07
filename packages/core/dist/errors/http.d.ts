import { NextResponse } from 'next/server';
export interface ApiErrorDef {
    code: string;
    status: number;
    message: string;
}
export declare const ERROR_DEFS: Record<string, Omit<ApiErrorDef, 'code'>>;
interface ErrorOptions {
    details?: Record<string, unknown>;
    overrideMessage?: string;
    correlationId?: string | null;
}
export declare function apiError(code: keyof typeof ERROR_DEFS, opts?: ErrorOptions): NextResponse<Record<string, unknown>>;
export declare function apiSuccess<T extends object>(data: T, correlationId?: string | null): NextResponse<Record<string, unknown>>;
export {};
//# sourceMappingURL=http.d.ts.map