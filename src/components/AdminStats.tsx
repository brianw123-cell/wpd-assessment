"use client";

import { useMemo } from "react";
import { PROFILES } from "@/lib/scoring";
import type { ProfileKey } from "@/types/assessment";

type Row = {
  id: string;
  created_at: string;
  completed_at: string | null;
  total_score: number | null;
  profile: string | null;
  dim_a: number | null;
  dim_b: number | null;
  dim_c: number | null;
  dim_d: number | null;
  dim_e: number | null;
};

export default function AdminStats({ rows }: { rows: Row[] }) {
  const stats = useMemo(() => computeStats(rows), [rows]);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <StatCard label="Total submissions" value={String(stats.total)} sub={`${stats.completedPct}% completed`} />
      <StatCard label="Completed" value={String(stats.completed)} sub={`${stats.partial} partial`} />
      <StatCard label="Avg score" value={stats.avgScore != null ? String(stats.avgScore) : "—"} sub="out of 45" />
      <StatCard label="Last 7 days" value={String(stats.last7Total)} sub={`${stats.last7Completed} completed`} />

      {/* Profile distribution */}
      <div
        className="col-span-2 md:col-span-2 rounded-xl px-4 py-4"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-soft)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <p
          className="text-[10px] tracking-[0.18em] font-semibold uppercase mb-3"
          style={{ color: "var(--accent)" }}
        >
          Profile distribution
        </p>
        <ul className="flex flex-col gap-2">
          {(Object.keys(PROFILES) as ProfileKey[]).map((key) => {
            const name = PROFILES[key].name;
            const count = stats.profileCounts[key] ?? 0;
            const denom = Math.max(1, stats.completed);
            const pct = Math.round((count / denom) * 100);
            return (
              <li key={key} className="flex items-center gap-3">
                <span className="text-[12px] font-medium w-40 shrink-0" style={{ color: "var(--text-mid)" }}>
                  {name}
                </span>
                <div
                  className="h-1.5 flex-1 rounded-full overflow-hidden"
                  style={{ background: "var(--border-soft)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: "var(--accent)" }}
                  />
                </div>
                <span className="text-[11px] tabular-nums w-16 text-right" style={{ color: "var(--text-muted)" }}>
                  {count} · {pct}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Dimension averages */}
      <div
        className="col-span-2 md:col-span-2 rounded-xl px-4 py-4"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-soft)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <p
          className="text-[10px] tracking-[0.18em] font-semibold uppercase mb-3"
          style={{ color: "var(--accent)" }}
        >
          Avg score by dimension (completed only)
        </p>
        <ul className="flex flex-col gap-2">
          {(["A", "B", "C", "D", "E"] as const).map((k) => {
            const label = DIM_LABEL[k];
            const avg = stats.dimAvg[k];
            return (
              <li key={k} className="flex items-center gap-3">
                <span className="text-[12px] font-medium w-40 shrink-0" style={{ color: "var(--text-mid)" }}>
                  {label}
                </span>
                <div
                  className="h-1.5 flex-1 rounded-full overflow-hidden"
                  style={{ background: "var(--border-soft)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, ((avg ?? 0) / 9) * 100)}%`,
                      background: avg == null ? "var(--border)" : "var(--accent-soft)",
                    }}
                  />
                </div>
                <span className="text-[11px] tabular-nums w-16 text-right" style={{ color: "var(--text-muted)" }}>
                  {avg == null ? "—" : `${avg.toFixed(1)} / 9`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const DIM_LABEL = {
  A: "Data foundation",
  B: "Process",
  C: "Tools",
  D: "Team",
  E: "Owner capacity",
} as const;

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <p
        className="text-[10px] tracking-[0.18em] font-semibold uppercase mb-2"
        style={{ color: "var(--accent)" }}
      >
        {label}
      </p>
      <p
        className="font-semibold tabular-nums leading-none"
        style={{
          color: "var(--navy)",
          fontSize: "clamp(24px, 3.5vw, 30px)",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
      <p className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
        {sub}
      </p>
    </div>
  );
}

type ProfileCounts = Partial<Record<ProfileKey, number>>;

function computeStats(rows: Row[]) {
  const total = rows.length;
  const completed = rows.filter((r) => r.completed_at != null).length;
  const partial = total - completed;
  const completedPct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const completedRows = rows.filter((r) => r.completed_at != null && typeof r.total_score === "number");

  const avgScore =
    completedRows.length === 0
      ? null
      : Math.round(
          completedRows.reduce((sum, r) => sum + (r.total_score ?? 0), 0) / completedRows.length
        );

  const profileCounts: ProfileCounts = {};
  for (const r of completedRows) {
    if (!r.profile) continue;
    const k = r.profile as ProfileKey;
    profileCounts[k] = (profileCounts[k] ?? 0) + 1;
  }

  const dimAvg: Record<"A" | "B" | "C" | "D" | "E", number | null> = {
    A: avgOf(completedRows, "dim_a"),
    B: avgOf(completedRows, "dim_b"),
    C: avgOf(completedRows, "dim_c"),
    D: avgOf(completedRows, "dim_d"),
    E: avgOf(completedRows, "dim_e"),
  };

  const sevenDaysAgoMs = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7 = rows.filter((r) => new Date(r.created_at).getTime() >= sevenDaysAgoMs);
  const last7Total = last7.length;
  const last7Completed = last7.filter((r) => r.completed_at != null).length;

  return {
    total,
    completed,
    partial,
    completedPct,
    avgScore,
    profileCounts,
    dimAvg,
    last7Total,
    last7Completed,
  };
}

function avgOf(rows: Row[], key: "dim_a" | "dim_b" | "dim_c" | "dim_d" | "dim_e"): number | null {
  const vals = rows.map((r) => r[key]).filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return null;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}
