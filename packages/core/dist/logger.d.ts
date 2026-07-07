type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogMeta {
    [k: string]: unknown;
}
export declare const logger: {
    debug: (m: string, meta?: LogMeta) => void;
    info: (m: string, meta?: LogMeta) => void;
    warn: (m: string, meta?: LogMeta) => void;
    error: (m: string, meta?: LogMeta) => void;
};
export type { LogLevel };
//# sourceMappingURL=logger.d.ts.map