import { getDb } from "@/db";
import { auditLogs } from "@/db/schema";
import { logger } from "@/lib/structured-logger";

type AuditInput = {
  organizationId?: string;
  actorType: "user" | "system" | "webhook" | "internal_admin" | "public_api";
  actorId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
  success: boolean;
};

export async function recordAuditEvent(input: AuditInput) {
  const [event] = await getDb().insert(auditLogs).values({
    organizationId: input.organizationId,
    actorType: input.actorType,
    actorId: input.actorId,
    action: input.action,
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    requestId: input.requestId,
    metadata: input.metadata ? JSON.stringify(input.metadata) : undefined,
    success: input.success,
  }).returning({ id: auditLogs.id });
  logger.info("audit_event_recorded", { action: input.action, resource_type: input.resourceType, success: input.success, request_id: input.requestId });
  return event;
}
