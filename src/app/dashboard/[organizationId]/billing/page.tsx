import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { getMembership } from "@/modules/identity/organization-service";
import { getBillingOverview } from "@/modules/billing/billing-overview-service";
import BillingPanel from "./billing-panel";

export default async function BillingPage({ params }: { params: Promise<{ organizationId: string }> }) {
  const session = await getCurrentUser();
  if (!session?.user) redirect("/auth/sign-in");
  const { organizationId } = await params;
  const membership = await getMembership(session.user.id, organizationId);
  if (!membership) notFound();
  const overview = await getBillingOverview(organizationId);
  return <main><div className="eyebrow">IndoLicense Billing</div><h1>Plan & usage</h1><p>Manage your platform subscription and monitor entitlement usage before it affects your API.</p><BillingPanel organizationId={organizationId} user={{ name: session.user.name, email: session.user.email }} overview={overview} /></main>;
}
