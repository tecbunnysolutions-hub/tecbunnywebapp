import pino from 'pino';
import { AsyncLocalStorage } from 'node:async_hooks';

export const loggerContext = new AsyncLocalStorage<{ requestId: string }>();

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

function getContextMeta(meta?: LogMeta): LogMeta | undefined {
  const store = loggerContext.getStore();
  if (store?.requestId) {
    return { ...meta, requestId: store.requestId };
  }
  return meta;
}

// We wrap Pino to maintain backward compatibility with the existing signature: logger.info(msg, meta)
export const logger = {
  debug: (m: string, meta?: LogMeta) => {
    const ctxMeta = getContextMeta(meta);
    return ctxMeta && Object.keys(ctxMeta).length ? pinoLogger.debug(ctxMeta, m) : pinoLogger.debug(m);
  },
  info: (m: string, meta?: LogMeta) => {
    const ctxMeta = getContextMeta(meta);
    return ctxMeta && Object.keys(ctxMeta).length ? pinoLogger.info(ctxMeta, m) : pinoLogger.info(m);
  },
  warn: (m: string, meta?: LogMeta) => {
    const ctxMeta = getContextMeta(meta);
    return ctxMeta && Object.keys(ctxMeta).length ? pinoLogger.warn(ctxMeta, m) : pinoLogger.warn(m);
  },
  error: (m: string, meta?: LogMeta) => {
    const ctxMeta = getContextMeta(meta);
    return ctxMeta && Object.keys(ctxMeta).length ? pinoLogger.error(ctxMeta, m) : pinoLogger.error(m);
  },
};
