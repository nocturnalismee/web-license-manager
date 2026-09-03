import type { Metadata } from "next";
import Link from "next/link";
import DocsLayout from "./docs-layout";
import { docsPages } from "./docs-content";

export const metadata: Metadata = { title: "Documentation", description: "IndoLicense API, SDK, rate limit, and integration documentation for software vendors." };

export default function DocsHome() {
  return <DocsLayout><div className="docs-kicker">~/indolicense/docs</div><h1>Build with<br /><em>confidence.</em></h1><p className="docs-lead">Everything you need to issue licenses, control activations, and protect your software with the IndoLicense API.</p><div className="docs-callout"><span>01</span><div><strong>Start with the Quickstart</strong><p>Create your first product, get a public ID, and make your first validation request.</p><Link href="/docs/quickstart">Read the Quickstart →</Link></div></div><div className="docs-index">{["Getting started", "License API", "Reference", "SDKs"].map((group) => <section key={group}><div className="docs-section-label">{group}</div>{docsPages.filter((page) => page.group === group).map((page) => <Link className="docs-index-row" href={`/docs/${page.slug}`} key={page.slug}><span>{page.title}</span><small>{page.description}</small><b>→</b></Link>)}</section>)}</div></DocsLayout>;
}
