"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import FluencyTeamView from "@/components/FluencyTeamView";
import { getFluencyTeamView } from "@/lib/fluency-queries";
import type { FluencyTeamView as ViewData } from "@/types/fluency";

type PageProps = { params: Promise<{ code: string }> };

export default function FluencyTeamPage({ params }: PageProps) {
  const { code } = use(params);
  const [passphrase, setPassphrase] = useState("");
  const [view, setView] = useState<ViewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [probing, setProbing] = useState(true);

  // Demo teams are open on purpose — seeded data only.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getFluencyTeamView({ code, passphrase: "" });
        if (!cancelled && res.ok) setView(res.view);
      } finally {
        if (!cancelled) setProbing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await getFluencyTeamView({ code, passphrase });
      if (!res.ok) {
        setError(
          res.error === "unauthorized"
            ? "Wrong passphrase."
            : res.error === "not_found"
              ? `We couldn't find a team with the code "${code}".`
              : res.error
        );
        return;
      }
      setView(res.view);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="w-full px-6 py-4 border-b" style={{ borderColor: "var(--border-soft)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
            ← West Product Development LLC
          </Link>
          <span className="text-[11px] tracking-[0.18em] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
            Fluency · {code}
          </span>
        </div>
      </header>
      <main id="main" className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
        {!view && probing ? (
          <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
            Loading…
          </p>
        ) : !view ? (
          <form
            onSubmit={unlock}
            className="w-full max-w-md mx-auto rounded-2xl px-8 py-10"
            style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-soft)" }}
          >
            <p className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-3" style={{ color: "var(--accent)" }}>
              Team fluency view
            </p>
            <h1 className="font-semibold mb-3" style={{ color: "var(--navy)", fontSize: "26px" }}>
              {code}
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Enter the passphrase set when this team was created.
            </p>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-[15px] mb-4"
              style={{ background: "var(--bg-page)", border: "1px solid var(--border-soft)" }}
            />
            {error && (
              <p className="text-sm mb-4" style={{ color: "#b3261e" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-full font-medium text-[15px] disabled:opacity-60"
              style={{ background: "var(--navy)", color: "#f5f3ef" }}
            >
              {loading ? "Checking…" : "Open"}
            </button>
          </form>
        ) : (
          <FluencyTeamView view={view} />
        )}
      </main>
    </div>
  );
}
