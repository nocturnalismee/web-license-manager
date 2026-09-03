import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrganizationAccess } from "@/lib/organization-access";
import { createManagedLicense, listManagedLicenses } from "@/modules/licensing/license-management-service";

const schema = z.object({ product_id: z.string().uuid(), product_license_plan_id: z.string().uuid(), customer: z.object({ name: z.string().trim().max(160).optional(), email: z.string().email().optional() }) });
type Context = { params: Promise<{ organizationId: string }> };

export async function GET(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    const { organizationId } = await context.params;
    await requireOrganizationAccess(organizationId, "resource:read");
    const url = new URL(request.url); const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? 20) || 20)); const offset = Math.max(0, Number(url.searchParams.get("offset") ?? 0) || 0);
    const data = await listManagedLicenses({ organizationId, limit, offset, status: url.searchParams.get("status") ?? undefined, productId: url.searchParams.get("product_id") ?? undefined, search: url.searchParams.get("search") ?? undefined });
    return NextResponse.json({ data, error: null, request_id: requestId });
  } catch (error) { const code = error instanceof Error ? error.message : "INTERNAL_ERROR"; return NextResponse.json({ data: null, error: { code }, request_id: requestId }, { status: code === "UNAUTHENTICATED" ? 401 : code === "FORBIDDEN" ? 403 : 500 }); }
}

export async function POST(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    const { organizationId } = await context.params; await requireOrganizationAccess(organizationId, "resource:write");
    const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ data: null, error: { code: "INVALID_REQUEST" }, request_id: requestId }, { status: 400 });
    const data = await createManagedLicense({ organizationId, productId: parsed.data.product_id, productLicensePlanId: parsed.data.product_license_plan_id, customer: parsed.data.customer });
    return NextResponse.json({ data, error: null, request_id: requestId }, { status: 201 });
  } catch (error) { const code = error instanceof Error ? error.message : "INTERNAL_ERROR"; const status = code === "UNAUTHENTICATED" ? 401 : code === "FORBIDDEN" ? 403 : code.endsWith("NOT_FOUND") ? 404 : 400; return NextResponse.json({ data: null, error: { code }, request_id: requestId }, { status }); }
}
