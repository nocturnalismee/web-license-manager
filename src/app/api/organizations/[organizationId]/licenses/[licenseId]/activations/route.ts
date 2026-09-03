import { NextResponse } from "next/server";
import { requireOrganizationAccess } from "@/lib/organization-access";
import { listLicenseActivations } from "@/modules/licensing/license-management-service";

type Context = { params: Promise<{ organizationId: string; licenseId: string }> };
export async function GET(_request: Request, context: Context) {
  const requestId = crypto.randomUUID();
  try { const { organizationId, licenseId } = await context.params; await requireOrganizationAccess(organizationId, "resource:read"); return NextResponse.json({ data: await listLicenseActivations(organizationId, licenseId), error: null, request_id: requestId }); }
  catch (error) { const code = error instanceof Error ? error.message : "INTERNAL_ERROR"; return NextResponse.json({ data: null, error: { code }, request_id: requestId }, { status: code === "UNAUTHENTICATED" ? 401 : code === "FORBIDDEN" ? 403 : 500 }); }
}
