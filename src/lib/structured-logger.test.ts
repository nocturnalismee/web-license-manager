import { describe, expect, it, vi } from "vitest";
import { logger } from "./structured-logger";

describe("log redaction", () => {
  it("redacts secret-bearing fields", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    logger.info("test_event", { license_key: "ILV1-SECRET", product: "prod_abc" } as never);
    const logged = String(spy.mock.calls[0]?.[0] ?? "");
    expect(logged).not.toContain("ILV1-SECRET");
    expect(logged).toContain("[redacted]");
    expect(logged).toContain("prod_abc");
    spy.mockRestore();
  });
});
