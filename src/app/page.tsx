import Link from "next/link";

const features = [
  { index: "01", title: "Issue with confidence", body: "Create signed, hashed licenses for every product and plan without exposing secrets in your database." },
  { index: "02", title: "Control every activation", body: "Validate installations, enforce activation limits, and revoke access from one tenant-scoped workspace." },
  { index: "03", title: "Ship a clean API", body: "Give your customers a predictable REST API and lightweight SDKs that fit directly into their product." },
];

const pricingPlans = [
  { name: "Free", price: "Rp 0", description: "Untuk mencoba licensing pada produk pertama.", limits: ["1 product", "100 licenses", "100 activations", "10.000 API validations"], featured: false },
  { name: "Starter", price: "Rp 99.000", description: "Untuk software team yang mulai bertumbuh.", limits: ["3 products", "1.000 licenses", "1.000 activations", "100.000 API validations"], featured: false },
  { name: "Pro", price: "Rp 299.000", description: "Untuk bisnis dengan banyak customer aktif.", limits: ["20 products", "10.000 licenses", "10.000 activations", "1.000.000 API validations"], featured: true },
  { name: "Agency", price: "Rp 799.000", description: "Untuk agency dan portfolio produk berskala besar.", limits: ["100 products", "100.000 licenses", "100.000 activations", "5.000.000 API validations"], featured: false },
];

export default function HomePage() {
  return (
    <main className="landing-shell">
      <nav className="landing-nav" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="IndoLicense home"><span className="brand-mark">›_</span><span>IndoLicense</span></Link>
        <div className="nav-links">
          <a href="#how-it-works">How it works</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#docs">Docs</a>
        </div>
        <div className="nav-actions"><Link href="/auth/sign-in">Sign in</Link><Link className="button button-small" href="/auth/sign-up">Get started</Link></div>
      </nav>

      <section className="landing-hero">
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

      <section className="pricing-section" id="pricing"><div className="terminal-label"><span>~/</span><strong>pricing</strong></div><div className="section-heading"><div><h2>Simple plans.<br /><em>Room to grow.</em></h2><p>All plans include a 7-day free trial. No credit card required. Upgrade or downgrade whenever your product changes.</p></div><span className="billing-note">IDR · MONTHLY</span></div><div className="pricing-grid">{pricingPlans.map((plan) => <article className={`pricing-card ${plan.featured ? "pricing-card-featured" : ""}`} key={plan.name}>{plan.featured && <span className="popular-tag">MOST POPULAR</span>}<span className="price-label">{plan.name.toUpperCase()}</span><div className="plan-price">{plan.price}<small>/bulan</small></div><p>{plan.description}</p><ul>{plan.limits.map((limit) => <li key={limit}><span>✓</span>{limit}</li>)}</ul><Link className={`button ${plan.featured ? "" : "button-ghost"}`} href="/auth/sign-up">Start free trial <span>→</span></Link></article>)}</div></section>

      <section className="final-cta" id="docs"><div className="terminal-label"><span>~/</span><strong>ready</strong></div><h2>Your software deserves<br /><em>a proper license layer.</em></h2><Link className="button" href="/auth/sign-up">Build with IndoLicense <span>→</span></Link></section>
      <footer className="landing-footer"><Link className="brand" href="/"><span className="brand-mark">›_</span><span>IndoLicense</span></Link><span>License infrastructure for software vendors.</span><span>© 2026 IndoLicense</span></footer>
    </main>
  );
}
