export const TRIAL_DAYS = 7;
export const GRACE_DAYS = 7;

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "expired" | "suspended";

export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function startTrial(startedAt = new Date()) {
  return { status: "trialing" as const, trialStartedAt: startedAt, trialEndsAt: addDays(startedAt, TRIAL_DAYS) };
}

export function transitionSubscription(input: { status: SubscriptionStatus; now: Date; trialEndsAt?: Date | null; graceEndsAt?: Date | null }) {
  if (input.status === "trialing" && input.trialEndsAt && input.now >= input.trialEndsAt) return "expired" as const;
  if (input.status === "past_due" && input.graceEndsAt && input.now >= input.graceEndsAt) return "suspended" as const;
  return input.status;
}

export function beginGracePeriod(failedAt = new Date()) {
  return { status: "past_due" as const, graceEndsAt: addDays(failedAt, GRACE_DAYS) };
}
