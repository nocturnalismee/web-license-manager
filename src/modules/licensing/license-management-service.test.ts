import { describe, expect, it } from "vitest";
import { escapeLikeWildcards } from "./license-management-service";

describe("license search escaping", () => {
  it("escapes %, _, and backslash", () => {
    expect(escapeLikeWildcards("100%_x\\y")).toBe("100\\%\\_x\\\\y");
  });
});
