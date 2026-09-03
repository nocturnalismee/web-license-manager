import { and, count, desc, eq, ilike } from "drizzle-orm";
import { getDb } from "@/db";
import { customers, licenseActivations, licenses, productLicensePlans, products } from "@/db/schema";
import { generateLicenseKey } from "@/lib/license-key";
import { recordAuditEvent } from "@/modules/audit/audit-service";

function addDays(date: Date, days: number) { return new Date(date.getTime() + days * 24 * 60 * 60 * 1000); }

export async function createManagedLicense(input: { organizationId: string; productId: string; productLicensePlanId: string; customer: { name?: string; email?: string } }) {
  const db = getDb();
  const [plan] = await db.select().from(productLicensePlans).where(and(eq(productLicensePlans.id, input.productLicensePlanId), eq(productLicensePlans.organizationId, input.organizationId), eq(productLicensePlans.productId, input.productId))).limit(1);
  if (!plan) throw new Error("PRODUCT_LICENSE_PLAN_NOT_FOUND");
  const [product] = await db.select({ id: products.id }).from(products).where(and(eq(products.id, input.productId), eq(products.organizationId, input.organizationId), eq(products.status, "active"))).limit(1);
  if (!product) throw new Error("PRODUCT_NOT_FOUND");
  const key = generateLicenseKey();
  const startsAt = new Date();
  const result = await db.transaction(async (tx) => {
    const [customer] = await tx.insert(customers).values({ organizationId: input.organizationId, name: input.customer.name?.trim() || null, email: input.customer.email?.trim().toLowerCase() || null }).returning();
    const [license] = await tx.insert(licenses).values({ organizationId: input.organizationId, productId: input.productId, productLicensePlanId: plan.id, customerId: customer.id, keyPrefix: key.prefix, keyHash: key.hash, status: "active", startsAt, expiresAt: addDays(startsAt, plan.durationDays), activationLimit: plan.activationLimit }).returning();
    return { license, customer, licenseKey: key.plaintext };
  });
  await recordAuditEvent({ organizationId: input.organizationId, actorType: "user", action: "license.created", resourceType: "license", resourceId: result.license.id, metadata: { product_id: input.productId, customer_id: result.customer.id }, success: true });
  return result;
}

export async function listManagedLicenses(input: { organizationId: string; limit: number; offset: number; status?: string; productId?: string; search?: string }) {
  const filters = [eq(licenses.organizationId, input.organizationId)];
  if (input.status) filters.push(eq(licenses.status, input.status));
  if (input.productId) filters.push(eq(licenses.productId, input.productId));
  if (input.search) filters.push(ilike(customers.email, `%${input.search}%`));
  const rows = await getDb().select({
    id: licenses.id, keyPrefix: licenses.keyPrefix, status: licenses.status, startsAt: licenses.startsAt, expiresAt: licenses.expiresAt, activationLimit: licenses.activationLimit,
    product: products.name, productId: licenses.productId, plan: productLicensePlans.name, customerName: customers.name, customerEmail: customers.email,
    activationCount: count(licenseActivations.id),
  }).from(licenses).innerJoin(products, eq(products.id, licenses.productId)).innerJoin(productLicensePlans, eq(productLicensePlans.id, licenses.productLicensePlanId)).innerJoin(customers, eq(customers.id, licenses.customerId)).leftJoin(licenseActivations, and(eq(licenseActivations.licenseId, licenses.id), eq(licenseActivations.status, "active"))).where(and(...filters)).groupBy(licenses.id, products.name, productLicensePlans.name, customers.name, customers.email).orderBy(desc(licenses.createdAt)).limit(input.limit + 1).offset(input.offset);
  const hasMore = rows.length > input.limit;
  return { items: rows.slice(0, input.limit), nextOffset: hasMore ? input.offset + input.limit : null };
}

export async function listLicenseActivations(organizationId: string, licenseId: string) {
  return getDb().select({ id: licenseActivations.id, installationId: licenseActivations.installationId, domain: licenseActivations.domain, status: licenseActivations.status, lastSeenAt: licenseActivations.lastSeenAt, deactivatedAt: licenseActivations.deactivatedAt }).from(licenseActivations).where(and(eq(licenseActivations.organizationId, organizationId), eq(licenseActivations.licenseId, licenseId))).orderBy(desc(licenseActivations.lastSeenAt));
}
