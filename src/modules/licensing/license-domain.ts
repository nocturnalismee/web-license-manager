export type LicenseStatus = "pending" | "active" | "expired" | "suspended" | "revoked";

export type EffectiveLicenseStatus = Exclude<LicenseStatus, "pending"> | "pending";

export function getEffectiveLicenseStatus(input: {
  status: string;
  startsAt: Date;
  expiresAt: Date;
  now?: Date;
}): EffectiveLicenseStatus {
  const now = input.now ?? new Date();
  if (input.status === "revoked") return "revoked";
  if (input.status === "suspended") return "suspended";
  if (input.status === "pending") return "pending";
  if (now < input.startsAt) return "pending";
  if (now >= input.expiresAt) return "expired";
  return "active";
}

import { toASCII } from "node:punycode";

export function normalizeDomain(domain: string): string {
  const raw = domain.trim().toLowerCase().replace(/\.$/, "");
  if (!raw || raw.length > 253 || raw.includes("/") || raw.includes("@") || raw.includes(" ")) {
    throw new Error("INVALID_DOMAIN");
  }
  let value = raw;
  try {
    value = toASCII(raw);
  } catch {
    throw new Error("INVALID_DOMAIN");
  }
  const labels = value.split(".");
  if (labels.length < 2 || labels.some((label) => !label || label.length > 63 || !/^[a-z0-9-]+$/.test(label) || label.startsWith("-") || label.endsWith("-"))) {
    throw new Error("INVALID_DOMAIN");
  }
  return value;
}
