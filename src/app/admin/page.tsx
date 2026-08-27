"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { listSubmissions } from "@/lib/queries";
import { PROFILES } from "@/lib/scoring";
import AdminStats from "@/components/AdminStats";
import TeamsAdmin from "@/components/TeamsAdmin";
import { QUESTIONS } from "@/lib/questions";

type SortKey = "created_at" | "total_score" | "company" | "profile";

// Allowlist — only these email addresses can view admin data.
// Set via env var; falls back to Brian's known emails so this works out of the box.
const ADMIN_EMAILS = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS ??
  "westproductdev@gmail.com,brianw123@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

type Row = Awaited<ReturnType<typeof listSubmissions>>[number];

export default function AdminPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDesc, setSortDesc] = useState(true);
  const [tab, setTab] = useState<"submissions" | "teams">("submissions");
  const [detailRow, setDetailRow] = useState<Row | null>(null);

  // Auth gate — use getSession (reads localStorage synchronously) and also subscribe
  // to onAuthStateChange so we don't kick the user to /login during hydration races
  // right after a magic-link exchange.
  useEffect(() => {
    let cancelled = false;
    let redirectTimer: ReturnType<typeof setTimeout> | null = null;

    const proceedWithUser = async (userEmail: string | null | undefined) => {
      if (cancelled) return;
      const normalized = userEmail?.toLowerCase() ?? null;
      if (!normalized) {
        router.replace("/login");
        return;
      }
      if (!ADMIN_EMAILS.includes(normalized)) {
        setError(
          `Signed in as ${normalized}, but that address is not on the admin allowlist for this app.`
        );
        setLoading(false);
        return;
      }
      setEmail(normalized);
      try {
        const data = await listSubmissions();
        if (cancelled) return;
        setRows(data);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    };

    // 1. Check localStorage first
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session?.user) {
        proceedWithUser(data.session.user.email);
      } else {
        // No session yet — wait briefly for SIGNED_IN, then give up and bounce to /login
        redirectTimer = setTimeout(() => {
          if (cancelled) return;
          router.replace("/login");
        }, 1500);
      }
    });

    // 2. Also subscribe: if a session shows up while we're waiting, cancel the timer
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
        if (redirectTimer) clearTimeout(redirectTimer);
        proceedWithUser(session.user.email);
      } else if (event === "SIGNED_OUT") {
        router.replace("/login");
      }
    });

    return () => {
      cancelled = true;
      if (redirectTimer) clearTimeout(redirectTimer);
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const sortedRows = useMemo(() => {
    if (!rows) return [];
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = (a[sortKey] ?? "") as string | number;
      const bv = (b[sortKey] ?? "") as string | number;
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av).localeCompare(String(bv));
      return sortDesc ? -cmp : cmp;
    });
    return copy;
  }, [rows, sortKey, sortDesc]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc(!sortDesc);
    else {
      setSortKey(key);
      setSortDesc(key === "created_at" || key === "total_score");
    }
  };

  if (loading) {
    return (
      <main id="main" className="flex-1 flex items-center justify-center p-8" style={{ color: "var(--text-muted)" }}>
        Loading…
      </main>
    );
  }

  if (error) {
    return (
      <main id="main" className="flex-1 flex items-center justify-center p-8">
        <div
          className="max-w-md rounded-2xl px-6 py-8 text-center"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-soft)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p className="text-sm mb-4" style={{ color: "#c67b5c" }}>
            {error}
          </p>
          <button
            onClick={handleSignOut}
            className="text-sm font-medium underline"
            style={{ color: "var(--accent)" }}
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header
        className="w-full px-6 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "var(--border-soft)" }}
      >
        <div>
          <p className="text-[11px] tracking-[0.18em] font-semibold uppercase" style={{ color: "var(--accent)" }}>
            Admin
          </p>
          <h1 className="text-lg font-semibold" style={{ color: "var(--navy)" }}>
            Assessment submissions
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {email}
          </span>
          <button
            onClick={handleSignOut}
            className="text-xs font-medium underline"
            style={{ color: "var(--accent)" }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main id="main" className="flex-1 px-6 py-8 overflow-x-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center gap-2 border-b" style={{ borderColor: "var(--border-soft)" }}>
            <TabButton active={tab === "submissions"} onClick={() => setTab("submissions")}>
              Readiness submissions
            </TabButton>
            <TabButton active={tab === "teams"} onClick={() => setTab("teams")}>
              Change-curve teams
            </TabButton>
          </div>

          {tab === "teams" ? (
            <TeamsAdmin />
          ) : (
            <>
          <AdminStats rows={sortedRows} />

          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
            All submissions. Click any column header to sort.
          </p>

          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-card)",
              boxShadow: "var(--shadow-card)",
              border: "1px solid var(--border-soft)",
            }}
          >
            <table className="w-full text-sm">
              <thead style={{ background: "var(--bg-alt)" }}>
                <tr>
                  <Th onClick={() => toggleSort("created_at")} active={sortKey === "created_at"} desc={sortDesc}>
                    Date
                  </Th>
                  <Th onClick={() => toggleSort("company")} active={sortKey === "company"} desc={sortDesc}>
                    Company
                  </Th>
                  <th className="px-3 py-2 text-left font-medium" style={{ color: "var(--text-mid)" }}>
                    Name
                  </th>
                  <th className="px-3 py-2 text-left font-medium" style={{ color: "var(--text-mid)" }}>
                    Email
                  </th>
                  <th className="px-3 py-2 text-left font-medium" style={{ color: "var(--text-mid)" }}>
                    Role
                  </th>
                  <Th onClick={() => toggleSort("total_score")} active={sortKey === "total_score"} desc={sortDesc}>
                    Score
                  </Th>
                  <Th onClick={() => toggleSort("profile")} active={sortKey === "profile"} desc={sortDesc}>
                    Profile
                  </Th>
                  <th className="px-2 py-2 text-center font-medium" style={{ color: "var(--text-mid)" }}>
                    A
                  </th>
                  <th className="px-2 py-2 text-center font-medium" style={{ color: "var(--text-mid)" }}>
                    B
                  </th>
                  <th className="px-2 py-2 text-center font-medium" style={{ color: "var(--text-mid)" }}>
                    C
                  </th>
                  <th className="px-2 py-2 text-center font-medium" style={{ color: "var(--text-mid)" }}>
                    D
                  </th>
                  <th className="px-2 py-2 text-center font-medium" style={{ color: "var(--text-mid)" }}>
                    E
                  </th>
                  <th className="px-3 py-2 text-left font-medium" style={{ color: "var(--text-mid)" }}>
                    Would hand off
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setDetailRow(r)}
                    className="border-t cursor-pointer transition-colors"
                    style={{ borderColor: "var(--border-soft)", opacity: r.completed_at ? 1 : 0.55 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-alt)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-3 py-3 whitespace-nowrap" style={{ color: "var(--text-mid)" }}>
                      {formatDate(r.created_at)}
                      {!r.completed_at && (
                        <span
                          className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{ background: "var(--border-soft)", color: "var(--text-muted)" }}
                        >
                          partial
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3" style={{ color: "var(--text)" }}>
                      {r.company ?? "—"}
                    </td>
                    <td className="px-3 py-3" style={{ color: "var(--text)" }}>
                      {r.name ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: "var(--text-mid)" }}>
                      {r.email ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: "var(--text-mid)" }}>
                      {r.role ?? "—"}
                    </td>
                    <td className="px-3 py-3 font-semibold tabular-nums" style={{ color: "var(--navy)" }}>
                      {r.total_score ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-xs" style={{ color: "var(--text-mid)" }}>
                      {r.profile ? PROFILES[r.profile as keyof typeof PROFILES]?.name ?? r.profile : "—"}
                    </td>
                    <SubCell v={r.dim_a} />
                    <SubCell v={r.dim_b} />
                    <SubCell v={r.dim_c} />
                    <SubCell v={r.dim_d} />
                    <SubCell v={r.dim_e} />
                    <td className="px-3 py-3 text-xs" style={{ color: "var(--text-mid)", maxWidth: 280 }}>
                      {r.handoff_task ?? "—"}
                    </td>
                  </tr>
                ))}
                {sortedRows.length === 0 && (
                  <tr>
                    <td colSpan={13} className="px-3 py-6 text-center" style={{ color: "var(--text-muted)" }}>
                      No submissions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
            </>
          )}
        </div>
        {detailRow && (
          <SubmissionDetailModal row={detailRow} onClose={() => setDetailRow(null)} />
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

function SubmissionDetailModal({ row, onClose }: { row: Row; onClose: () => void }) {
  const answers = (row as Row & { answers?: Record<string, unknown> }).answers ?? {};
  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: "rgba(30,45,66,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl px-7 py-7 max-h-[85vh] overflow-y-auto"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-soft)", boxShadow: "var(--shadow-card)" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-1" style={{ color: "var(--accent)" }}>
              {row.completed_at ? "Completed submission" : "Partial submission"}
            </p>
            <h2 className="text-xl font-semibold" style={{ color: "var(--navy)" }}>
              {row.name ?? "Anonymous"} {row.company ? `· ${row.company}` : ""}
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Started {new Date(row.created_at).toLocaleString()}
              {row.completed_at ? ` · Finished ${new Date(row.completed_at).toLocaleTimeString()}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-lg px-3 py-1 rounded-md"
            style={{ color: "var(--text-muted)" }}
          >
            ✕
          </button>
        </div>

        {row.completed_at ? (
          <div className="mb-5 rounded-lg px-4 py-3 text-sm" style={{ background: "var(--bg-alt)", color: "var(--text)" }}>
            Score <strong>{row.total_score}</strong> / 45 · Profile{" "}
            <strong>{row.profile ? PROFILES[row.profile as keyof typeof PROFILES]?.name ?? row.profile : "—"}</strong>
          </div>
        ) : (
          <div className="mb-5 rounded-lg px-4 py-3 text-sm" style={{ background: "rgba(198,123,92,0.10)", color: "#8a4a34" }}>
            The visitor didn&apos;t finish. Below is what they answered before quitting.
          </div>
        )}

        <ul className="flex flex-col gap-4">
          {QUESTIONS.map((q) => {
            const raw = answers[q.id];
            const answered = raw !== undefined && raw !== null && raw !== "";
            let answerLabel = "— not answered —";
            if (answered) {
              if (q.type === "choice") {
                const choice = q.options.find((o) => o.score === Number(raw));
                answerLabel = choice ? `${choice.label} (${choice.score}/3)` : String(raw);
              } else {
                answerLabel = String(raw);
              }
            }
            return (
              <li key={q.id} className="border-l-2 pl-3" style={{ borderColor: answered ? "var(--accent)" : "var(--border-soft)" }}>
                <p className="text-[11px] tracking-wider uppercase mb-1" style={{ color: "var(--text-muted)" }}>
                  {q.id} · {q.type === "choice" ? "choice" : "text"}
                </p>
                <p className="text-[14px] font-medium mb-1" style={{ color: "var(--navy)" }}>
                  {q.prompt}
                </p>
                <p className="text-[14px]" style={{ color: answered ? "var(--text)" : "var(--text-muted)", fontStyle: answered ? "normal" : "italic" }}>
                  {answerLabel}
                </p>
              </li>
            );
          })}
        </ul>

        {row.handoff_task && (
          <div className="mt-5 rounded-lg px-4 py-3" style={{ background: "var(--bg-alt)" }}>
            <p className="text-[11px] tracking-wider uppercase mb-1" style={{ color: "var(--text-muted)" }}>
              What they&apos;d hand off
            </p>
            <p className="text-[14px]" style={{ color: "var(--text)" }}>
              {row.handoff_task}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 text-sm font-medium"
      style={{
        color: active ? "var(--navy)" : "var(--text-muted)",
        borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
        marginBottom: "-1px",
      }}
    >
      {children}
    </button>
  );
}

function Th({
  children,
  onClick,
  active,
  desc,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  desc: boolean;
}) {
  return (
    <th
      className="px-3 py-2 text-left font-medium"
      style={{ color: active ? "var(--navy)" : "var(--text-mid)", cursor: "pointer" }}
      onClick={onClick}
    >
      {children}
      {active && <span className="ml-1">{desc ? "↓" : "↑"}</span>}
    </th>
  );
}

function SubCell({ v }: { v: number | null }) {
  return (
    <td className="px-2 py-3 text-center text-xs tabular-nums" style={{ color: "var(--text-mid)" }}>
      {v ?? "—"}
    </td>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
