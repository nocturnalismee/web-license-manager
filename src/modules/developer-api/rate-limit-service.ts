import { sql } from "drizzle-orm";
import { getDb } from "@/db";
import { rateLimitBuckets } from "@/db/schema";

export async function consumeRateLimit(key: string, limit: number, windowSeconds: number) {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / (windowSeconds * 1000)) * windowSeconds * 1000);
  const expiresAt = new Date(windowStart.getTime() + windowSeconds * 1000);
  const result = await getDb().insert(rateLimitBuckets).values({ key, windowStart, requestCount: 1, expiresAt }).onConflictDoUpdate({ target: rateLimitBuckets.key, set: { requestCount: sql`CASE WHEN ${rateLimitBuckets.windowStart} = ${windowStart} THEN ${rateLimitBuckets.requestCount} + 1 ELSE 1 END`, windowStart, expiresAt } }).returning({ requestCount: rateLimitBuckets.requestCount });
  const requestCount = result[0]?.requestCount ?? limit + 1;
  return { allowed: requestCount <= limit, requestCount, retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000)) };
}
