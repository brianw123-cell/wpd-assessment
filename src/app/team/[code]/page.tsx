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
  const [showPass, setShowPass] = useState(false);
  const [view, setView] = useState<TeamViewData | null>(null);
  const [benchmark, setBenchmark] = useState<{ total: number; stages: Record<string, number> } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [roundDialog, setRoundDialog] = useState<
    | { kind: "confirm"; latestNumber: number; nextNumber: number }
    | { kind: "error"; message: string }
    | { kind: "busy" }
    | null
  >(null);

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
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  autoFocus
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  required
                  className="w-full rounded-lg px-4 py-3 pr-16 text-base border-2 focus:outline-none"
                  style={{ background: "var(--bg-card)", borderColor: "var(--border-soft)", color: "var(--text)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide passphrase" : "Show passphrase"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium px-3 py-1 rounded-md"
                  style={{ color: "var(--accent)", background: "transparent" }}
                >
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
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
              onOpenRound={() => {
                const latest = view.rounds[view.rounds.length - 1];
                const latestResponses = latest ? latest.response_count : 0;
                if (latestResponses === 0) {
                  setRoundDialog({
                    kind: "error",
                    message:
                      "Round " + (latest?.round_number ?? 1) + " has zero responses. Opening another empty round would push this one out of view. Ask the team to respond first, then open a new round for the retake.",
                  });
                  return;
                }
                setRoundDialog({
                  kind: "confirm",
                  latestNumber: latest!.round_number,
                  nextNumber: (latest?.round_number ?? 0) + 1,
                });
              }}
            />
            <TeamView view={view} benchmark={benchmark ?? undefined} />
            {roundDialog && (
              <Modal onClose={() => setRoundDialog(null)}>
                {roundDialog.kind === "confirm" && (
                  <>
                    <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--navy)" }}>
                      Open round {roundDialog.nextNumber}?
                    </h2>
                    <p className="text-[15px] mb-6" style={{ color: "var(--text-mid)" }}>
                      This closes round {roundDialog.latestNumber} (still visible via the round picker). Any new{" "}
                      <code className="text-[13px]" style={{ background: "var(--bg-alt)", padding: "1px 6px", borderRadius: 4 }}>
                        /curve
                      </code>{" "}
                      responses with team code <strong>{code}</strong> will go into round {roundDialog.nextNumber} so you can
                      compare movement.
                    </p>
                    <div className="flex gap-3 justify-end">
                      <button
                        type="button"
                        onClick={() => setRoundDialog(null)}
                        className="px-5 py-2.5 rounded-full text-sm font-medium border"
                        style={{ borderColor: "var(--border-soft)", color: "var(--text-mid)", background: "var(--bg-card)" }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          setRoundDialog({ kind: "busy" });
                          const res = await openNewRound({ code, passphrase });
                          if (!res.ok) {
                            setRoundDialog({ kind: "error", message: "Couldn't open a new round: " + res.error });
                            return;
                          }
                          const refreshed = await getTeamView({ code, passphrase });
                          if (refreshed.ok) setView(refreshed.view);
                          setRoundDialog(null);
                        }}
                        className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                        style={{ background: "var(--navy)", boxShadow: "0 4px 14px rgba(30,45,66,0.18)" }}
                      >
                        Open round {roundDialog.nextNumber}
                      </button>
                    </div>
                  </>
                )}
                {roundDialog.kind === "error" && (
                  <>
                    <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--navy)" }}>
                      Can&apos;t open a new round yet
                    </h2>
                    <p className="text-[15px] mb-6" style={{ color: "var(--text-mid)" }}>
                      {roundDialog.message}
                    </p>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setRoundDialog(null)}
                        className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                        style={{ background: "var(--navy)" }}
                      >
                        OK
                      </button>
                    </div>
                  </>
                )}
                {roundDialog.kind === "busy" && (
                  <p className="text-[15px]" style={{ color: "var(--text-mid)" }}>
                    Opening round…
                  </p>
                )}
              </Modal>
            )}
          </div>
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

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: "rgba(30,45,66,0.55)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl px-7 py-7"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-soft)", boxShadow: "var(--shadow-card)" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
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
