import { createHash, randomBytes } from "node:crypto";

const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateLicenseKey(): { plaintext: string; prefix: string; hash: string } {
  const bytes = randomBytes(20);
  let value = "";
  for (const byte of bytes) value += KEY_ALPHABET[byte % KEY_ALPHABET.length];
  const plaintext = `LCS-${value.slice(0, 5)}-${value.slice(5, 10)}-${value.slice(10, 15)}-${value.slice(15)}`;
  return { plaintext, prefix: plaintext.slice(0, 9), hash: hashLicenseKey(plaintext) };
}

export function hashLicenseKey(key: string): string {
  return createHash("sha256").update(key.trim().toUpperCase(), "utf8").digest("hex");
}
