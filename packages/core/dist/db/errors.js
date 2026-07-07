export class DatabaseError extends Error {
    code;
    details;
    hint;
    constructor(message, code = 'UNKNOWN', details = null, hint = null) {
        super(message);
        this.name = 'DatabaseError';
        this.code = code;
        this.details = details;
        this.hint = hint;
        // Capture stack trace if available (V8 engines)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DatabaseError);
        }
    }
    /**
     * Check if the error is related to missing columns/tables (commonly seen during schema migrations or cache issues)
     */
    isSchemaError() {
        const combined = `${this.message} ${this.hint || ''} ${this.details || ''}`.toLowerCase();
        return (this.code === '42703' ||
            /^pgrst\d+$/i.test(this.code) && (combined.includes('schema cache') ||
                combined.includes('could not find') ||
                combined.includes('does not exist') ||
                combined.includes('unknown column')) ||
            /column .* does not exist/i.test(combined));
    }
    /**
     * Check if it is a fetch/connection failure
     */
    isFetchFailure() {
        const message = String(this.message || '').toLowerCase();
        return message.includes('fetch failed');
    }
}
