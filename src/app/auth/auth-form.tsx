"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignUp = mode === "sign-up";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch(`/api/auth/${isSignUp ? "sign-up" : "sign-in"}/email`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(isSignUp ? { name, email, password } : { email, password, callbackURL: "/dashboard" }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message ?? result.error?.message ?? "AUTHENTICATION_FAILED");
      window.location.assign("/dashboard");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "AUTHENTICATION_FAILED"); setBusy(false); }
  }

  return <main className="auth-main"><div className="eyebrow">IndoLicense</div><h1>{isSignUp ? "Create your account" : "Welcome back"}</h1><p>{isSignUp ? "Start managing software licenses with IndoLicense." : "Sign in to manage your organizations and licenses."}</p><form className="card auth-form" onSubmit={submit}>{isSignUp && <label>Name<input required minLength={2} maxLength={160} value={name} onChange={(event) => setName(event.target.value)} /></label>}<label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Password<input required type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <p className="error-message" role="alert">{error.replaceAll("_", " ")}</p>}<button disabled={busy}>{busy ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}</button><p className="auth-switch">{isSignUp ? "Already have an account?" : "New to IndoLicense?"} <Link href={isSignUp ? "/auth/sign-in" : "/auth/sign-up"}>{isSignUp ? "Sign in" : "Create an account"}</Link></p></form></main>;
}
