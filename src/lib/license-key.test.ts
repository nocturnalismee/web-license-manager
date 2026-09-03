import { describe, expect, it } from "vitest";
import { generateLicenseKey, hashLicenseKey } from "./license-key";

describe("license key security", () => {
  it("generates a human-friendly high-entropy key and never exposes the hash as plaintext", () => {
    const key = generateLicenseKey();
    expect(key.plaintext).toMatch(/^LCS-[A-Z2-9]{5}(-[A-Z2-9]{5}){3}$/);
    expect(key.hash).toHaveLength(64);
    expect(key.hash).not.toContain(key.plaintext);
  });

  it("hashes keys canonically", () => {
    expect(hashLicenseKey(" lcs-ab234-cdefg-hijkl-mnopq ")).toBe(hashLicenseKey("LCS-AB234-CDEFG-HIJKL-MNOPQ"));
  });
});
