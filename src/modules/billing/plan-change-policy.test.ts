import { describe, expect, it } from "vitest";
import { cancellationPolicy, classifyPlanChange, planChangePolicy } from "./plan-change-policy";

describe("plan change policy", () => {
  it("requires payment before an upgrade takes effect", () => {
    expect(planChangePolicy(classifyPlanChange(99000, 299000)).timing).toBe("after_payment");
  });
  it("schedules downgrade at period end", () => {
    expect(planChangePolicy(classifyPlanChange(299000, 99000)).entitlement).toBe("period_end");
  });
  it("keeps cancellation reversible until period end", () => {
    expect(cancellationPolicy()).toEqual({ timing: "period_end", access: "until_period_end", reversible: true });
  });
});
