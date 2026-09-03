type LogContext = Record<string, string | number | boolean | null | undefined>;

function write(level: "info" | "warn" | "error", event: string, context: LogContext = {}) {
  const entry = { level, event, timestamp: new Date().toISOString(), ...context };
  if (level === "error") console.error(JSON.stringify(entry));
  else if (level === "warn") console.warn(JSON.stringify(entry));
  else console.log(JSON.stringify(entry));
}

export const logger = {
  info: (event: string, context?: LogContext) => write("info", event, context),
  warn: (event: string, context?: LogContext) => write("warn", event, context),
  error: (event: string, context?: LogContext) => write("error", event, context),
};
