"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createTeam } from "@/lib/curve-queries";

export default function NewTeamPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState<{ code: string; passphrase: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await createTeam({ code, passphrase, name: name.trim() || undefined });
    setBusy(false);
    if (!res.ok) {
      const msg =
        res.error === "code_taken"
          ? "That team code is already in use. Try another."
          : res.error === "code_too_short"
            ? "The code needs to be at least three characters."
            : res.error === "passphrase_too_short"
              ? "The passphrase needs to be at least four characters."
              : res.error;
      setError(msg);
      return;
    }
    setCreated({ code: res.code, passphrase });
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <TopBar />
      <main id="main" className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
        {created ? (
          <div className="w-full max-w-md mx-auto rounded-2xl px-8 py-10" style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-soft)" }}>
            <p className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-3" style={{ color: "var(--accent)" }}>
              Team created
            </p>
            <h1 className="font-semibold mb-3" style={{ color: "var(--navy)", fontSize: "26px", letterSpacing: "-0.01em" }}>
              You&apos;re ready
            </h1>
            <div className="rounded-lg px-4 py-4 mb-4" style={{ background: "var(--bg-alt)", border: "1px solid var(--border-soft)" }}>
              <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
                Send everyone this link:
              </p>
              <p className="text-[15px] font-medium mb-3 break-all" style={{ color: "var(--navy)" }}>
                {typeof window !== "undefined" ? `${window.location.origin}/curve` : "/curve"}
              </p>
              <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
                Team code they type in:
              </p>
              <p className="text-[15px] font-semibold mb-3 tabular-nums" style={{ color: "var(--navy)" }}>
                {created.code}
              </p>
              <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>
                Passphrase (only you should have this):
              </p>
              <p className="text-[15px] font-semibold" style={{ color: "var(--navy)" }}>
                {created.passphrase}
              </p>
            </div>
            <p className="text-xs mb-6" style={{ color: "var(--text-muted)" }}>
              The team view unlocks once at least five people respond.
            </p>
            <button
              type="button"
              onClick={() => router.push(`/team/${created.code}`)}
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-medium text-base transition-transform hover:-translate-y-[1px]"
              style={{ background: "var(--navy)", boxShadow: "0 4px 14px rgba(30,45,66,0.18)" }}
            >
              Go to the team view →
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto rounded-2xl px-8 py-10" style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-soft)" }}>
            <p className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-3" style={{ color: "var(--accent)" }}>
              New team
            </p>
            <h1 className="font-semibold mb-2" style={{ color: "var(--navy)", fontSize: "26px", letterSpacing: "-0.01em" }}>
              Set up a team roll-up
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Give it a short code your team can type. Set a passphrase only you use to unlock the results.
            </p>

            <label className="flex flex-col gap-2 mb-4">
              <span className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--text-muted)" }}>
                Team code
              </span>
              <input
                type="text"
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. northops or acme-eng"
                required
                className="rounded-lg px-4 py-3 text-base border-2 focus:outline-none"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-soft)", color: "var(--text)" }}
              />
            </label>
            <label className="flex flex-col gap-2 mb-4">
              <span className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--text-muted)" }}>
                Passphrase
              </span>
              <input
                type="text"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Something you'll remember"
                required
                className="rounded-lg px-4 py-3 text-base border-2 focus:outline-none"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-soft)", color: "var(--text)" }}
              />
            </label>
            <label className="flex flex-col gap-2 mb-4">
              <span className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--text-muted)" }}>
                Team name (optional)
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ops team, All hands"
                className="rounded-lg px-4 py-3 text-base border-2 focus:outline-none"
                style={{ background: "var(--bg-card)", borderColor: "var(--border-soft)", color: "var(--text)" }}
              />
            </label>

            {error && (
              <p className="text-sm mb-3" style={{ color: "#c67b5c" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy || !code || !passphrase}
              className="mt-2 w-full inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-medium text-base transition-transform hover:-translate-y-[1px]"
              style={{ background: "var(--navy)", boxShadow: "0 4px 14px rgba(30,45,66,0.18)", opacity: busy || !code || !passphrase ? 0.6 : 1, cursor: busy || !code || !passphrase ? "not-allowed" : "pointer" }}
            >
              {busy ? "Creating…" : "Create team"}
            </button>
          </form>
        )}
      </main>
      <footer className="pt-6 pb-10 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-base font-semibold hover:underline"
          style={{ color: "var(--accent)" }}
        >
          <span aria-hidden="true">←</span>
          West Product Development LLC
        </Link>
      </footer>
    </div>
  );
}

function TopBar() {
  return (
    <header className="w-full px-6 py-4 border-b" style={{ borderColor: "var(--border-soft)" }}>
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
          style={{ color: "var(--accent)" }}
        >
          <span aria-hidden="true">←</span>
          West Product Development LLC
        </Link>
        <span className="text-[11px] tracking-[0.18em] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
          Create a team
        </span>
      </div>
    </header>
  );
}
