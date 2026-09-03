import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { entitlements, platformPlans, subscriptions } from "@/db/schema";

export async function getBillingOverview(organizationId: string) {
  const db = getDb();
  const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.organizationId, organizationId)).orderBy(desc(subscriptions.createdAt)).limit(1);
  const planRows = await db.select({ id: platformPlans.id, name: platformPlans.name, priceIdr: platformPlans.priceIdr, status: platformPlans.status, limits: platformPlans.limits }).from(platformPlans).where(eq(platformPlans.status, "active"));
  const usage = subscription ? await db.select({ feature: entitlements.feature, limitValue: entitlements.limitValue, usedValue: entitlements.usedValue }).from(entitlements).where(eq(entitlements.subscriptionId, subscription.id)) : [];
  return { subscription: subscription ?? null, plans: planRows, usage };
}
