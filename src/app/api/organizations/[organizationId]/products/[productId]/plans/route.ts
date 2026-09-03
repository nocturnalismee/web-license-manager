import { NextResponse } from "next/server";
import { z } from "zod";
import { createProductPlan, listProductPlans } from "@/modules/catalog/product-service";
import { requireOrganizationAccess } from "@/lib/organization-access";

const schema = z.object({ name: z.string().trim().min(2).max(100), price_idr: z.number().int().min(0), billing_interval: z.string().max(20).optional(), activation_limit: z.number().int().min(1), duration_days: z.number().int().min(1), features: z.array(z.string().max(80)).max(50).optional() });
type Context = { params: Promise<{ organizationId: string; productId: string }> };

export async function GET(_request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try { const { organizationId, productId } = await context.params; await requireOrganizationAccess(organizationId, "resource:read"); return NextResponse.json({ data: await listProductPlans(organizationId, productId), error: null, request_id: requestId }); }
  catch (error) { return NextResponse.json({ data: null, error: { code: error instanceof Error ? error.message : "INTERNAL_ERROR", message: "Unable to load plans" }, request_id: requestId }, { status: error instanceof Error && error.message === "UNAUTHENTICATED" ? 401 : 403 }); }
}

export async function POST(request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try {
    const { organizationId, productId } = await context.params;
    await requireOrganizationAccess(organizationId, "resource:write");
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ data: null, error: { code: "INVALID_REQUEST", message: "Product license plan is invalid" }, request_id: requestId }, { status: 400 });
    const data = await createProductPlan({ organizationId, productId, name: parsed.data.name, priceIdr: parsed.data.price_idr, billingInterval: parsed.data.billing_interval, activationLimit: parsed.data.activation_limit, durationDays: parsed.data.duration_days, features: parsed.data.features });
    return NextResponse.json({ data, error: null, request_id: requestId }, { status: 201 });
  } catch (error) { const code = error instanceof Error ? error.message : "INTERNAL_ERROR"; return NextResponse.json({ data: null, error: { code, message: code === "PRODUCT_NOT_FOUND" ? "Product not found" : "Unable to create plan" }, request_id: requestId }, { status: code === "UNAUTHENTICATED" ? 401 : code === "FORBIDDEN" ? 403 : code === "PRODUCT_NOT_FOUND" ? 404 : 400 }); }
}
