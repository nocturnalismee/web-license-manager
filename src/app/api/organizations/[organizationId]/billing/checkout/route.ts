import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrganizationAccess } from "@/lib/organization-access";
import { createMayarOrder } from "@/modules/billing/order-service";

const schema = z.object({ platformPlanId: z.string().uuid(), name: z.string().trim().min(2).max(160), email: z.string().email(), mobile: z.string().trim().min(8).max(30), redirectUrl: z.string().url().optional() });
type Context = { params: Promise<{ organizationId: string }> };

export async function POST(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    const { organizationId } = await context.params;
    await requireOrganizationAccess(organizationId, "billing:manage");
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ data: null, error: { code: "INVALID_REQUEST" }, request_id: requestId }, { status: 400 });
    const order = await createMayarOrder({ organizationId, ...parsed.data });
    return NextResponse.json({ data: order, error: null, request_id: requestId }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "INTERNAL_ERROR";
    const status = code === "UNAUTHENTICATED" ? 401 : code === "FORBIDDEN" ? 403 : code.startsWith("MAYAR_") || code === "MAYAR_API_KEY is not configured" ? 503 : 500;
    return NextResponse.json({ data: null, error: { code }, request_id: requestId }, { status });
  }
}
