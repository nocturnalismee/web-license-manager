import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrganizationAccess } from "@/lib/organization-access";
import { createApiKey, listApiKeys } from "@/modules/developer-api/api-key-service";

const schema = z.object({ name: z.string().trim().min(2).max(100), product_id: z.string().uuid().optional() });
type Context = { params: Promise<{ organizationId: string }> };

function responseError(error: unknown, requestId: string) {
  const code = error instanceof Error ? error.message : "INTERNAL_ERROR";
  const status = code === "UNAUTHENTICATED" ? 401 : code === "FORBIDDEN" ? 403 : code.startsWith("INVALID") ? 400 : 500;
  return NextResponse.json({ data: null, error: { code, message: status === 500 ? "Internal server error" : code.replaceAll("_", " ") }, request_id: requestId }, { status });
}

export async function GET(_request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try { const { organizationId } = await context.params; await requireOrganizationAccess(organizationId, "resource:read"); return NextResponse.json({ data: await listApiKeys(organizationId), error: null, request_id: requestId }); }
  catch (error) { return responseError(error, requestId); }
}

export async function POST(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    const { organizationId } = await context.params;
    const access = await requireOrganizationAccess(organizationId, "resource:write");
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return responseError(new Error("INVALID_API_KEY_NAME"), requestId);
    const data = await createApiKey({ organizationId, productId: parsed.data.product_id, name: parsed.data.name, actorId: access.user.id, requestId });
    return NextResponse.json({ data, error: null, request_id: requestId }, { status: 201 });
  } catch (error) { return responseError(error, requestId); }
}
