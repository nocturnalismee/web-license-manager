import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getServerEnv } from "@/lib/env";
import * as schema from "@/db/schema";

let pool: Pool | undefined;

export function getDb() {
  const { DATABASE_POOL_URL, DATABASE_URL } = getServerEnv();
  const connectionString = DATABASE_POOL_URL ?? DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  pool ??= new Pool({ connectionString, max: 5 });
  return drizzle(pool, { schema });
}
