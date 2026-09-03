import { describe, expect, it } from "vitest";
import { beginGracePeriod, startTrial, transitionSubscription } from "./subscription-policy";

describe("subscription policy", () => {
  it("starts a seven-day trial without payment details", () => {
    const start = new Date("2026-01-01T00:00:00.000Z");
    expect(startTrial(start).trialEndsAt.toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });
  it("expires a trial and suspends after grace", () => {
    const now = new Date("2026-01-10T00:00:00.000Z");
    expect(transitionSubscription({ status: "trialing", now, trialEndsAt: new Date("2026-01-08") })).toBe("expired");
    expect(transitionSubscription({ status: "past_due", now, graceEndsAt: new Date("2026-01-09") })).toBe("suspended");
  });
  it("gives seven days grace after payment failure", () => {
    expect(beginGracePeriod(new Date("2026-01-01")).graceEndsAt.toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });
});
