import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { apiKeys, products } from "@/db/schema";
import { generateApiKey, hashApiKey } from "@/lib/api-key";
import { recordAuditEvent } from "@/modules/audit/audit-service";

export async function listApiKeys(organizationId: string) {
  return getDb().select({ id: apiKeys.id, name: apiKeys.name, keyPrefix: apiKeys.keyPrefix, productId: apiKeys.productId, revokedAt: apiKeys.revokedAt, lastUsedAt: apiKeys.lastUsedAt, createdAt: apiKeys.createdAt }).from(apiKeys).where(eq(apiKeys.organizationId, organizationId));
}

export async function createApiKey(input: { organizationId: string; productId?: string; name: string; actorId: string; requestId: string }) {
  const name = input.name.trim();
  if (name.length < 2 || name.length > 100) throw new Error("INVALID_API_KEY_NAME");
  const generated = generateApiKey();
  const [apiKey] = await getDb().insert(apiKeys).values({ organizationId: input.organizationId, productId: input.productId, name, keyPrefix: generated.prefix, keyHash: generated.hash }).returning({ id: apiKeys.id, name: apiKeys.name, keyPrefix: apiKeys.keyPrefix, productId: apiKeys.productId, createdAt: apiKeys.createdAt });
  await recordAuditEvent({ organizationId: input.organizationId, actorType: "user", actorId: input.actorId, action: "api_key.created", resourceType: "api_key", resourceId: apiKey.id, requestId: input.requestId, success: true });
  return { ...apiKey, secret: generated.plaintext };
}

export async function revokeApiKey(input: { organizationId: string; apiKeyId: string; actorId: string; requestId: string }) {
  const [apiKey] = await getDb().update(apiKeys).set({ revokedAt: new Date(), updatedAt: new Date() }).where(and(eq(apiKeys.id, input.apiKeyId), eq(apiKeys.organizationId, input.organizationId), isNull(apiKeys.revokedAt))).returning({ id: apiKeys.id });
  if (!apiKey) throw new Error("API_KEY_NOT_FOUND");
  await recordAuditEvent({ organizationId: input.organizationId, actorType: "user", actorId: input.actorId, action: "api_key.revoked", resourceType: "api_key", resourceId: apiKey.id, requestId: input.requestId, success: true });
  return apiKey;
}

export async function verifyVendorApiKey(secret: string, scope?: { organizationId?: string; productPublicId?: string }) {
  if (!secret || !secret.startsWith("sk_live_")) throw new Error("UNAUTHENTICATED");
  const [row] = await getDb()
    .select({ id: apiKeys.id, organizationId: apiKeys.organizationId, productId: apiKeys.productId, revokedAt: apiKeys.revokedAt })
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, hashApiKey(secret)))
    .limit(1);
  if (!row || row.revokedAt) throw new Error("UNAUTHENTICATED");
  if (scope?.organizationId && row.organizationId !== scope.organizationId) throw new Error("FORBIDDEN");
  if (scope?.productPublicId && row.productId) {
    const [product] = await getDb().select({ publicId: products.publicId }).from(products).where(eq(products.id, row.productId)).limit(1);
    if (!product || product.publicId !== scope.productPublicId) throw new Error("FORBIDDEN");
  }
  await getDb().update(apiKeys).set({ lastUsedAt: new Date(), updatedAt: new Date() }).where(eq(apiKeys.id, row.id));
  return { organizationId: row.organizationId };
}
