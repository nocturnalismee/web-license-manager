import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@/db";
import * as schema from "@/db/schema";
import { getServerEnv } from "@/lib/env";

const env = getServerEnv();

if (!env.BETTER_AUTH_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("BETTER_AUTH_SECRET must be configured in production");
}

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    // Better Auth uses adapter model names (user/session/account/verification),
    // while IndoLicense keeps plural table exports for Drizzle conventions.
    schema,
    usePlural: true,
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET ?? "indolicense-local-development-secret-change-me-32",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
});
