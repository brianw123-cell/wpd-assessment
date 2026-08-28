"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PROFILES } from "@/lib/scoring";

type SampleRow = {
  id: string;
  created_at: string;
  name: string | null;
  email: string | null;
  company: string | null;
  role: string | null;
  total_score: number | null;
  profile: string | null;
  handoff_task: string | null;
};

// Public, no auth. Reads ONLY rows flagged is_sample = true, via a
// SECURITY DEFINER RPC. Real submissions default to is_sample = false and can
// never appear here, so this page stays safe to hand to anyone.
export default function SampleAdminPage() {
  const [rows, setRows] = useState<SampleRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("list_sample_assessments");
      if (error) {
        setError(error.message);
        return;
      }
      setRows((data as SampleRow[]) ?? []);
    })();
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <main id="main" className="flex-1 px-4 sm:px-6 py-10">
        <div className="w-full max-w-5xl mx-auto">
          <div
            className="rounded-xl px-5 py-4 mb-8"
            style={{ background: "var(--navy)", color: "#f5f3ef" }}
          >
            <p className="text-[13px] leading-relaxed">
              <strong>Sample data.</strong> This is the view the owner of the tool has across every
              company using it. Every name, company and email below is invented. Real submissions
              never appear on this page.
            </p>
          </div>

          <h1
            className="font-semibold mb-2"
            style={{ color: "var(--navy)", fontSize: "clamp(24px, 4vw, 34px)", letterSpacing: "-0.02em" }}
          >
            Readiness submissions
          </h1>
          <p className="text-[15px] mb-8" style={{ color: "var(--text-mid)" }}>
            Who took the assessment, what they scored, and the one task they said they&apos;d hand off
            tomorrow. That last column is the reason to run an assessment at all.
          </p>

          {error && (
            <p className="text-sm" style={{ color: "#b3261e" }}>
              Could not load sample data: {error}
            </p>
          )}
          {!rows && !error && (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Loading…
            </p>
          )}

          {rows && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px] border-collapse">
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border-soft)" }}>
                    {["Company", "Name", "Role", "Score", "Profile", "Would hand off"].map((h) => (
                      <th
                        key={h}
                        className="py-3 pr-4 text-[11px] tracking-[0.14em] font-semibold uppercase whitespace-nowrap"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                      <td className="py-3 pr-4 font-medium" style={{ color: "var(--navy)" }}>
                        {r.company ?? "—"}
                      </td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-mid)" }}>
                        {r.name ?? "—"}
                      </td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-mid)" }}>
                        {r.role ?? "—"}
                      </td>
                      <td className="py-3 pr-4 tabular-nums" style={{ color: "var(--text)" }}>
                        {r.total_score ?? "—"} / 45
                      </td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-mid)" }}>
                        {r.profile
                          ? (PROFILES as Record<string, { name: string }>)[r.profile]?.name ?? r.profile
                          : "—"}
                      </td>
                      <td className="py-3 pr-4" style={{ color: "var(--text-muted)" }}>
                        {r.handoff_task?.trim() || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-10 flex gap-6 flex-wrap">
            <Link href="/tour" className="text-base font-semibold underline" style={{ color: "var(--accent)" }}>
              ← Back to the tour
            </Link>
            <Link href="/" className="text-base font-semibold underline" style={{ color: "var(--accent)" }}>
              West Product Development LLC
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
