import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'password', 'passwd', 'pwd', 'token', 'authorization', 'auth', 'email',
      'secret', 'key', 'api_key', 'access', 'refresh', 'txn', 'transaction', 
      'client_secret', 'private', 'rsa', 'ssh', 'cookie', 'session', 'otp', 'salt',
      '*.password', '*.token', '*.secret', '*.email' // basic nested support
    ],
    censor: '[REDACTED]'
  },
  transport: isProduction 
    ? undefined // In production, stdout is typically streamed to a collector (e.g. Datadog agent, promtail for Loki)
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard'
        }
      }
});

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export interface LogMeta { [k: string]: unknown }

// We wrap Pino to maintain backward compatibility with the existing signature: logger.info(msg, meta)
export const logger = {
  debug: (m: string, meta?: LogMeta) => meta && Object.keys(meta).length ? pinoLogger.debug(meta, m) : pinoLogger.debug(m),
  info: (m: string, meta?: LogMeta) => meta && Object.keys(meta).length ? pinoLogger.info(meta, m) : pinoLogger.info(m),
  warn: (m: string, meta?: LogMeta) => meta && Object.keys(meta).length ? pinoLogger.warn(meta, m) : pinoLogger.warn(m),
  error: (m: string, meta?: LogMeta) => meta && Object.keys(meta).length ? pinoLogger.error(meta, m) : pinoLogger.error(m),
};
