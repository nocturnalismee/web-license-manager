import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMembership } from "@/modules/identity/organization-service";
import { listProducts, listProductPlans } from "@/modules/catalog/product-service";
import { listManagedLicenses } from "@/modules/licensing/license-management-service";
import LicensePanel from "./license-panel";

export default async function LicensesPage({ params, searchParams }: { params: Promise<{ organizationId: string }>; searchParams: Promise<{ offset?: string; status?: string; productId?: string; search?: string }> }) {
  const session = await getCurrentUser(); if (!session?.user) redirect("/auth/sign-in");
  const { organizationId } = await params; const membership = await getMembership(session.user.id, organizationId); if (!membership) notFound();
  const query = await searchParams;
  const offset = Math.max(0, Number(query.offset ?? 0) || 0);
  const status = ["active", "suspended", "revoked", "expired"].includes(query.status ?? "") ? query.status : undefined;
  const productId = query.productId || undefined;
  const search = (query.search ?? "").trim().slice(0, 160) || undefined;
  const products = await listProducts(organizationId);
  const plans = (await Promise.all(products.map(async (product) => ({ product, plans: await listProductPlans(organizationId, product.id) })))).flatMap(({ product, plans: productPlans }) => productPlans.map((plan) => ({ ...plan, productName: product.name })));
  const licenses = await listManagedLicenses({ organizationId, limit: 20, offset, status, productId, search });
  return <main><div className="eyebrow">IndoLicense Licensing</div><h1>Licenses</h1><p>Generate and monitor customer licenses, activation usage, and expiration from one tenant-scoped dashboard.</p><LicensePanel organizationId={organizationId} products={products.map(({ id, name }) => ({ id, name }))} plans={plans.map(({ id, name, productId: pid, productName, durationDays, activationLimit }) => ({ id, name, productId: pid, productName, durationDays, activationLimit }))} initial={licenses} offset={offset} filters={{ status: status ?? "", productId: productId ?? "", search: search ?? "" }} /></main>;
}
