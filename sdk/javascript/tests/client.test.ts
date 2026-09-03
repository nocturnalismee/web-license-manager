import { describe, expect, it } from "vitest";
import { IndoLicenseClient, IndoLicenseError } from "../src/index";

describe("JavaScript SDK", () => {
  it("retries temporary failures and caches validate", async () => {
    let calls = 0;
    const client = new IndoLicenseClient("https://example.test", { transport: async () => { calls++; if (calls === 1) return { status: 503, body: {} }; return { status: 200, body: { data: { status: "active" } } }; } });
    await expect(client.validate({ productPublicId: "prod_123", licenseKey: "key", installationId: "install", domain: "example.com" })).resolves.toEqual({ status: "active" });
    await client.validate({ productPublicId: "prod_123", licenseKey: "key", installationId: "install", domain: "example.com" });
    expect(calls).toBe(2);
  });
  it("exposes structured API errors", async () => {
    const client = new IndoLicenseClient("https://example.test", { maxRetries: 0, transport: async () => ({ status: 409, body: { request_id: "req-1", error: { code: "LICENSE_EXPIRED", message: "expired" } } }) });
    await expect(client.activate({ productPublicId: "prod_123", licenseKey: "key", installationId: "install", domain: "example.com" })).rejects.toMatchObject<Partial<IndoLicenseError>>({ errorCode: "LICENSE_EXPIRED", requestId: "req-1", httpStatus: 409 });
  });
});
