import sql from "./db";

export type LogLevel = "ERROR" | "WARN" | "INFO" | "DEBUG";

interface LogEntry {
  level: LogLevel;
  action: string;
  actorId?: string;
  deliveryId?: string;
  metadata?: Record<string, unknown>;
}

const queue: LogEntry[] = [];
let flushing = false;

async function flush(): Promise<void> {
  if (flushing || queue.length === 0) return;
  flushing = true;
  const batch = queue.splice(0);
  try {
    await sql`
      INSERT INTO audit_logs ${sql(batch.map((e) => ({
        level: e.level,
        action: e.action,
        actor_id: e.actorId ?? null,
        delivery_id: e.deliveryId ?? null,
        metadata: e.metadata ? JSON.stringify(e.metadata) : null,
      })))}
    `;
  } catch {
    // silently drop — never throw from logger
  } finally {
    flushing = false;
    if (queue.length > 0) void flush();
  }
}

export function log(entry: LogEntry): void {
  queue.push(entry);
  if (!flushing) void flush();
}

export const logger = {
  error: (action: string, meta?: Record<string, unknown>) =>
    log({ level: "ERROR", action, ...meta }),
  warn: (action: string, meta?: Record<string, unknown>) =>
    log({ level: "WARN", action, ...meta }),
  info: (action: string, meta?: Record<string, unknown>) =>
    log({ level: "INFO", action, ...meta }),
  debug: (action: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") {
      log({ level: "DEBUG", action, ...meta });
    }
  },
};
