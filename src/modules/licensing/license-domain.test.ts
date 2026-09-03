import { describe, expect, it } from "vitest";
import { getEffectiveLicenseStatus, normalizeDomain } from "./license-domain";

const startsAt = new Date("2026-01-01T00:00:00Z");
const expiresAt = new Date("2027-01-01T00:00:00Z");

describe("license domain rules", () => {
  it("prioritizes terminal/admin states and derives expiry", () => {
    expect(getEffectiveLicenseStatus({ status: "revoked", startsAt, expiresAt })).toBe("revoked");
    expect(getEffectiveLicenseStatus({ status: "suspended", startsAt, expiresAt })).toBe("suspended");
    expect(getEffectiveLicenseStatus({ status: "active", startsAt, expiresAt, now: new Date("2027-01-01T00:00:00Z") })).toBe("expired");
    expect(getEffectiveLicenseStatus({ status: "active", startsAt, expiresAt, now: new Date("2026-06-01T00:00:00Z") })).toBe("active");
  });

  it("normalizes valid domains and rejects URLs/invalid labels", () => {
    expect(normalizeDomain("  Example.COM. ")).toBe("example.com");
    expect(() => normalizeDomain("https://example.com")).toThrow("INVALID_DOMAIN");
    expect(() => normalizeDomain("localhost")).toThrow("INVALID_DOMAIN");
    expect(() => normalizeDomain("bad_domain.com")).toThrow("INVALID_DOMAIN");
  });
});
