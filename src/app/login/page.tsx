"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <main id="main" className="flex-1 flex items-center justify-center px-6 py-16">
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
        <h1
          className="font-semibold mb-6"
          style={{ color: "var(--navy)", fontSize: "26px", letterSpacing: "-0.01em" }}
        >
          Sign in
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--text-mid)" }}>
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-lg px-4 py-3 text-base border-2 focus:outline-none"
              style={{
                background: "var(--bg-card)",
                borderColor: "var(--border-soft)",
                color: "var(--text)",
              }}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--text-mid)" }}>
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
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
            disabled={busy}
            className="mt-2 inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-medium text-base transition-transform hover:-translate-y-[1px]"
            style={{
              background: "var(--navy)",
              boxShadow: "0 4px 14px rgba(30,45,66,0.18)",
              opacity: busy ? 0.6 : 1,
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
