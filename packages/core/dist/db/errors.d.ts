export declare class DatabaseError extends Error {
    code: string;
    details: string | null;
    hint: string | null;
    constructor(message: string, code?: string, details?: string | null, hint?: string | null);
    /**
     * Check if the error is related to missing columns/tables (commonly seen during schema migrations or cache issues)
     */
    isSchemaError(): boolean;
    /**
     * Check if it is a fetch/connection failure
     */
    isFetchFailure(): boolean;
}
//# sourceMappingURL=errors.d.ts.map