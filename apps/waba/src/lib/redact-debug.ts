const SENSITIVE_KEY = /phone|mobile|msisdn|^from$|^to$|wa_id|body|text|message|content|caption/i;

export function redactDebugDetail(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[truncated]';
  if (Array.isArray(value)) return value.map((item) => redactDebugDetail(item, depth + 1));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        SENSITIVE_KEY.test(key) ? '[redacted]' : redactDebugDetail(item, depth + 1),
      ]),
    );
  }
  return value;
}
