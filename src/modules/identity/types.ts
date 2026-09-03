export const organizationRoles = ["owner", "admin", "developer", "viewer"] as const;
export type OrganizationRole = (typeof organizationRoles)[number];

export type Permission =
  | "organization:manage"
  | "team:manage"
  | "billing:manage"
  | "organization:delete"
  | "resource:read"
  | "resource:write"
  | "audit:read"
  | "activation:manage";

export const rolePermissions: Record<OrganizationRole, readonly Permission[]> = {
  owner: ["organization:manage", "team:manage", "billing:manage", "organization:delete", "resource:read", "resource:write", "audit:read"],
  admin: ["organization:manage", "team:manage", "resource:read", "resource:write", "audit:read", "billing:manage"],
  developer: ["resource:read", "resource:write", "audit:read"],
  viewer: ["resource:read", "activation:manage"],
};
