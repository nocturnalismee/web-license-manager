import { NextResponse } from "next/server";
import { z } from "zod";

export const publicLicenseRequestSchema = z.object({
  product_public_id: z.string().regex(/^prod_[a-z0-9]{24}$/),
  license_key: z.string().min(12).max(64),
  installation_id: z.string().regex(/^[A-Za-z0-9._:-]{8,160}$/),
  domain: z.string().min(3).max(255),
});

export function apiError(code: string, requestId: string) {
  const statusMap: Record<string, number> = {
    INVALID_REQUEST: 400, INVALID_DOMAIN: 400, INVALID_INSTALLATION_ID: 400,
    UNAUTHENTICATED: 401, LICENSE_NOT_FOUND: 404, PRODUCT_UNAVAILABLE: 404,
    LICENSE_PENDING: 409, LICENSE_EXPIRED: 409, LICENSE_SUSPENDED: 409, LICENSE_REVOKED: 409,
    ACTIVATION_LIMIT_REACHED: 409, ACTIVATION_NOT_FOUND: 404, RATE_LIMITED: 429,
  };
  const status = statusMap[code] ?? 500;
  return NextResponse.json({ data: null, error: { code, message: status === 500 ? "Internal server error" : code.replaceAll("_", " ") }, request_id: requestId }, { status });
}

export async function parsePublicLicenseRequest(request: Request, requestId: string) {
  const parsed = publicLicenseRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) { return { response: apiError("INVALID_REQUEST", requestId) } as const; }
  return { value: { productPublicId: parsed.data.product_public_id, licenseKey: parsed.data.license_key, installationId: parsed.data.installation_id, domain: parsed.data.domain } } as const;
}
