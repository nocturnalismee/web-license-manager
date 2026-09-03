import { NextResponse } from "next/server";
import { z } from "zod";
import { requireOrganizationAccess } from "@/lib/organization-access";
import { cancelSubscription, requestPlanChange, resumeSubscription } from "@/modules/billing/subscription-change-service";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("change_plan"), targetPlanId: z.string().uuid(), name: z.string().trim().min(2).max(160), email: z.string().email(), mobile: z.string().trim().min(8).max(30), redirectUrl: z.string().url().optional() }),
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("resume") }),
]);
type Context = { params: Promise<{ organizationId: string }> };

export async function PATCH(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    const { organizationId } = await context.params;
    await requireOrganizationAccess(organizationId, "billing:manage");
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ data: null, error: { code: "INVALID_REQUEST" }, request_id: requestId }, { status: 400 });
    const data = parsed.data.action === "change_plan"
      ? await requestPlanChange({ organizationId, ...parsed.data })
      : parsed.data.action === "cancel" ? await cancelSubscription(organizationId) : await resumeSubscription(organizationId);
    return NextResponse.json({ data, error: null, request_id: requestId });
  } catch (error) {
    const code = error instanceof Error ? error.message : "INTERNAL_ERROR";
    const status = code === "UNAUTHENTICATED" ? 401 : code === "FORBIDDEN" ? 403 : code.endsWith("NOT_FOUND") ? 404 : code.startsWith("MAYAR_") ? 503 : 500;
    return NextResponse.json({ data: null, error: { code }, request_id: requestId }, { status });
  }
}
