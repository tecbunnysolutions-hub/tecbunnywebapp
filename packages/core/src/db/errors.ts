export class DatabaseError extends Error {
  public code: string;
  public details: string | null;
  public hint: string | null;

  constructor(message: string, code: string = 'UNKNOWN', details: string | null = null, hint: string | null = null) {
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
  isSchemaError(): boolean {
    const combined = `${this.message} ${this.hint || ''} ${this.details || ''}`.toLowerCase();
    return (
      this.code === '42703' ||
      /^pgrst\d+$/i.test(this.code) && (
        combined.includes('schema cache') ||
        combined.includes('could not find') ||
        combined.includes('does not exist') ||
        combined.includes('unknown column')
      ) ||
      /column .* does not exist/i.test(combined)
    );
  }

  /**
   * Check if it is a fetch/connection failure
   */
  isFetchFailure(): boolean {
    const message = String(this.message || '').toLowerCase();
    return message.includes('fetch failed');
  }
}
