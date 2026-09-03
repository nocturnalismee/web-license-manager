"use client";

import { useState } from "react";

type Overview = Awaited<ReturnType<typeof import("@/modules/billing/billing-overview-service").getBillingOverview>>;

export default function BillingPanel({ organizationId, user, overview }: { organizationId: string; user: { name: string; email: string }; overview: Overview }) {
  const [data, setData] = useState(overview);
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const currentPlanId = data.subscription?.platformPlanId;

  async function action(body: Record<string, unknown>) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/organizations/${organizationId}/billing/subscription`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.code ?? "REQUEST_FAILED");
      if (result.data?.checkoutUrl) window.location.href = result.data.checkoutUrl;
      else { setMessage("Perubahan subscription berhasil disimpan."); window.location.reload(); }
    } catch (error) { setMessage(error instanceof Error ? error.message.replaceAll("_", " ") : "Request failed"); }
    finally { setBusy(false); }
  }

  return <>
    <section className="card billing-card">
      <div className="billing-heading"><div><div className="eyebrow">Current subscription</div><h2>{data.subscription ? data.plans.find((plan) => plan.id === currentPlanId)?.name ?? "Platform plan" : "No active plan"}</h2></div><span className="badge">{data.subscription?.status ?? "not started"}</span></div>
      {data.subscription?.trialEndsAt && <p>Trial ends {new Date(data.subscription.trialEndsAt).toLocaleDateString("id-ID")}.</p>}
      {data.subscription?.graceEndsAt && <p className="warning">Payment issue: access remains available until {new Date(data.subscription.graceEndsAt).toLocaleDateString("id-ID")}.</p>}
      {data.subscription?.cancelAtPeriodEnd && <p className="warning">Cancellation is scheduled for the end of the current period.</p>}
      <div className="form-row"><label>Mobile for Mayar checkout<input value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="08123456789" /></label></div>
      <div className="plan-grid">{data.plans.map((plan) => <article className="plan" key={plan.id}><h3>{plan.name}</h3><strong>Rp {plan.priceIdr.toLocaleString("id-ID")}</strong><p>{plan.id === currentPlanId ? "Current plan" : "Change plan at checkout"}</p><button disabled={busy || plan.id === currentPlanId || mobile.length < 8} onClick={() => action({ action: "change_plan", targetPlanId: plan.id, name: user.name, email: user.email, mobile })}>{plan.id === currentPlanId ? "Selected" : "Choose plan"}</button></article>)}</div>
      <div className="actions"><button className="secondary" disabled={busy || !data.subscription || data.subscription.cancelAtPeriodEnd} onClick={() => action({ action: "cancel" })}>Cancel at period end</button><button className="secondary" disabled={busy || !data.subscription?.cancelAtPeriodEnd} onClick={() => action({ action: "resume" })}>Resume subscription</button></div>
      {message && <p role="status" className="status-message">{message}</p>}
    </section>
    <section className="card"><div className="eyebrow">Usage paywall</div><h2>Entitlement usage</h2>{data.usage.length === 0 ? <p>No entitlement data yet. Start a subscription to see usage.</p> : <div className="usage-list">{data.usage.map((item) => { const percentage = item.limitValue === 0 ? 100 : Math.min(100, Math.round(item.usedValue / item.limitValue * 100)); return <div key={item.feature}><div className="usage-label"><span>{item.feature}</span><span>{item.usedValue} / {item.limitValue}</span></div><div className="meter"><span className={percentage >= 100 ? "danger" : percentage >= 80 ? "warning-fill" : ""} style={{ width: `${percentage}%` }} /></div>{percentage >= 80 && <small className={percentage >= 100 ? "danger-text" : "warning-text"}>{percentage >= 100 ? "Limit reached: new usage is blocked." : "Approaching plan limit."}</small>}</div>})}</div>}</section>
  </>;
}
