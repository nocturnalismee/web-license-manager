import { describe, expect, it } from "vitest";
import { readBoundedText, verifyMayarWebhook } from "./mayar-adapter";

describe("mayar webhook hardening", () => {
  it("fails closed when secret is missing", () => {
    expect(verifyMayarWebhook("body", "sig", undefined)).toBe(false);
    expect(verifyMayarWebhook("body", null, undefined)).toBe(false);
  });

  it("rejects oversized bodies", async () => {
    const big = "x".repeat(65537);
    const req = new Request("http://localhost/", { method: "POST", body: big });
    await expect(readBoundedText(req, 65536)).rejects.toThrow("PAYLOAD_TOO_LARGE");
  });

  it("reads small bodies intact", async () => {
    const req = new Request("http://localhost/", { method: "POST", body: '{"a":1}' });
    await expect(readBoundedText(req, 65536)).resolves.toBe('{"a":1}');
  });
});
