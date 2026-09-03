import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { orders, platformPlans } from "@/db/schema";
import { getMayarClient } from "./mayar-adapter";

export async function createMayarOrder(input: { organizationId: string; platformPlanId: string; name: string; email: string; mobile: string; redirectUrl?: string }) {
  const db = getDb();
  const [plan] = await db.select().from(platformPlans).where(eq(platformPlans.id, input.platformPlanId)).limit(1);
  if (!plan || plan.status !== "active") throw new Error("PLATFORM_PLAN_NOT_FOUND");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const [order] = await db.insert(orders).values({ organizationId: input.organizationId, platformPlanId: plan.id, provider: "mayar", amount: plan.priceIdr, currency: "IDR", expiresAt, metadata: JSON.stringify({ planName: plan.name }) }).returning();
  try {
    const invoice = await getMayarClient().createInvoice({ name: input.name, email: input.email, mobile: input.mobile, amount: plan.priceIdr, description: `IndoLicense ${plan.name}`, redirectUrl: input.redirectUrl ?? `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/dashboard/${input.organizationId}/billing`, expiredAt: expiresAt });
    const [updated] = await db.update(orders).set({ providerOrderId: invoice.transactionId, checkoutUrl: invoice.link, updatedAt: new Date() }).where(eq(orders.id, order.id)).returning();
    return updated;
  } catch (error) {
    await db.update(orders).set({ status: "failed", updatedAt: new Date() }).where(eq(orders.id, order.id));
    throw error;
  }
}
