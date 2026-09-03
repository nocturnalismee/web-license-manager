import type { Metadata } from "next";
import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export const metadata: Metadata = {
  title: "Software License Management Platform for SaaS & Developers",
  description: "IndoLicense is a secure software license management platform for issuing license keys, controlling activations, and managing entitlements through a developer-first API.",
  keywords: ["software license management", "license key management", "SaaS licensing", "software activation API", "IndoLicense"],
  alternates: { canonical: "/" },
  openGraph: { title: "IndoLicense — License your software. Keep control.", description: "Issue secure license keys, control activations, and manage software entitlements from one developer-first platform.", type: "website", url: "/" },
  twitter: { card: "summary_large_image", title: "IndoLicense — Software licensing infrastructure", description: "Secure license keys and activation management for software teams." },
};

const features = [
  { index: "01", title: "Issue with confidence", body: "Create signed, hashed licenses for every product and plan without exposing secrets in your database." },
  { index: "02", title: "Control every activation", body: "Validate installations, enforce activation limits, and revoke access from one tenant-scoped workspace." },
  { index: "03", title: "Ship a clean API", body: "Give your customers a predictable REST API and lightweight SDKs that fit directly into their product." },
];

const pricingPlans = [
  { name: "Free", price: "Rp 0", description: "Try licensing with your first product.", limits: ["1 product", "100 licenses", "100 activations", "10.000 API validations"], featured: false, action: "Use free plan", href: "/auth/sign-up" },
  { name: "Starter", price: "Rp 99.000", description: "For software teams starting to grow.", limits: ["3 products", "1.000 licenses", "1.000 activations", "100.000 API validations"], featured: false, action: "Try Starter", href: "/auth/sign-up" },
  { name: "Pro", price: "Rp 299.000", description: "For businesses with an active customer base.", limits: ["20 products", "10.000 licenses", "10.000 activations", "1.000.000 API validations"], featured: true, action: "Start with Pro", href: "/auth/sign-up" },
  { name: "Agency", price: "Rp 799.000", description: "For agencies and large product portfolios.", limits: ["100 products", "100.000 licenses", "100.000 activations", "5.000.000 API validations"], featured: false, action: "Talk to sales", href: "mailto:hello@indolicense.dev" },
];

const faqs = [
  { question: "Does the 7-day trial require a payment card?", answer: "No. You can try IndoLicense for 7 days without entering payment details. When the trial ends, the subscription expires and protected API access pauses until you choose a paid plan." },
  { question: "How are IndoLicense license keys secured?", answer: "License keys are generated with a secure random generator. IndoLicense stores only a hash and key prefix, so the plaintext key cannot be recovered from the dashboard or database." },
  { question: "Can I use IndoLicense for desktop apps and SaaS?", answer: "Yes. The public API supports license validation, installation activation, and deactivation for desktop apps, web apps, plugins, APIs, and distributed software." },
  { question: "Are SDKs available for integration?", answer: "Yes. IndoLicense provides reference SDKs for JavaScript and PHP, plus a REST API that can be used with any programming language." },
  { question: "What happens when an activation limit is reached?", answer: "A new activation request is rejected with a clear error. Your customer can deactivate an old installation from your system or dashboard before activating a new device." },
  { question: "Can I upgrade or downgrade my plan?", answer: "Yes. Upgrades can take effect after successful payment, while downgrades are scheduled for the end of the current period so existing entitlements remain consistent." },
  { question: "Is each organization’s data isolated?", answer: "Yes. Every organization has its own tenant context, and access is verified server-side through membership and role checks so other organizations’ resources remain inaccessible." },
];

