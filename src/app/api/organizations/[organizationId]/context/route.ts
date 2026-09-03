import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { getMembership } from "@/modules/identity/organization-service";

export async function GET(_request: Request, context: { params: Promise<{ organizationId: string }> }) {
  const requestId = crypto.randomUUID();
  const session = await getCurrentUser();
  if (!session?.user) return NextResponse.json({ data: null, error: { code: "UNAUTHENTICATED", message: "Authentication required" }, request_id: requestId }, { status: 401 });
  const { organizationId } = await context.params;
  const membership = await getMembership(session.user.id, organizationId);
  if (!membership) return NextResponse.json({ data: null, error: { code: "FORBIDDEN", message: "Organization access denied" }, request_id: requestId }, { status: 403 });
  return NextResponse.json({ data: membership, error: null, request_id: requestId });
}
