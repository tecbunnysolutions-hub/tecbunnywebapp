import { NextResponse } from 'next/server';
export interface APIResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, unknown>;
    };
    meta?: {
        timestamp: string;
        requestId?: string;
        version?: string;
        pagination?: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}
export interface PaginationOptions {
    page?: number;
    limit?: number;
    total?: number;
}
export declare class APIResponseBuilder {
    private static generateRequestId;
    static success<T>(data: T, statusCode?: number, meta?: Partial<APIResponse['meta']>): NextResponse;
    static error(code: string, message: string, statusCode?: number, details?: Record<string, unknown>, requestId?: string): NextResponse;
    static paginated<T>(data: T[], pagination: PaginationOptions, statusCode?: number): NextResponse;
    static created<T>(data: T): NextResponse;
    static noContent(): NextResponse;
    static badRequest(message: string, details?: Record<string, unknown>): NextResponse;
    static unauthorized(message?: string): NextResponse;
    static forbidden(message?: string): NextResponse;
    static notFound(message?: string): NextResponse;
    static conflict(message: string, details?: Record<string, unknown>): NextResponse;
    static unprocessableEntity(message: string, details?: Record<string, unknown>): NextResponse;
    static tooManyRequests(message?: string, retryAfter?: number): NextResponse;
    static internalServerError(message?: string, details?: Record<string, unknown>): NextResponse;
    static serviceUnavailable(message?: string): NextResponse;
}
interface AuthUser {
    id: string;
    email: string;
    name?: string;
    role?: string;
}
export declare const APIResponses: {
    loginSuccess: (user: AuthUser, token: string) => NextResponse<unknown>;
    loginFailed: () => NextResponse<unknown>;
    tokenExpired: () => NextResponse<unknown>;
    accountNotVerified: () => NextResponse<unknown>;
    otpSent: (channel: string, maskedContact: string) => NextResponse<unknown>;
    otpVerified: () => NextResponse<unknown>;
    otpInvalid: () => NextResponse<unknown>;
    otpExpired: () => NextResponse<unknown>;
    preferencesUpdated: () => NextResponse<unknown>;
    preferencesRetrieved: (preferences: Record<string, unknown>) => NextResponse<unknown>;
    validationError: (field: string, message: string) => NextResponse<unknown>;
    missingField: (field: string) => NextResponse<unknown>;
    operationSuccess: (message: string, data?: Record<string, unknown>) => NextResponse<unknown>;
    operationFailed: (message: string, details?: Record<string, unknown>) => NextResponse<unknown>;
    whatsappSent: (messageId: string) => NextResponse<unknown>;
    whatsappFailed: (error: string) => NextResponse<unknown>;
    healthCheck: (status: Record<string, unknown>) => NextResponse<unknown>;
    serviceDown: (service: string) => NextResponse<unknown>;
};
export declare function isAPIResponse(obj: unknown): obj is APIResponse;
export declare function isSuccessResponse<T>(response: APIResponse): response is APIResponse<T> & {
    success: true;
};
export declare function isErrorResponse(response: APIResponse): response is APIResponse & {
    success: false;
};
export {};
//# sourceMappingURL=api-response.d.ts.map