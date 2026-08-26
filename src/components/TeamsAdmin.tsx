"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listTeamsForAdmin, type AdminTeamRow } from "@/lib/curve-queries";

export default function TeamsAdmin() {
  const [rows, setRows] = useState<AdminTeamRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listTeamsForAdmin()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((e) => {
        if (!cancelled) setError((e as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-sm" style={{ color: "#c67b5c" }}>{error}</p>;
  }
  if (rows == null) {
    return <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading…</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {rows.length} {rows.length === 1 ? "team" : "teams"}. Click a code to open its view.
        </p>
        <Link
          href="/team/new"
          className="text-xs font-medium px-4 py-2 rounded-full"
          style={{ background: "var(--navy)", color: "#f5f3ef" }}
        >
          Create a team →
        </Link>
      </div>
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
              <th className="px-3 py-2 text-left font-medium" style={{ color: "var(--text-mid)" }}>Code</th>
              <th className="px-3 py-2 text-left font-medium" style={{ color: "var(--text-mid)" }}>Name</th>
              <th className="px-3 py-2 text-left font-medium" style={{ color: "var(--text-mid)" }}>Created</th>
              <th className="px-3 py-2 text-center font-medium" style={{ color: "var(--text-mid)" }}>Rounds</th>
              <th className="px-3 py-2 text-center font-medium" style={{ color: "var(--text-mid)" }}>Responses</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t" style={{ borderColor: "var(--border-soft)" }}>
                <td className="px-3 py-3">
                  <Link href={`/team/${r.code}`} className="font-medium" style={{ color: "var(--accent)" }}>
                    {r.code}
                  </Link>
                </td>
                <td className="px-3 py-3" style={{ color: "var(--text)" }}>{r.name ?? "—"}</td>
                <td className="px-3 py-3 whitespace-nowrap" style={{ color: "var(--text-mid)" }}>
                  {formatDate(r.created_at)}
                </td>
                <td className="px-3 py-3 text-center tabular-nums" style={{ color: "var(--text-mid)" }}>{r.rounds}</td>
                <td className="px-3 py-3 text-center tabular-nums font-semibold" style={{ color: "var(--navy)" }}>{r.total_responses}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center" style={{ color: "var(--text-muted)" }}>
                  No teams yet. Create one to run a change curve.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
