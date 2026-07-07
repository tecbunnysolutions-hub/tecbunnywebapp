import { z } from 'zod';
import { AppError, Result } from '../errors';
export * from './checkout';
export * from './user';
/**
 * Validates a payload against a Zod schema.
 * Returns a Result object with the parsed data on success,
 * or an AppError.badRequest with formatted details on failure.
 */
export declare function validatePayload<T>(schema: z.ZodType<T>, data: unknown): Result<T, AppError>;
//# sourceMappingURL=index.d.ts.map