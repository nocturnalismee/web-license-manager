import { getCurrentUser } from "@/lib/current-user";
import { getMembership } from "@/modules/identity/organization-service";
import { can } from "@/modules/identity/policy";
import type { Permission } from "@/modules/identity/types";

export async function requireOrganizationAccess(organizationId: string, permission: Permission) {
  const session = await getCurrentUser();
  if (!session?.user) throw new Error("UNAUTHENTICATED");
  const membership = await getMembership(session.user.id, organizationId);
  if (!membership) throw new Error("FORBIDDEN");
  if (!can(membership.role, permission)) throw new Error("FORBIDDEN");
  return { user: session.user, membership };
}
