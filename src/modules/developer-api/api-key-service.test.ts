import { describe, expect, it } from "vitest";

describe("verifyVendorApiKey contract", () => {
  it("is exported and rejects empty secrets", async () => {
    const mod = await import("./api-key-service");
    await expect(mod.verifyVendorApiKey("")).rejects.toThrow("UNAUTHENTICATED");
  });
});
