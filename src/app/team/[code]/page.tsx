"use client";

import { use, useState } from "react";
import Link from "next/link";
import TeamView from "@/components/TeamView";
import { getBenchmarkDistribution, getTeamView, openNewRound } from "@/lib/curve-queries";
import type { TeamView as TeamViewData } from "@/types/curve";

type PageProps = { params: Promise<{ code: string }> };

export default function TeamViewPage({ params }: PageProps) {
  const { code } = use(params);
  const [passphrase, setPassphrase] = useState("");
  const [view, setView] = useState<TeamViewData | null>(null);
  const [benchmark, setBenchmark] = useState<{ total: number; stages: Record<string, number> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const [res, bench] = await Promise.all([
        getTeamView({ code, passphrase }),
        getBenchmarkDistribution(),
      ]);
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
      setBenchmark(bench);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <TopBar code={code} />
      <main id="main" className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
        {!view ? (
          <form onSubmit={handleUnlock} className="w-full max-w-md mx-auto rounded-2xl px-8 py-10" style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-soft)" }}>
            <p className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-3" style={{ color: "var(--accent)" }}>
              Team view
            </p>
            <h1 className="font-semibold mb-3" style={{ color: "var(--navy)", fontSize: "26px", letterSpacing: "-0.01em" }}>
              {code}
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Enter the passphrase set when this team was created.
            </p>
            <label className="flex flex-col gap-2 mb-4">
              <span className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--text-muted)" }}>
                Passphrase
              </span>
              <input
                type="password"
                autoFocus
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                required
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
              disabled={loading || !passphrase}
              className="mt-2 w-full inline-flex items-center justify-center px-6 py-3 rounded-full text-white font-medium text-base transition-transform hover:-translate-y-[1px]"
              style={{ background: "var(--navy)", boxShadow: "0 4px 14px rgba(30,45,66,0.18)", opacity: loading || !passphrase ? 0.6 : 1, cursor: loading || !passphrase ? "not-allowed" : "pointer" }}
            >
              {loading ? "Unlocking…" : "Unlock team view"}
            </button>
          </form>
        ) : (
          <div className="w-full">
            <OpenRoundBar
              view={view}
              onOpenRound={async () => {
                const latest = view.rounds[view.rounds.length - 1];
                const latestResponses = latest ? latest.response_count : 0;
                if (latestResponses === 0) {
                  alert(
                    "Round " + (latest?.round_number ?? 1) +
                    " has 0 responses. Opening another empty round would just push the current one out of view. Ask the team to respond first, then open a new round for the retake."
                  );
                  return;
                }
                const nextNumber = (latest?.round_number ?? 0) + 1;
                if (!confirm(
                  "Open round " + nextNumber + "? This closes round " + latest?.round_number +
                  " (which will still be visible), and any new /curve responses with team code \"" +
                  code + "\" will go into round " + nextNumber + " so you can compare movement."
                )) return;
                const res = await openNewRound({ code, passphrase });
                if (!res.ok) {
                  alert("Couldn't open a new round: " + res.error);
                  return;
                }
                const refreshed = await getTeamView({ code, passphrase });
                if (refreshed.ok) setView(refreshed.view);
              }}
            />
            <TeamView view={view} benchmark={benchmark ?? undefined} />
          </div>
        )}
      </main>
      <footer className="pt-4 pb-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        <Link href="/" className="hover:underline">
          ← West Product Development LLC
        </Link>
      </footer>
    </div>
  );
}

function OpenRoundBar({
  view,
  onOpenRound,
}: {
  view: TeamViewData;
  onOpenRound: () => void | Promise<void>;
}) {
  const latest = view.rounds[view.rounds.length - 1];
  const canOpen = !!latest && latest.response_count >= 5;
  return (
    <div className="max-w-5xl mx-auto mb-4 flex items-center justify-end gap-3">
      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
        {latest ? `Round ${latest.round_number} · ${latest.response_count} responses` : "No rounds"}
      </span>
      <button
        type="button"
        onClick={() => onOpenRound()}
        disabled={!canOpen}
        title={canOpen ? "Close this round and open the next one for retakes" : "Need at least 5 responses in this round before opening a new one"}
        className="text-xs font-medium px-4 py-2 rounded-full border"
        style={{
          borderColor: "var(--border-soft)",
          color: canOpen ? "var(--accent)" : "var(--text-muted)",
          background: "var(--bg-card)",
          opacity: canOpen ? 1 : 0.5,
          cursor: canOpen ? "pointer" : "not-allowed",
        }}
      >
        Open a retake round →
      </button>
    </div>
  );
}

function TopBar({ code }: { code: string }) {
  return (
    <header className="w-full px-6 py-4 border-b" style={{ borderColor: "var(--border-soft)" }}>
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-tight" style={{ color: "var(--navy)" }}>
          West Product Development LLC
        </Link>
        <span className="text-[11px] tracking-[0.18em] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
          Team · {code}
        </span>
      </div>
    </header>
  );
}
