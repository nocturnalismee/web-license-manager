import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError } from "../_shared";
import { verifyVendorApiKey } from "@/modules/developer-api/api-key-service";
import { getLicenseStatus } from "@/modules/licensing/public-license-service";

const schema = z.object({
  product_public_id: z.string().regex(/^prod_[a-z0-9]{24}$/),
  license_key: z.string().min(12).max(64),
});

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const auth = request.headers.get("authorization") ?? "";
  const secret = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  try {
    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ data: null, error: { code: "INVALID_REQUEST" }, request_id: requestId }, { status: 400 });
    await verifyVendorApiKey(secret, { productPublicId: parsed.data.product_public_id });
    return NextResponse.json({ data: await getLicenseStatus({ productPublicId: parsed.data.product_public_id, licenseKey: parsed.data.license_key }), error: null, request_id: requestId });
  } catch (error) {
    const code = error instanceof Error ? error.message : "INTERNAL_ERROR";
    if (code === "UNAUTHENTICATED") return NextResponse.json({ data: null, error: { code }, request_id: requestId }, { status: 401 });
    if (code === "FORBIDDEN") return NextResponse.json({ data: null, error: { code }, request_id: requestId }, { status: 403 });
    return apiError(code, requestId);
  }
}
