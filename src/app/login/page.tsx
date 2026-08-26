"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true, // create the auth user on first sign-in so no manual setup is needed
      },
    });
    setBusy(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setSent(true);
  };

  return (
    <main
      id="main"
      className="flex-1 flex items-center justify-center px-6 py-16"
    >
      <div
        className="w-full max-w-md rounded-2xl px-8 py-10"
        style={{
          background: "var(--bg-card)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--border-soft)",
        }}
      >
        <p
          className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-3"
          style={{ color: "var(--accent)" }}
        >
          Admin
        </p>

        {sent ? (
          <>
            <h1
              className="font-semibold mb-3"
              style={{
                color: "var(--navy)",
                fontSize: "26px",
                letterSpacing: "-0.01em",
              }}
            >
              Check your email
            </h1>
            <p className="text-[15px]" style={{ color: "var(--text-mid)" }}>
              We just sent a sign-in link to <strong>{email}</strong>. Open it
              on this device and it&apos;ll finish signing you in.
            </p>
            <button
              type="button"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="mt-6 text-sm font-medium underline"
              style={{ color: "var(--accent)" }}
            >
              Use a different email
            </button>
          </>
        ) : (
          <>
            <h1
              className="font-semibold mb-2"
              style={{
                color: "var(--navy)",
                fontSize: "26px",
                letterSpacing: "-0.01em",
              }}
            >
              Sign in
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              We&apos;ll email you a one-click sign-in link. No password
              needed.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-mid)" }}
                >
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  className="rounded-lg px-4 py-3 text-base border-2 focus:outline-none"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-soft)",
                    color: "var(--text)",
                  }}
                />
              </label>

              {error && (
                <p className="text-sm" style={{ color: "#c67b5c" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || !email}
                className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-medium text-base transition-transform hover:-translate-y-[1px]"
                style={{
                  background: "var(--navy)",
                  boxShadow: "0 4px 14px rgba(30,45,66,0.18)",
                  opacity: busy || !email ? 0.6 : 1,
                  cursor: busy || !email ? "not-allowed" : "pointer",
                }}
              >
                {busy ? "Sending link…" : "Send me a sign-in link →"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
