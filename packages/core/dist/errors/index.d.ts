export * from './http';
export declare class AppError extends Error {
    readonly code: string;
    readonly message: string;
    readonly statusCode: number;
    readonly details?: unknown | undefined;
    constructor(code: string, message: string, statusCode?: number, details?: unknown | undefined);
    static badRequest(message: string, details?: unknown): AppError;
    static unauthorized(message?: string): AppError;
    static forbidden(message?: string): AppError;
    static notFound(message?: string): AppError;
    static internal(message?: string, details?: unknown): AppError;
}
export type Result<T, E = AppError> = {
    success: true;
    data: T;
    error?: never;
} | {
    success: false;
    error: E;
    data?: never;
};
export declare const success: <T>(data: T) => Result<T, any>;
export declare const failure: <E>(error: E) => Result<any, E>;
//# sourceMappingURL=index.d.ts.map