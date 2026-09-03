import { NextResponse } from "next/server";
import { z } from "zod";
import { createProduct, listProducts } from "@/modules/catalog/product-service";
import { requireOrganizationAccess } from "@/lib/organization-access";

const schema = z.object({ name: z.string().trim().min(2).max(160), description: z.string().max(2000).optional() });
type Context = { params: Promise<{ organizationId: string }> };

function errorResponse(error: unknown, requestId: string) {
  const code = error instanceof Error ? error.message : "INTERNAL_ERROR";
  const status = code === "UNAUTHENTICATED" ? 401 : code === "FORBIDDEN" ? 403 : code.startsWith("INVALID") ? 400 : code === "CONFLICT" ? 409 : 500;
  const message = status === 500 ? "Internal server error" : code.replaceAll("_", " ");
  return NextResponse.json({ data: null, error: { code, message }, request_id: requestId }, { status });
}

export async function GET(_request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try { const { organizationId } = await context.params; await requireOrganizationAccess(organizationId, "resource:read"); return NextResponse.json({ data: await listProducts(organizationId), error: null, request_id: requestId }); }
  catch (error) { return errorResponse(error, requestId); }
}

export async function POST(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    const { organizationId } = await context.params;
    await requireOrganizationAccess(organizationId, "resource:write");
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return errorResponse(new Error("INVALID_REQUEST"), requestId);
    return NextResponse.json({ data: await createProduct(organizationId, parsed.data.name, parsed.data.description), error: null, request_id: requestId }, { status: 201 });
  } catch (error) { return errorResponse(error, requestId); }
}
