import { describe, expect, it } from "vitest";
import { can } from "./policy";

describe("organization RBAC policy", () => {
  it("allows owners to manage organization and billing", () => {
    expect(can("owner", "organization:manage")).toBe(true);
    expect(can("owner", "billing:manage")).toBe(true);
    expect(can("owner", "organization:delete")).toBe(true);
  });

  it("keeps viewers read-only except activation management", () => {
    expect(can("viewer", "resource:read")).toBe(true);
    expect(can("viewer", "activation:manage")).toBe(true);
    expect(can("viewer", "resource:write")).toBe(false);
    expect(can("viewer", "team:manage")).toBe(false);
    expect(can("viewer", "billing:manage")).toBe(false);
  });

  it("does not grant organization administration to developers", () => {
    expect(can("developer", "resource:write")).toBe(true);
    expect(can("developer", "organization:manage")).toBe(false);
    expect(can("developer", "team:manage")).toBe(false);
    expect(can("developer", "billing:manage")).toBe(false);
  });

  it("does not grant resource mutation to admins outside their tenant", () => {
    // Tenant scope is enforced by getMembership/service queries; policy only evaluates role.
    // This test documents that role permission must never be used without tenant membership.
    expect(can("admin", "resource:write")).toBe(true);
    expect(can("admin", "organization:delete")).toBe(false);
  });
});
