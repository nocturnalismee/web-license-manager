import { NextResponse } from "next/server";
import { requireOrganizationAccess } from "@/lib/organization-access";
import { revokeApiKey } from "@/modules/developer-api/api-key-service";

export async function DELETE(_request: Request, context: { params: Promise<{ organizationId: string; apiKeyId: string }> }) {
  const requestId = crypto.randomUUID();
  try { const { organizationId, apiKeyId } = await context.params; const access = await requireOrganizationAccess(organizationId, "resource:write"); const data = await revokeApiKey({ organizationId, apiKeyId, actorId: access.user.id, requestId }); return NextResponse.json({ data, error: null, request_id: requestId }); }
  catch (error) { const code = error instanceof Error ? error.message : "INTERNAL_ERROR"; const status = code === "UNAUTHENTICATED" ? 401 : code === "FORBIDDEN" ? 403 : code === "API_KEY_NOT_FOUND" ? 404 : 500; return NextResponse.json({ data: null, error: { code, message: status === 500 ? "Internal server error" : code.replaceAll("_", " ") }, request_id: requestId }, { status }); }
}
