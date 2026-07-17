import { z } from 'zod';
import { AppError, Result, success, failure } from '../errors';

export * from './checkout';
export * from './user';

/**
 * Validates a payload against a Zod schema.
 * Returns a Result object with the parsed data on success,
 * or an AppError.badRequest with formatted details on failure.
 */
export function validatePayload<T>(schema: z.ZodType<T>, data: unknown): Result<T, AppError> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const formattedErrors = parsed.error.format();
    return failure(AppError.badRequest('Validation failed', JSON.stringify(formattedErrors)));
  }
  return success(parsed.data);
}
