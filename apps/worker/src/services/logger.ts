export type LogLevel = 'info' | 'warn' | 'error';

export function log(level: LogLevel, message: string, meta: Record<string, unknown> = {}) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(payload));
}
