import crypto from "node:crypto";

export type CreateMayarInvoiceInput = {
  name: string;
  email: string;
  mobile: string;
  amount: number;
  description: string;
  redirectUrl: string;
  expiredAt: Date;
};

export type MayarInvoice = { id: string; transactionId: string; link: string };

export interface BillingProvider {
  createInvoice(input: CreateMayarInvoiceInput): Promise<MayarInvoice>;
}

export class MayarClient implements BillingProvider {
  constructor(private readonly apiKey: string, private readonly baseUrl = "https://api.mayar.id") {}

  async createInvoice(input: CreateMayarInvoiceInput): Promise<MayarInvoice> {
    const response = await fetch(`${this.baseUrl}/hl/v1/invoice/create`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, expiredAt: input.expiredAt.toISOString() }),
    });
    if (!response.ok) throw new Error(`MAYAR_REQUEST_FAILED_${response.status}`);
    const body = await response.json() as { data?: { id?: string; transactionId?: string; transaction_id?: string; link?: string } };
    const data = body.data;
    if (!data?.id || !(data.transactionId ?? data.transaction_id) || !data.link) throw new Error("INVALID_MAYAR_RESPONSE");
    return { id: data.id, transactionId: data.transactionId ?? data.transaction_id!, link: data.link };
  }
}

export function verifyMayarWebhook(rawBody: string, signature: string | null, secret: string | undefined) {
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!signature) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (digest.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export function getMayarClient() {
  const apiKey = process.env.MAYAR_API_KEY;
  if (!apiKey) throw new Error("MAYAR_API_KEY is not configured");
  return new MayarClient(apiKey, process.env.MAYAR_API_BASE_URL ?? "https://api.mayar.id");
}
