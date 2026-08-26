"use client";

import Link from "next/link";
import type { CurveResult } from "@/types/curve";

type Props = {
  result: CurveResult;
  teamCode: string | null;
  addedToTeam: boolean;
  teamCodeError?: string | null;
};

export default function CurveResults({ result, teamCode, addedToTeam, teamCodeError }: Props) {
  const { usageScore, confidenceScore, stage } = result;

  return (
    <div className="q-fade-in w-full max-w-3xl mx-auto">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Stage + paragraph */}
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
            You&apos;re here right now
          </p>
          <h1
            className="font-semibold mb-3"
            style={{
              color: "var(--navy)",
              fontSize: "clamp(28px, 4vw, 40px)",
              letterSpacing: "-0.02em",
            }}
          >
            {stage.name}
          </h1>
          <p
            className="text-[15px] leading-relaxed"
            style={{ color: "var(--text-mid)" }}
          >
            {stage.paragraph}
          </p>
        </div>

        {/* Single-dot plot */}
        <div
          className="rounded-2xl px-5 py-6 sm:px-7 sm:py-7 flex flex-col"
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
            On the two-axis map
          </p>
          <SingleDotPlot usage={usageScore} confidence={confidenceScore} stageKey={stage.key} />
          <div className="mt-3 flex items-center justify-between text-[11px]" style={{ color: "var(--text-muted)" }}>
            <span>Usage: {usageScore} / 15</span>
            <span>Confidence: {confidenceScore} / 15</span>
          </div>
        </div>
      </div>

      {teamCodeError && (
        <div
          className="mt-4 rounded-2xl px-5 py-4 text-sm"
          style={{
            background: "rgba(198,123,92,0.10)",
            border: "1px solid rgba(198,123,92,0.4)",
            color: "#8a4a34",
          }}
        >
          {teamCodeError} If you meant to join a team, ask whoever set it up for the exact code, then retake this at{" "}
          <strong>/curve</strong>.
        </div>
      )}
      <div
        className="mt-4 rounded-2xl px-5 py-4 text-center text-sm"
        style={{
          background: "var(--bg-alt)",
          border: "1px solid var(--border-soft)",
          color: "var(--text-mid)",
        }}
      >
        {addedToTeam && teamCode ? (
          <>
            Your answer was added to team <strong style={{ color: "var(--navy)" }}>{teamCode}</strong>. Your individual answers
            are never shown to your employer.
          </>
        ) : (
          <>This was an anonymous individual take. Nothing was added to a team roll-up.</>
        )}
      </div>

      <p className="mt-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
        <Link href="/" className="hover:underline">
          ← Back to the home page
        </Link>
      </p>
    </div>
  );
}

/**
 * Single dot on a 15×15 grid. Usage on the x-axis, Confidence on the y-axis.
 * Includes six shaded regions for the stages so the result is legible without a legend.
 */
function SingleDotPlot({
  usage,
  confidence,
  stageKey,
}: {
  usage: number;
  confidence: number;
  stageKey: string;
}) {
  const W = 240;
  const H = 240;
  const pad = 24;
  const inner = W - pad * 2;

  const x = pad + (usage / 15) * inner;
  const y = H - pad - (confidence / 15) * inner;

  // Region boundaries in data coordinates (0..15)
  const xU4 = pad + (4.5 / 15) * inner;
  const xU9 = pad + (9.5 / 15) * inner;
  const yC5 = H - pad - (5.5 / 15) * inner;
  const yC7 = H - pad - (7.5 / 15) * inner;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Your position: ${stageKey}`}>
      <rect x={0} y={0} width={W} height={H} fill="var(--bg-alt)" />

      {/* Region shading */}
      <rect x={pad} y={pad} width={xU4 - pad} height={yC5 - pad} fill="rgba(198,123,92,0.12)" />
      <rect x={xU4} y={pad} width={xU9 - xU4} height={yC7 - pad} fill="rgba(198,123,92,0.08)" />
      <rect x={xU9} y={pad} width={W - pad - xU9} height={yC7 - pad} fill="rgba(198,123,92,0.16)" />
      <rect x={pad} y={yC5} width={xU4 - pad} height={H - pad - yC5} fill="rgba(46,93,133,0.10)" />
      <rect x={xU4} y={yC7} width={xU9 - xU4} height={H - pad - yC7} fill="rgba(46,93,133,0.10)" />
      <rect x={xU9} y={yC7} width={W - pad - xU9} height={H - pad - yC7} fill="rgba(46,93,133,0.20)" />

      {/* Axes */}
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--border-soft)" strokeWidth={1} />
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="var(--border-soft)" strokeWidth={1} />

      {/* Axis labels */}
      <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--text-muted)">
        Usage →
      </text>
      <text x={12} y={H / 2} textAnchor="middle" fontSize={10} fill="var(--text-muted)" transform={`rotate(-90 12 ${H / 2})`}>
        Confidence →
      </text>

      {/* Dot */}
      <circle cx={x} cy={y} r={9} fill="var(--navy)" stroke="#f5f3ef" strokeWidth={3} />
    </svg>
  );
}
