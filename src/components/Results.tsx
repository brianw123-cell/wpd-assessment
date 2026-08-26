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

  // Pre-fill the mailto body so Gmail (and other clients) don't hang on an empty send.
  const mailtoBody = encodeURIComponent(
    `Hi Brian,\n\nI just took the AI Readiness assessment.\n\n` +
      `Score: ${result.totalScore} / 45 — ${result.profile.name}\n` +
      `Weakest dimensions: ${result.weakest.map((w) => w.label).join(", ")}\n\n` +
      `${result.handoffTask ? `What I'd hand off tomorrow: ${result.handoffTask}\n\n` : ""}` +
      `Would love to set up a call.\n\nThanks,\n`
  );
  const mailtoSubject = encodeURIComponent(
    `AI Readiness follow-up — score ${result.totalScore}, "${result.profile.name}"`
  );
  const mailtoHref = `mailto:westproductdev@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div className="q-fade-in w-full max-w-5xl mx-auto">
      {/* Top row: score+profile (left) · dimension breakdown (right) */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Score + profile */}
        <div
          className="rounded-2xl px-5 py-6 sm:px-7 sm:py-7"
          style={{
            background: "var(--bg-card)",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--border-soft)",
          }}
        >
          <p
            className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-2"
            style={{ color: "var(--accent)" }}
          >
            Your result
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            <span
              className="font-semibold leading-none"
              style={{
                fontSize: "clamp(44px, 6vw, 60px)",
                color: "var(--navy)",
                letterSpacing: "-0.03em",
              }}
            >
              {result.totalScore}
            </span>
            <span
              className="font-medium"
              style={{ color: "var(--text-muted)", fontSize: "18px" }}
            >
              / 45
            </span>
          </div>
          <h1
            className="font-semibold mb-2"
            style={{
              color: "var(--navy)",
              fontSize: "clamp(22px, 3vw, 28px)",
              letterSpacing: "-0.015em",
            }}
          >
            {result.profile.name}
          </h1>
          <p
            className="text-[15px] leading-snug"
            style={{ color: "var(--text-mid)" }}
          >
            {result.profile.summary}
          </p>
        </div>

        {/* Dimension breakdown as a radar/spider chart */}
        <div
          className="rounded-2xl px-5 py-6 sm:px-7 sm:py-7"
          style={{
            background: "var(--bg-card)",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--border-soft)",
          }}
        >
          <p
            className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-4"
            style={{ color: "var(--accent)" }}
          >
            Your shape
          </p>
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <RadarChart dimensions={dimensions} />
            </div>
            <ul className="flex flex-col gap-2 shrink-0">
              {dimensions.map((d) => (
                <li key={d.key} className="text-[12px]" style={{ color: "var(--text-mid)" }}>
                  <span className="tabular-nums font-semibold" style={{ color: "var(--navy)" }}>
                    {d.score}
                  </span>
                  <span style={{ color: "var(--text-muted)" }}> /9 </span>
                  <span className="ml-1">{d.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom row: weakest dimensions (left) · recommended first project + CTA (right) */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Weakest dimensions */}
        <div
          className="rounded-2xl px-5 py-6 sm:px-7 sm:py-7"
          style={{
            background: "var(--bg-card)",
            boxShadow: "var(--shadow-card)",
            border: "1px solid var(--border-soft)",
          }}
        >
          <p
            className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-4"
            style={{ color: "var(--accent)" }}
          >
            Where you&apos;d hit friction first
          </p>
          <ul className="flex flex-col gap-4">
            {result.weakest.map((w) => (
              <li key={w.dimension}>
                <p className="text-[14px] font-semibold mb-1" style={{ color: "var(--navy)" }}>
                  {w.label}
                </p>
                <p className="text-[14px] leading-snug" style={{ color: "var(--text-mid)" }}>
                  {w.oneLiner}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Recommended first project + CTA */}
        <div
          className="rounded-2xl px-5 py-6 sm:px-7 sm:py-7 flex flex-col"
          style={{ background: "var(--navy)", color: "#f5f3ef" }}
        >
          <p
            className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-3"
            style={{ color: "var(--slate)" }}
          >
            Where to start
          </p>
          <h2
            className="font-semibold mb-2"
            style={{
              color: "#f5f3ef",
              fontSize: "clamp(18px, 2.2vw, 22px)",
              letterSpacing: "-0.01em",
            }}
          >
            Your recommended first project
          </h2>
          <p
            className="text-[14.5px] leading-snug mb-5 flex-1"
            style={{ color: "rgba(245,243,239,0.85)" }}
          >
            {result.profile.firstProject}
          </p>
          <a
            href={mailtoHref}
            className="self-start inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-[15px] tracking-wide transition-transform hover:-translate-y-[1px]"
            style={{
              background: "#f5f3ef",
              color: "var(--navy)",
              boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
            }}
          >
            Book a 30-minute call →
          </a>
        </div>
      </div>

      <p className="mt-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        Your answers are saved. The Book-a-call button opens an email with your score pre-filled — send it and we&apos;ll set up 30 minutes.
      </p>
    </div>
  );
}

function barColor(score: number): string {
  if (score <= 3) return "#c67b5c";
  if (score <= 6) return "var(--accent-soft)";
  return "var(--success)";
}

/**
 * Radar chart for the five dimensions, each 0..9 on its own spoke.
 * Inline SVG, no chart library. Draws three concentric guide rings, five
 * axes, and the filled polygon of the score with a dot at each vertex.
 */
function RadarChart({
  dimensions,
}: {
  dimensions: Array<{ key: "A" | "B" | "C" | "D" | "E"; label: string; score: number }>;
}) {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 22;
  const n = dimensions.length;
  const maxScore = 9;

  // Axis endpoint for a given index (top = index 0)
  const axisPoint = (i: number, magnitude: number) => {
    const angle = -Math.PI / 2 + (i / n) * Math.PI * 2;
    return {
      x: cx + Math.cos(angle) * r * magnitude,
      y: cy + Math.sin(angle) * r * magnitude,
    };
  };

  // Ring polygons at 1/3, 2/3, and full
  const ring = (mag: number) =>
    dimensions.map((_, i) => {
      const p = axisPoint(i, mag);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ");

  // Score polygon vertices
  const vertices = dimensions.map((d, i) => axisPoint(i, Math.max(0, d.score / maxScore)));
  const scorePath = vertices.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  // Label positions just outside each axis
  const labelPoints = dimensions.map((d, i) => {
    const p = axisPoint(i, 1.14);
    return { ...d, x: p.x, y: p.y };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto max-w-[220px]" role="img" aria-label="Your score across the five dimensions">
      {/* Concentric guide rings */}
      {[1 / 3, 2 / 3, 1].map((mag) => (
        <polygon
          key={mag}
          points={ring(mag)}
          fill="none"
          stroke="var(--border-soft)"
          strokeWidth={1}
        />
      ))}
      {/* Axes */}
      {dimensions.map((_, i) => {
        const p = axisPoint(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border-soft)" strokeWidth={1} />;
      })}
      {/* Score polygon fill + stroke */}
      <polygon points={scorePath} fill="rgba(46,93,133,0.22)" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />
      {/* Vertex dots */}
      {vertices.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--navy)" stroke="#f5f3ef" strokeWidth={1.5} />
      ))}
      {/* Compact labels: use the dimension letter, positioned just outside the ring */}
      {labelPoints.map((d) => (
        <text
          key={d.key}
          x={d.x}
          y={d.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fontWeight={600}
          fill="var(--text-mid)"
        >
          {d.key}
        </text>
      ))}
    </svg>
  );
}
