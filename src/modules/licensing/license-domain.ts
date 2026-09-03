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

export function normalizeDomain(domain: string): string {
  const value = domain.trim().toLowerCase().replace(/\.$/, "");
  if (!value || value.length > 253 || value.includes("/") || value.includes("@") || value.includes(" ")) {
    throw new Error("INVALID_DOMAIN");
  }
  const labels = value.split(".");
  if (labels.length < 2 || labels.some((label) => !label || label.length > 63 || !/^[a-z0-9-]+$/.test(label) || label.startsWith("-") || label.endsWith("-"))) {
    throw new Error("INVALID_DOMAIN");
  }
  return value;
}
