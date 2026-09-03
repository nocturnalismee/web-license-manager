import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrganization, listOrganizations } from "@/modules/identity/organization-service";
import { getCurrentUser } from "@/lib/current-user";

const createOrganizationSchema = z.object({ name: z.string().trim().min(2).max(120) });

function requestId() { return crypto.randomUUID(); }

export async function GET() {
  const id = requestId();
  const session = await getCurrentUser();
  if (!session?.user) return NextResponse.json({ data: null, error: { code: "UNAUTHENTICATED", message: "Authentication required" }, request_id: id }, { status: 401 });
  const data = await listOrganizations(session.user.id);
  return NextResponse.json({ data, error: null, request_id: id });
}

export async function POST(request: Request) {
  const id = requestId();
  const session = await getCurrentUser();
  if (!session?.user) return NextResponse.json({ data: null, error: { code: "UNAUTHENTICATED", message: "Authentication required" }, request_id: id }, { status: 401 });

  const parsed = createOrganizationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ data: null, error: { code: "INVALID_REQUEST", message: "Organization name is invalid" }, request_id: id }, { status: 400 });

  try {
    const data = await createOrganization(session.user.id, parsed.data.name);
    return NextResponse.json({ data, error: null, request_id: id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ORGANIZATION_NAME") {
      return NextResponse.json({ data: null, error: { code: "INVALID_REQUEST", message: "Organization name is invalid" }, request_id: id }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes("organizations_slug_unique")) {
      return NextResponse.json({ data: null, error: { code: "CONFLICT", message: "Organization already exists" }, request_id: id }, { status: 409 });
    }
    throw error;
  }
}
