import { AppError, success, failure } from '../errors';
export * from './checkout';
export * from './user';
/**
 * Validates a payload against a Zod schema.
 * Returns a Result object with the parsed data on success,
 * or an AppError.badRequest with formatted details on failure.
 */
export function validatePayload(schema, data) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
        const formattedErrors = parsed.error.format();
        return failure(AppError.badRequest('Validation failed', formattedErrors));
    }
    return success(parsed.data);
}
