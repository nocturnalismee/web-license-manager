import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { platformPlans, subscriptions } from "@/db/schema";
import { createMayarOrder } from "./order-service";
import { classifyPlanChange, planChangePolicy } from "./plan-change-policy";

export async function requestPlanChange(input: { organizationId: string; targetPlanId: string; name: string; email: string; mobile: string; redirectUrl?: string }) {
  const db = getDb();
  const [subscription] = await db.select().from(subscriptions).where(and(eq(subscriptions.organizationId, input.organizationId), eq(subscriptions.status, "active"))).limit(1);
  if (!subscription) throw new Error("ACTIVE_SUBSCRIPTION_NOT_FOUND");
  const [currentPlan] = await db.select().from(platformPlans).where(eq(platformPlans.id, subscription.platformPlanId)).limit(1);
  const [targetPlan] = await db.select().from(platformPlans).where(and(eq(platformPlans.id, input.targetPlanId), eq(platformPlans.status, "active"))).limit(1);
  if (!currentPlan || !targetPlan) throw new Error("PLATFORM_PLAN_NOT_FOUND");
  const change = classifyPlanChange(currentPlan.priceIdr, targetPlan.priceIdr);
  const policy = planChangePolicy(change);
  if (change === "same") return { type: change, policy, subscription };
  if (change === "upgrade") {
    const order = await createMayarOrder({ ...input, platformPlanId: input.targetPlanId });
    return { type: change, policy, checkoutUrl: order.checkoutUrl, orderId: order.id };
  }
  const [updated] = await db.update(subscriptions).set({ scheduledPlatformPlanId: targetPlan.id, updatedAt: new Date() }).where(eq(subscriptions.id, subscription.id)).returning();
  return { type: change, policy, subscription: updated };
}

export async function cancelSubscription(organizationId: string) {
  const [updated] = await getDb().update(subscriptions).set({ cancelAtPeriodEnd: true, updatedAt: new Date() }).where(and(eq(subscriptions.organizationId, organizationId), eq(subscriptions.status, "active"))).returning();
  if (!updated) throw new Error("ACTIVE_SUBSCRIPTION_NOT_FOUND");
  return updated;
}

export async function resumeSubscription(organizationId: string) {
  const [updated] = await getDb().update(subscriptions).set({ cancelAtPeriodEnd: false, updatedAt: new Date() }).where(and(eq(subscriptions.organizationId, organizationId), eq(subscriptions.status, "active"))).returning();
  if (!updated) throw new Error("ACTIVE_SUBSCRIPTION_NOT_FOUND");
  return updated;
}
