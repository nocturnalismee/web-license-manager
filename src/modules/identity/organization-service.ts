import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { organizationMembers, organizations } from "@/db/schema";
import { assertPermission } from "./policy";
import type { OrganizationRole } from "./types";

function slugify(value: string): string {
  return value.trim().toLowerCase()
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export async function listOrganizations(userId: string) {
  const db = getDb();
  return db.select({
    id: organizations.id,
    name: organizations.name,
    slug: organizations.slug,
    status: organizations.status,
    role: organizationMembers.role,
  }).from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(eq(organizationMembers.userId, userId));
}

export async function getMembership(userId: string, organizationId: string) {
  const db = getDb();
  const [membership] = await db.select({
    organizationId: organizationMembers.organizationId,
    role: organizationMembers.role,
    organizationName: organizations.name,
    organizationSlug: organizations.slug,
  }).from(organizationMembers)
    .innerJoin(organizations, eq(organizations.id, organizationMembers.organizationId))
    .where(and(
      eq(organizationMembers.userId, userId),
      eq(organizationMembers.organizationId, organizationId),
    )).limit(1);
  return membership ? { ...membership, role: membership.role as OrganizationRole } : null;
}

export async function createOrganization(userId: string, name: string) {
  const normalizedName = name.trim();
  const slug = slugify(normalizedName);
  if (normalizedName.length < 2 || !slug) throw new Error("INVALID_ORGANIZATION_NAME");

  const db = getDb();
  return db.transaction(async (tx) => {
    const [organization] = await tx.insert(organizations).values({ name: normalizedName, slug }).returning();
    await tx.insert(organizationMembers).values({ organizationId: organization.id, userId, role: "owner" });
    return { ...organization, role: "owner" as const };
  });
}

export function requirePermission(role: OrganizationRole, permission: Parameters<typeof assertPermission>[1]) {
  assertPermission(role, permission);
}
