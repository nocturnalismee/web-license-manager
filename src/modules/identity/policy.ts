import { rolePermissions, type OrganizationRole, type Permission } from "./types";

export function can(role: OrganizationRole, permission: Permission): boolean {
  return rolePermissions[role].includes(permission);
}

export function assertPermission(role: OrganizationRole, permission: Permission): void {
  if (!can(role, permission)) {
    throw new Error("FORBIDDEN");
  }
}
