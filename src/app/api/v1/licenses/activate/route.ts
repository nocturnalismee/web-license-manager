import { NextResponse } from "next/server";
import { activateLicense } from "@/modules/licensing/public-license-service";
import { apiError, parsePublicLicenseRequest } from "@/app/api/v1/licenses/_shared";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const parsed = await parsePublicLicenseRequest(request, requestId);
  if ("response" in parsed) return parsed.response;
  try { return NextResponse.json({ data: await activateLicense(parsed.value), error: null, request_id: requestId }); }
  catch (error) { return apiError(error instanceof Error ? error.message : "INTERNAL_ERROR", requestId); }
}
