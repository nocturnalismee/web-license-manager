import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <div className="eyebrow">IndoLicense</div>
      <h1>License infrastructure for software vendors.</h1>
      <p>
        Foundation project is ready. The next vertical slice is Supabase configuration,
        database migration, authentication, and organization tenancy.
      </p>
      <section className="card">
        <div className="status">Development foundation active</div>
        <p>Next.js · Drizzle ORM · Supabase PostgreSQL</p>
        <Link href="/auth/sign-up">Create an account →</Link> <span> · </span><Link href="/auth/sign-in">Sign in</Link>
      </section>
    </main>
  );
}
