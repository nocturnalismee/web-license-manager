import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMembership } from "@/modules/identity/organization-service";

export default async function OrganizationDashboard({ params }: { params: Promise<{ organizationId: string }> }) {
  const session = await getCurrentUser();
  if (!session?.user) redirect("/auth/sign-in");
  const { organizationId } = await params;
  const membership = await getMembership(session.user.id, organizationId);
  if (!membership) notFound();

  return <main><div className="eyebrow">Organization</div><h1>{membership.organizationName}</h1><p>Role: <strong>{membership.role}</strong>. Tenant context is validated server-side.</p><section className="card"><p>Products, plans, licenses, activations, and billing.</p><Link href={`/dashboard/${organizationId}/billing`}>Open billing dashboard →</Link></section></main>;
}
