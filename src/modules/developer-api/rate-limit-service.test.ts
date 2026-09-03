import { describe, expect, it } from "vitest";
import { consumeRateLimit } from "./rate-limit-service";

describe.skip("PostgreSQL rate limit integration", () => {
  it("enforces a fixed window", async () => {
    const key = `test-${crypto.randomUUID()}`;
    expect((await consumeRateLimit(key, 2, 60)).allowed).toBe(true);
    expect((await consumeRateLimit(key, 2, 60)).allowed).toBe(true);
    expect((await consumeRateLimit(key, 2, 60)).allowed).toBe(false);
  });
});
