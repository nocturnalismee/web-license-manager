import { IndoLicenseError } from "./errors.js";

export { IndoLicenseError } from "./errors.js";
export type LicenseRequest = { productPublicId: string; licenseKey: string; installationId: string; domain: string };
export type TransportResponse = { status: number; body: Record<string, unknown>; retryAfterSeconds?: number };
export type Transport = (path: string, payload: Record<string, string>, timeoutMs: number) => Promise<TransportResponse>;

type CachedValue = { expiresAt: number; value: Record<string, unknown> };

export class IndoLicenseClient {
  private readonly cache = new Map<string, CachedValue>();

  constructor(
    private readonly baseUrl: string,
    private readonly options: { timeoutMs?: number; maxRetries?: number; validateCacheTtlMs?: number; fetch?: typeof fetch; transport?: Transport } = {},
  ) {
    if (!baseUrl.trim()) throw new TypeError("baseUrl cannot be empty");
    if ((options.timeoutMs ?? 5000) < 1 || (options.maxRetries ?? 2) < 0 || (options.validateCacheTtlMs ?? 30000) < 0) throw new TypeError("Invalid IndoLicense client configuration");
  }

  validate(input: LicenseRequest) { return this.call("/api/v1/licenses/validate", input, true); }
  activate(input: LicenseRequest) { return this.call("/api/v1/licenses/activate", input, false); }
  deactivate(input: LicenseRequest) { return this.call("/api/v1/licenses/deactivate", input, false); }

  private async call(path: string, input: LicenseRequest, cached: boolean): Promise<Record<string, unknown>> {
    const payload = this.payload(input);
    const cacheKey = JSON.stringify(payload);
    const ttl = this.options.validateCacheTtlMs ?? 30000;
    const existing = cached ? this.cache.get(cacheKey) : undefined;
    if (existing && existing.expiresAt > Date.now()) return existing.value;
    const value = await this.request(path, payload);
    if (cached && ttl > 0) this.cache.set(cacheKey, { expiresAt: Date.now() + ttl, value });
    return value;
  }

  private payload(input: LicenseRequest): Record<string, string> {
    const payload = { product_public_id: input.productPublicId, license_key: input.licenseKey, installation_id: input.installationId, domain: input.domain };
    if (Object.values(payload).some((value) => !value?.trim())) throw new TypeError("License request fields cannot be empty");
    return payload;
  }

  private async request(path: string, payload: Record<string, string>): Promise<Record<string, unknown>> {
    const maxRetries = this.options.maxRetries ?? 2;
    let attempt = 0;
    while (true) {
      let response: TransportResponse;
      try { response = this.options.transport ? await this.options.transport(path, payload, this.options.timeoutMs ?? 5000) : await this.fetchRequest(path, payload); }
      catch (error) {
        if (attempt++ < maxRetries) { await this.delay(attempt); continue; }
        throw new IndoLicenseError("IndoLicense network request failed", "NETWORK_ERROR");
      }
      const body = response.body;
      if (response.status >= 200 && response.status < 300 && body.data && typeof body.data === "object") return body.data as Record<string, unknown>;
      const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
      if (retryable && attempt++ < maxRetries) { await this.delay(attempt, response.retryAfterSeconds); continue; }
      const error = body.error && typeof body.error === "object" ? body.error as Record<string, unknown> : {};
      throw new IndoLicenseError(String(error.message ?? "IndoLicense request failed"), String(error.code ?? "REQUEST_FAILED"), response.status, typeof body.request_id === "string" ? body.request_id : undefined, response.retryAfterSeconds);
    }
  }

  private async fetchRequest(path: string, payload: Record<string, string>): Promise<TransportResponse> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.options.timeoutMs ?? 5000);
    try {
      const response = await (this.options.fetch ?? fetch)(`${this.baseUrl.replace(/\/$/, "")}${path}`, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload), signal: controller.signal });
      const body = await response.json().catch(() => ({})) as Record<string, unknown>;
      const retryHeader = response.headers.get("Retry-After");
      return { status: response.status, body, retryAfterSeconds: retryHeader && /^\d+$/.test(retryHeader) ? Number(retryHeader) : undefined };
    } finally { clearTimeout(timer); }
  }

  private delay(attempt: number, retryAfter?: number) { return new Promise<void>((resolve) => setTimeout(resolve, Math.min(5000, (retryAfter ?? 2 ** attempt) * 1000))); }
}
