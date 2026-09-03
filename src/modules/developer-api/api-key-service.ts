import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import { apiKeys } from "@/db/schema";
import { generateApiKey } from "@/lib/api-key";
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
