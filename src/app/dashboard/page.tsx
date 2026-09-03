import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { listOrganizations } from "@/modules/identity/organization-service";

export default async function DashboardPage() {
  const session = await getCurrentUser();
  if (!session?.user) redirect("/api/auth/sign-in");
  const organizations = await listOrganizations(session.user.id);

  return (
    <main>
      <div className="eyebrow">IndoLicense Dashboard</div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Select an organization to manage products, licenses, and entitlements.</p>
      <section className="card">
        <h2>Your organizations</h2>
        {organizations.length === 0 ? <p>No organization yet. Create one through <code>POST /api/organizations</code>.</p> : (
          <ul>{organizations.map((organization) => <li key={organization.id}><Link href={`/dashboard/${organization.id}`}>{organization.name}</Link> — {organization.role}</li>)}</ul>
        )}
      </section>
    </main>
  );
}
