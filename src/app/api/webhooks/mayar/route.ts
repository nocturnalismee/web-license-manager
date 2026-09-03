import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { entitlements, orders, payments, platformPlans, subscriptions, webhookEvents } from "@/db/schema";
import { parsePlatformLimits } from "@/modules/entitlements/entitlement-service";
import { verifyMayarWebhook } from "@/modules/billing/mayar-adapter";

type MayarPayload = { event?: string; data?: { id?: string; transactionId?: string; transaction_id?: string; status?: string; amount?: number; updatedAt?: string } };

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-mayar-signature") ?? request.headers.get("x-webhook-signature");
  if (!verifyMayarWebhook(rawBody, signature, process.env.MAYAR_WEBHOOK_SECRET)) return NextResponse.json({ error: "INVALID_WEBHOOK_SIGNATURE" }, { status: 401 });
  let payload: MayarPayload;
  try { payload = JSON.parse(rawBody) as MayarPayload; } catch { return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 }); }
  const eventType = payload.event;
  const providerPaymentId = payload.data?.transactionId ?? payload.data?.transaction_id ?? payload.data?.id;
  if (!eventType || !providerPaymentId) return NextResponse.json({ error: "INVALID_WEBHOOK_PAYLOAD" }, { status: 400 });
  // Mayar's payload may not include a separate event UUID. Include event type
  // and provider update timestamp so reminder and received events are distinct,
  // while an exact retry remains idempotent.
  const eventId = `${eventType}:${providerPaymentId}:${payload.data?.updatedAt ?? ""}`;
  const db = getDb();
  await db.transaction(async (tx) => {
    const inserted = await tx.insert(webhookEvents).values({ provider: "mayar", eventId, eventType, payload: rawBody }).onConflictDoNothing().returning({ id: webhookEvents.id });
    if (!inserted.length) return;
    const [order] = await tx.select().from(orders).where(and(eq(orders.provider, "mayar"), eq(orders.providerOrderId, providerPaymentId))).limit(1);
    if (!order) {
      await tx.update(webhookEvents).set({ status: "ignored", processedAt: new Date() }).where(eq(webhookEvents.id, inserted[0].id));
      return;
    }
    const paid = eventType === "payment.received" && String(payload.data?.status ?? "").toUpperCase() === "SUCCESS";
    const status = paid ? "paid" : eventType === "payment.reminder" ? "pending" : "failed";
    await tx.insert(payments).values({ orderId: order.id, organizationId: order.organizationId, provider: "mayar", providerPaymentId, status, amount: payload.data?.amount ?? order.amount, currency: order.currency, paidAt: paid ? new Date() : null, rawPayload: rawBody }).onConflictDoUpdate({ target: [payments.provider, payments.providerPaymentId], set: { status, paidAt: paid ? new Date() : null, rawPayload: rawBody, updatedAt: new Date() } });
    await tx.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, order.id));
    if (paid) {
      const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const [subscription] = await tx.select().from(subscriptions).where(eq(subscriptions.organizationId, order.organizationId)).limit(1);
      let subscriptionId = subscription?.id;
      if (subscription) await tx.update(subscriptions).set({ platformPlanId: order.platformPlanId, status: "active", provider: "mayar", providerSubscriptionId: providerPaymentId, currentPeriodEndsAt: periodEnd, graceEndsAt: null, updatedAt: new Date() }).where(eq(subscriptions.id, subscription.id));
      else {
        const [created] = await tx.insert(subscriptions).values({ organizationId: order.organizationId, platformPlanId: order.platformPlanId, status: "active", provider: "mayar", providerSubscriptionId: providerPaymentId, currentPeriodEndsAt: periodEnd }).returning({ id: subscriptions.id });
        subscriptionId = created.id;
      }
      const [plan] = await tx.select().from(platformPlans).where(eq(platformPlans.id, order.platformPlanId)).limit(1);
      if (plan && subscriptionId) for (const [feature, limitValue] of Object.entries(parsePlatformLimits(plan.limits))) await tx.insert(entitlements).values({ organizationId: order.organizationId, subscriptionId, feature, limitValue }).onConflictDoUpdate({ target: [entitlements.organizationId, entitlements.feature], set: { subscriptionId, limitValue, updatedAt: new Date() } });
    }
    await tx.update(webhookEvents).set({ status: "processed", processedAt: new Date() }).where(eq(webhookEvents.id, inserted[0].id));
  });
  return NextResponse.json({ received: true });
}
