export * from './http';

export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError('BAD_REQUEST', message, 400, details);
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new AppError('UNAUTHORIZED', message, 401);
  }

  static forbidden(message: string = 'Forbidden') {
    return new AppError('FORBIDDEN', message, 403);
  }

  static notFound(message: string = 'Not found') {
    return new AppError('NOT_FOUND', message, 404);
  }

  static internal(message: string = 'Internal server error', details?: unknown) {
    return new AppError('INTERNAL_ERROR', message, 500, details);
  }
}

export type Result<T, E = AppError> =
  | { success: true; data: T; error?: never }
  | { success: false; error: E; data?: never };

export const success = <T>(data: T): Result<T, any> => ({ success: true, data });
export const failure = <E>(error: E): Result<any, E> => ({ success: false, error });
