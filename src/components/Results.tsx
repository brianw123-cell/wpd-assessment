"use client";

import type { Result } from "@/types/assessment";

const DIMENSION_LABELS: Record<"A" | "B" | "C" | "D" | "E", string> = {
  A: "Data foundation",
  B: "Process",
  C: "Tools",
  D: "Team",
  E: "Owner capacity",
};

export default function Results({ result }: { result: Result }) {
  const dimensions: Array<{ key: "A" | "B" | "C" | "D" | "E"; label: string; score: number }> = [
    { key: "A", label: DIMENSION_LABELS.A, score: result.subscores.A },
    { key: "B", label: DIMENSION_LABELS.B, score: result.subscores.B },
    { key: "C", label: DIMENSION_LABELS.C, score: result.subscores.C },
    { key: "D", label: DIMENSION_LABELS.D, score: result.subscores.D },
    { key: "E", label: DIMENSION_LABELS.E, score: result.subscores.E },
  ];

  return (
    <div className="q-fade-in w-full max-w-3xl mx-auto">
      {/* Score + profile header */}
      <div
        className="rounded-2xl px-6 py-8 sm:px-10 sm:py-10 mb-6"
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
          Your result
        </p>

        <div className="flex items-baseline gap-3 mb-4">
          <span
            className="font-semibold leading-none"
            style={{
              fontSize: "clamp(52px, 8vw, 72px)",
              color: "var(--navy)",
              letterSpacing: "-0.03em",
            }}
          >
            {result.totalScore}
          </span>
          <span
            className="font-medium"
            style={{ color: "var(--text-muted)", fontSize: "clamp(18px, 2.2vw, 22px)" }}
          >
            / 45
          </span>
        </div>

        <h1
          className="font-semibold mb-3"
          style={{
            color: "var(--navy)",
            fontSize: "clamp(28px, 3.8vw, 36px)",
            letterSpacing: "-0.015em",
          }}
        >
          {result.profile.name}
        </h1>

        <p
          className="text-[17px] leading-relaxed"
          style={{ color: "var(--text-mid)", maxWidth: "62ch" }}
        >
          {result.profile.summary}
        </p>
      </div>

      {/* Dimension breakdown */}
      <div
        className="rounded-2xl px-6 py-8 sm:px-10 sm:py-10 mb-6"
        style={{
          background: "var(--bg-card)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--border-soft)",
        }}
      >
        <h2
          className="font-semibold mb-6"
          style={{
            color: "var(--navy)",
            fontSize: "22px",
            letterSpacing: "-0.01em",
          }}
        >
          Your score by dimension
        </h2>
        <ul className="flex flex-col gap-4">
          {dimensions.map((d) => (
            <li key={d.key}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
                  {d.label}
                </span>
                <span className="text-sm tabular-nums" style={{ color: "var(--text-muted)" }}>
                  {d.score} / 9
                </span>
              </div>
              <div
                className="h-2 w-full rounded-full overflow-hidden"
                style={{ background: "var(--border-soft)" }}
                role="progressbar"
                aria-valuenow={d.score}
                aria-valuemin={0}
                aria-valuemax={9}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(d.score / 9) * 100}%`,
                    background: barColor(d.score),
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Weakest dimensions */}
      <div
        className="rounded-2xl px-6 py-8 sm:px-10 sm:py-10 mb-6"
        style={{
          background: "var(--bg-card)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--border-soft)",
        }}
      >
        <h2
          className="font-semibold mb-2"
          style={{
            color: "var(--navy)",
            fontSize: "22px",
            letterSpacing: "-0.01em",
          }}
        >
          Where you&apos;d hit friction first
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          The two dimensions where your score was lowest.
        </p>
        <ul className="flex flex-col gap-5">
          {result.weakest.map((w) => (
            <li key={w.dimension}>
              <p
                className="text-[15px] font-semibold mb-1"
                style={{ color: "var(--navy)" }}
              >
                {w.label}
              </p>
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-mid)" }}>
                {w.oneLiner}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Recommended first project */}
      <div
        className="rounded-2xl px-6 py-8 sm:px-10 sm:py-10 mb-8"
        style={{
          background: "var(--navy)",
          color: "#f5f3ef",
        }}
      >
        <p
          className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-3"
          style={{ color: "var(--slate)" }}
        >
          Where to start
        </p>
        <h2
          className="font-semibold mb-3"
          style={{
            color: "#f5f3ef",
            fontSize: "clamp(22px, 2.6vw, 26px)",
            letterSpacing: "-0.01em",
          }}
        >
          Your recommended first project
        </h2>
        <p
          className="text-[17px] leading-relaxed mb-6"
          style={{ color: "rgba(245,243,239,0.85)", maxWidth: "60ch" }}
        >
          {result.profile.firstProject}
        </p>

        <a
          href="mailto:westproductdev@gmail.com?subject=AI%20Readiness%20follow-up%20-%20let's%20talk"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium text-base tracking-wide transition-transform hover:-translate-y-[1px]"
          style={{
            background: "#f5f3ef",
            color: "var(--navy)",
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
          }}
        >
          Book a 30-minute call →
        </a>
      </div>

      <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
        You&apos;ll get an email with the same breakdown shortly.
      </p>
    </div>
  );
}

function barColor(score: number): string {
  if (score <= 3) return "#c67b5c";  // muted terracotta for low scores — attention, not alarm
  if (score <= 6) return "var(--accent-soft)"; // in-progress blue
  return "var(--success)"; // green for strong
}
