import { and, count, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { licenseActivations, licenses, productLicensePlans, products } from "@/db/schema";
import { hashLicenseKey } from "@/lib/license-key";
import { getEffectiveLicenseStatus, normalizeDomain } from "./license-domain";

type LicenseRequest = { productPublicId: string; licenseKey: string; installationId: string; domain: string };

function validateInstallationId(value: string): string {
  const normalized = value.trim();
  if (!/^[A-Za-z0-9._:-]{8,160}$/.test(normalized)) throw new Error("INVALID_INSTALLATION_ID");
  return normalized;
}

// The Drizzle transaction and db objects expose the same query builder methods used here.
// Keeping this internal adapter structural avoids coupling the domain service to a driver type.
async function resolveLicense(tx: any, request: LicenseRequest, lock = false) {
  const domain = normalizeDomain(request.domain);
  const installationId = validateInstallationId(request.installationId);
  const keyHash = hashLicenseKey(request.licenseKey);
  const query = tx.select({ license: licenses, product: products, plan: productLicensePlans })
    .from(licenses)
    .innerJoin(products, eq(products.id, licenses.productId))
    .innerJoin(productLicensePlans, eq(productLicensePlans.id, licenses.productLicensePlanId))
    .where(and(eq(products.publicId, request.productPublicId), eq(licenses.keyHash, keyHash)))
    .limit(1);
  const rows = lock ? await query.for("update") : await query;
  const row = rows[0];
  if (!row) throw new Error("LICENSE_NOT_FOUND");
  if (row.product.status !== "active") throw new Error("PRODUCT_UNAVAILABLE");
  return { ...row, domain, installationId };
}

function publicLicenseResponse(row: { license: typeof licenses.$inferSelect; product: typeof products.$inferSelect; plan: typeof productLicensePlans.$inferSelect }) {
  return {
    license_id: row.license.id,
    product: row.product.publicId,
    plan: row.plan.name,
    status: getEffectiveLicenseStatus(row.license),
    expires_at: row.license.expiresAt.toISOString(),
  };
}

export async function activateLicense(request: LicenseRequest) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const row = await resolveLicense(tx, request, true);
    const status = getEffectiveLicenseStatus(row.license);
    if (status !== "active") throw new Error(`LICENSE_${status.toUpperCase()}`);

    const [existing] = await tx.select().from(licenseActivations).where(and(
      eq(licenseActivations.licenseId, row.license.id),
      eq(licenseActivations.installationId, row.installationId),
    )).limit(1);
    if (existing?.status === "active") {
      const [updated] = await tx.update(licenseActivations).set({
        domain: request.domain.trim(), normalizedDomain: row.domain, lastSeenAt: new Date(), updatedAt: new Date(),
      }).where(eq(licenseActivations.id, existing.id)).returning();
      return { ...publicLicenseResponse(row), activation_id: updated.id, idempotent: true };
    }

    const [{ activeCount }] = await tx.select({ activeCount: count() }).from(licenseActivations).where(and(
      eq(licenseActivations.licenseId, row.license.id), eq(licenseActivations.status, "active"),
    ));
    if (activeCount >= row.license.activationLimit) throw new Error("ACTIVATION_LIMIT_REACHED");

    const [activation] = existing
      ? await tx.update(licenseActivations).set({ status: "active", domain: request.domain.trim(), normalizedDomain: row.domain, deactivatedAt: null, lastSeenAt: new Date(), updatedAt: new Date() }).where(eq(licenseActivations.id, existing.id)).returning()
      : await tx.insert(licenseActivations).values({ organizationId: row.license.organizationId, licenseId: row.license.id, installationId: row.installationId, domain: request.domain.trim(), normalizedDomain: row.domain }).returning();
    return { ...publicLicenseResponse(row), activation_id: activation.id, idempotent: false };
  });
}

export async function validateLicense(request: LicenseRequest) {
  const db = getDb();
  const row = await resolveLicense(db, request);
  const status = getEffectiveLicenseStatus(row.license);
  return { ...publicLicenseResponse(row), valid: status === "active" };
}

export async function deactivateLicense(request: LicenseRequest) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const row = await resolveLicense(tx, request, true);
    const [activation] = await tx.select().from(licenseActivations).where(and(
      eq(licenseActivations.licenseId, row.license.id), eq(licenseActivations.installationId, row.installationId),
    )).limit(1);
    if (!activation || activation.status !== "active") throw new Error("ACTIVATION_NOT_FOUND");
    const [updated] = await tx.update(licenseActivations).set({ status: "deactivated", deactivatedAt: new Date(), updatedAt: new Date() }).where(eq(licenseActivations.id, activation.id)).returning();
    return { ...publicLicenseResponse(row), activation_id: updated.id, deactivated: true };
  });
}
