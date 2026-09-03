import { createHash, randomBytes } from "node:crypto";

export function generateApiKey() {
  const secret = randomBytes(32).toString("base64url");
  const plaintext = `sk_live_${secret}`;
  return { plaintext, prefix: plaintext.slice(0, 12), hash: hashApiKey(plaintext) };
}

export function hashApiKey(value: string) {
  return createHash("sha256").update(value.trim(), "utf8").digest("hex");
}
