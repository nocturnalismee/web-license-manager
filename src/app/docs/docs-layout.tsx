import Link from "next/link";
import ThemeToggle from "../theme-toggle";
import { docsGroups, docsPages } from "./docs-content";

export default function DocsLayout({ children, currentSlug }: { children: React.ReactNode; currentSlug?: string }) {
  return (
    <main className="docs-shell">
      <header className="docs-topbar">
        <Link className="brand" href="/"><span className="brand-mark">›_</span><span>IndoLicense</span></Link>
        <span className="docs-wordmark">/ docs</span>
        <div className="docs-top-actions"><ThemeToggle /><Link href="/">Back to home</Link><Link className="button button-small" href="/auth/sign-up">Get started</Link></div>
      </header>
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <div className="docs-sidebar-title">Documentation</div>
          {docsGroups.map((group) => <div className="docs-nav-group" key={group}><span>{group}</span>{docsPages.filter((page) => page.group === group).map((page) => <Link className={page.slug === currentSlug ? "active" : ""} href={`/docs/${page.slug}`} key={page.slug}>{page.title}</Link>)}</div>)}
        </aside>
        <article className="docs-content">{children}</article>
      </div>
    </main>
  );
}
