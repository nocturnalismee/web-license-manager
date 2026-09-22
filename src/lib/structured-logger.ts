type LogContext = Record<string, string | number | boolean | null | undefined>;

const SENSITIVE_KEYS = new Set(["license_key", "licensekey", "api_key", "apikey", "secret", "token", "signature", "authorization"]);

function redactSecrets(context: LogContext): LogContext {
  const out: LogContext = {};
  for (const [key, value] of Object.entries(context)) {
    out[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? "[redacted]" : value;
  }
  return out;
}

function write(level: "info" | "warn" | "error", event: string, context: LogContext = {}) {
  const entry = { level, event, timestamp: new Date().toISOString(), ...redactSecrets(context) };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

export const logger = {
  info: (event: string, context?: LogContext) => write("info", event, context),
  warn: (event: string, context?: LogContext) => write("warn", event, context),
  error: (event: string, context?: LogContext) => write("error", event, context),
};
