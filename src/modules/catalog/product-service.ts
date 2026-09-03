import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { productLicensePlans, products } from "@/db/schema";

function slugify(value: string): string {
  return value.trim().toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
}

export async function listProducts(organizationId: string) {
  return getDb().select().from(products).where(eq(products.organizationId, organizationId));
}

export async function createProduct(organizationId: string, name: string, description?: string) {
  const normalizedName = name.trim();
  const slug = slugify(normalizedName);
  if (normalizedName.length < 2 || !slug) throw new Error("INVALID_PRODUCT_NAME");
  const publicId = `prod_${crypto.randomUUID().replaceAll("-", "").slice(0, 24)}`;
  const [product] = await getDb().insert(products).values({
    organizationId, name: normalizedName, slug, publicId, description: description?.trim() || null,
  }).returning();
  return product;
}

export async function getProduct(organizationId: string, productId: string) {
  const [product] = await getDb().select().from(products).where(and(
    eq(products.organizationId, organizationId), eq(products.id, productId),
  )).limit(1);
  return product ?? null;
}

export async function listProductPlans(organizationId: string, productId: string) {
  return getDb().select().from(productLicensePlans).where(and(
    eq(productLicensePlans.organizationId, organizationId), eq(productLicensePlans.productId, productId),
  ));
}

export async function createProductPlan(input: {
  organizationId: string; productId: string; name: string; priceIdr: number;
  billingInterval?: string; activationLimit: number; durationDays: number; features?: string[];
}) {
  const product = await getProduct(input.organizationId, input.productId);
  if (!product) throw new Error("PRODUCT_NOT_FOUND");
  const name = input.name.trim();
  if (name.length < 2 || input.priceIdr < 0 || input.activationLimit < 1 || input.durationDays < 1) {
    throw new Error("INVALID_PRODUCT_PLAN");
  }
  const [plan] = await getDb().insert(productLicensePlans).values({
    organizationId: input.organizationId, productId: input.productId, name,
    priceIdr: input.priceIdr, billingInterval: input.billingInterval ?? "one_time",
    activationLimit: input.activationLimit, durationDays: input.durationDays,
    features: JSON.stringify(input.features ?? []),
  }).returning();
  return plan;
}
