import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { entitlements, platformPlans } from "@/db/schema";

export type PlatformLimits = Record<string, number>;

export function parsePlatformLimits(raw: string): PlatformLimits {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    const result: PlatformLimits = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!/^[a-z][a-z0-9_]*$/.test(key) || typeof value !== "number" || !Number.isInteger(value) || value < 0) throw new Error();
      result[key] = value;
    }
    return result;
  } catch { throw new Error("INVALID_PLATFORM_LIMITS"); }
}

export async function getOrganizationEntitlements(organizationId: string) {
  return getDb().select().from(entitlements).where(eq(entitlements.organizationId, organizationId));
}

export async function canUseEntitlement(organizationId: string, feature: string, amount = 1) {
  const [row] = await getDb().select({ limit: entitlements.limitValue, used: entitlements.usedValue }).from(entitlements).where(and(eq(entitlements.organizationId, organizationId), eq(entitlements.feature, feature))).limit(1);
  return Boolean(row && row.limit >= row.used + amount);
}

export async function consumeEntitlement(organizationId: string, feature: string, amount = 1) {
  if (!Number.isInteger(amount) || amount < 1) throw new Error("INVALID_ENTITLEMENT_AMOUNT");
  const [updated] = await getDb().update(entitlements).set({ usedValue: sql`${entitlements.usedValue} + ${amount}`, updatedAt: new Date() }).where(and(eq(entitlements.organizationId, organizationId), eq(entitlements.feature, feature), sql`${entitlements.usedValue} + ${amount} <= ${entitlements.limitValue}`)).returning();
  if (!updated) throw new Error("ENTITLEMENT_LIMIT_REACHED");
  return updated;
}

export async function materializePlanEntitlements(input: { organizationId: string; subscriptionId: string; platformPlanId: string }) {
  const db = getDb();
  const [plan] = await db.select().from(platformPlans).where(eq(platformPlans.id, input.platformPlanId)).limit(1);
  if (!plan) throw new Error("PLATFORM_PLAN_NOT_FOUND");
  const limits = parsePlatformLimits(plan.limits);
  return db.transaction(async (tx) => {
    const results = [];
    for (const [feature, limitValue] of Object.entries(limits)) {
      const [row] = await tx.insert(entitlements).values({ organizationId: input.organizationId, subscriptionId: input.subscriptionId, feature, limitValue }).onConflictDoUpdate({ target: [entitlements.organizationId, entitlements.feature], set: { subscriptionId: input.subscriptionId, limitValue, updatedAt: new Date() } }).returning();
      results.push(row);
    }
    return results;
  });
}