export default function HomePage() {
  const structuredData = [
    { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "IndoLicense", applicationCategory: "BusinessApplication", operatingSystem: "Web", description: "Software license management and activation API for software vendors.", offers: pricingPlans.map((plan) => ({ "@type": "Offer", name: plan.name, price: plan.price.replace(/[^0-9]/g, "") || "0", priceCurrency: "IDR", url: "https://indolicense.dev/#pricing" })) },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })) },
  ];
  return (
    <main className="landing-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <nav className="landing-nav" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="IndoLicense home"><span className="brand-mark">›_</span><span>IndoLicense</span></Link>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-actions"><ThemeToggle /><Link href="/auth/sign-in">Sign in</Link><Link className="button button-small" href="/auth/sign-up">Get started</Link></div>
      </nav>

      <section className="landing-hero" id="main-content">
        <div className="hero-copy">
          <div className="terminal-label"><span>~/</span>license-infrastructure</div>
          <h1>License your software.<br /><em>Keep control.</em></h1>
          <p>Ship licensing that feels native to your product. Issue keys, protect activations, and manage entitlements through one developer-first platform.</p>
          <div className="hero-actions"><Link className="button" href="/auth/sign-up">Start your 7-day trial <span>→</span></Link><a className="button button-ghost" href="#how-it-works">See how it works <span>↓</span></a></div>
          <div className="hero-note"><span className="pulse-dot" /> No credit card required · Built for Indonesian software teams</div>
        </div>
        <div className="code-window" aria-label="Example IndoLicense API request">
          <div className="window-bar"><span className="window-dots"><i /><i /><i /></span><span>validate-license.sh</span><span className="window-status">● live</span></div>
          <pre><code><span className="code-muted"># verify an installation</span>{"\n"}<span className="code-pink">curl</span> -X POST <span className="code-green">https://api.indolicense.dev/v1/licenses/validate</span> \{"\n"}  -H <span className="code-yellow">&quot;Authorization: Bearer $LICENSE_KEY&quot;</span> \{"\n"}  -H <span className="code-yellow">&quot;Content-Type: application/json&quot;</span> \{"\n"}  -d <span className="code-yellow">&apos;{`{`}</span>{"\n"}    <span className="code-blue">&quot;product_public_id&quot;</span>: <span className="code-yellow">&quot;prod_9x2k...&quot;</span>,{"\n"}    <span className="code-blue">&quot;installation_id&quot;</span>: <span className="code-yellow">&quot;desktop-01&quot;</span>{"\n"}  <span className="code-yellow">{`}`}&apos;</span></code></pre>
          <div className="code-response"><span className="code-green">200</span> · license valid <span className="response-check">✓</span></div>
        </div>
      </section>

      <section className="trust-line"><span>FOR TEAMS THAT SHIP</span><span className="trust-rule" /><span>DESKTOP · WEB · API · PLUGINS</span></section>

      <section className="section-block" id="how-it-works"><div className="terminal-label"><span>~/</span><strong>how</strong></div><div className="section-heading"><h2>From first key to<br />protected product.</h2><p>Three primitives. One clear workflow. IndoLicense handles the infrastructure so your team can focus on building the software customers love.</p></div><div className="steps-grid"><div><span>01</span><h3>Create a product</h3><p>Define plans, entitlements, activation limits, and duration from your workspace.</p></div><div><span>02</span><h3>Issue a license</h3><p>Generate a secure key for every customer. Only the key prefix and hash are persisted.</p></div><div><span>03</span><h3>Protect your app</h3><p>Validate and activate installations through a stable API with rate limits built in.</p></div></div></section>

      <section className="section-block" id="features"><div className="terminal-label"><span>~/</span><strong>features</strong></div><div className="section-heading"><h2>The boring infrastructure<br /><em>done properly.</em></h2><p>Simple surfaces for your team. Strong guarantees for your customers.</p></div><div className="feature-grid">{features.map((feature) => <article key={feature.index}><span>{feature.index}</span><h3>{feature.title}</h3><p>{feature.body}</p><a href="#docs">Explore feature <span>↗</span></a></article>)}</div></section>

      <section className="pricing-section" id="pricing"><div className="terminal-label"><span>~/</span><strong>pricing</strong></div><div className="section-heading"><div><h2>Simple plans.<br /><em>Room to grow.</em></h2><p>All plans include a 7-day free trial. No credit card required. Upgrade or downgrade whenever your product changes.</p></div><span className="billing-note">IDR · MONTHLY</span></div><div className="pricing-grid">{pricingPlans.map((plan) => <article className={`pricing-card ${plan.featured ? "pricing-card-featured" : ""}`} key={plan.name}>{plan.featured && <span className="popular-tag">MOST POPULAR</span>}<span className="price-label">{plan.name.toUpperCase()}</span><div className="plan-price">{plan.price}<small>/month</small></div><p>{plan.description}</p><ul>{plan.limits.map((limit) => <li key={limit}><span>✓</span>{limit}</li>)}</ul><Link className={`button ${plan.featured ? "" : "button-ghost"}`} href={plan.href}>{plan.action} <span>→</span></Link></article>)}</div></section>

      <section className="faq-section" id="faq"><div className="terminal-label"><span>~/</span><strong>faq</strong></div><div className="section-heading"><h2>Questions before<br /><em>you ship?</em></h2><p>Clear answers for the decisions that matter when licensing becomes part of your product.</p></div><div className="faq-list">{faqs.map((faq, index) => <details key={faq.question} open={index === 0}><summary><span>{String(index + 1).padStart(2, "0")}</span>{faq.question}<b>+</b></summary><p>{faq.answer}</p></details>)}</div></section>

      <section className="final-cta" id="docs"><div className="terminal-label"><span>~/</span><strong>ready</strong></div><h2>Your software deserves<br /><em>a proper license layer.</em></h2><Link className="button" href="/auth/sign-up">Build with IndoLicense <span>→</span></Link></section>
      <footer className="landing-footer"><Link className="brand" href="/"><span className="brand-mark">›_</span><span>IndoLicense</span></Link><span>License infrastructure for software vendors.</span><span>© 2026 IndoLicense</span></footer>
    </main>
  );
}
