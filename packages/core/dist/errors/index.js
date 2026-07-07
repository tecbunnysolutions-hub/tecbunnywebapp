export * from './http';
export class AppError extends Error {
    code;
    message;
    statusCode;
    details;
    constructor(code, message, statusCode = 400, details) {
        super(message);
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'AppError';
    }
    static badRequest(message, details) {
        return new AppError('BAD_REQUEST', message, 400, details);
    }
    static unauthorized(message = 'Unauthorized') {
        return new AppError('UNAUTHORIZED', message, 401);
    }
    static forbidden(message = 'Forbidden') {
        return new AppError('FORBIDDEN', message, 403);
    }
    static notFound(message = 'Not found') {
        return new AppError('NOT_FOUND', message, 404);
    }
    static internal(message = 'Internal server error', details) {
        return new AppError('INTERNAL_ERROR', message, 500, details);
    }
}
export const success = (data) => ({ success: true, data });
export const failure = (error) => ({ success: false, error });
