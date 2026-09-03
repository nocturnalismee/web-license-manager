import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { environment: "node", include: ["sdk/javascript/tests/**/*.test.ts"] },
});
