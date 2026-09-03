import { describe, expect, it } from "vitest";
import { parsePlatformLimits } from "./entitlement-service";

describe("platform entitlement configuration", () => {
  it("accepts non-negative integer limits", () => {
    expect(parsePlatformLimits('{"products":1,"licenses":100}')).toEqual({ products: 1, licenses: 100 });
  });
  it("rejects malformed or negative limits", () => {
    expect(() => parsePlatformLimits('{"products":-1}')).toThrow("INVALID_PLATFORM_LIMITS");
    expect(() => parsePlatformLimits("[]")).toThrow("INVALID_PLATFORM_LIMITS");
  });
});
