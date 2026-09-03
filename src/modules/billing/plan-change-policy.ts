export type PlanChange = "upgrade" | "downgrade" | "same";

export function classifyPlanChange(currentPrice: number, targetPrice: number): PlanChange {
  if (targetPrice > currentPrice) return "upgrade";
  if (targetPrice < currentPrice) return "downgrade";
  return "same";
}

export function planChangePolicy(change: PlanChange) {
  if (change === "upgrade") return { timing: "after_payment" as const, proration: "none" as const, entitlement: "after_payment" as const };
  if (change === "downgrade") return { timing: "period_end" as const, proration: "none" as const, entitlement: "period_end" as const };
  return { timing: "none" as const, proration: "none" as const, entitlement: "unchanged" as const };
}

export function cancellationPolicy() {
  return { timing: "period_end" as const, access: "until_period_end" as const, reversible: true };
}
