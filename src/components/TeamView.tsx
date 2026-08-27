"use client";

import { useMemo, useState } from "react";
import type {
  CurveResponseRow,
  CurveStageKey,
  TeamRound,
  TeamView as TeamViewData,
} from "@/types/curve";
import { CURVE_STAGES } from "@/lib/curve-scoring";

const STAGE_ORDER: CurveStageKey[] = [
  "dread",
  "willing_stalled",
  "unconvinced",
  "experimenting",
  "fluent",
  "complying",
];

const STAGE_COLORS: Record<CurveStageKey, string> = {
  dread: "#c67b5c",
  willing_stalled: "#e0a674",
  unconvinced: "#b8a279",
  experimenting: "#6a8fa8",
  fluent: "#2e5d85",
  complying: "#7a3a52",
};

const MIN_RESPONSES = 5;
const BENCHMARK_MIN = 100;

type Props = {
  view: TeamViewData;
  benchmark?: { total: number; stages: Record<string, number> };
};

export default function TeamView({ view, benchmark }: Props) {
  const { team, rounds, responses } = view;

  const roundsSorted = useMemo(() => [...rounds].sort((a, b) => a.round_number - b.round_number), [rounds]);
  // Default the round selector to the latest round that actually has responses,
  // so opening a fresh Round 2 doesn't hide the meaningful Round 1 data behind
  // an empty screen. Falls back to the latest round if every round is empty.
  const defaultRoundId = useMemo(() => {
    const withResponses = [...roundsSorted].reverse().find((r) => r.response_count > 0);
    return withResponses?.id ?? roundsSorted[roundsSorted.length - 1]?.id ?? null;
  }, [roundsSorted]);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(defaultRoundId);
  const activeRound = useMemo(
    () => roundsSorted.find((r) => r.id === selectedRoundId) ?? roundsSorted[roundsSorted.length - 1] ?? null,
    [roundsSorted, selectedRoundId]
  );

  // For the retake comparison, we always compare the ACTIVE round to the
  // round immediately before it (the natural "before" for the current view).
  const previousRound = useMemo(() => {
    if (!activeRound) return null;
    const idx = roundsSorted.findIndex((r) => r.id === activeRound.id);
    return idx > 0 ? roundsSorted[idx - 1] : null;
  }, [roundsSorted, activeRound]);

  const activeResponses = useMemo(
    () => responses.filter((r) => r.round_id === activeRound?.id),
    [responses, activeRound]
  );
  const previousResponses = useMemo(
    () => (previousRound ? responses.filter((r) => r.round_id === previousRound.id) : []),
    [responses, previousRound]
  );

  const roundPicker = roundsSorted.length > 1 ? (
    <RoundPicker
      rounds={roundsSorted}
      activeRoundId={activeRound?.id ?? null}
      onSelect={setSelectedRoundId}
    />
  ) : null;

  if (activeResponses.length < MIN_RESPONSES) {
    return (
      <div className="max-w-3xl mx-auto">
        <TeamHeader team={team} round={activeRound} />
        {roundPicker}
        <div
          className="rounded-2xl px-6 py-10 text-center"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-soft)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <p className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-3" style={{ color: "var(--accent)" }}>
            Not enough responses in this round yet
          </p>
          <h2 className="font-semibold mb-3" style={{ color: "var(--navy)", fontSize: "clamp(22px, 3vw, 28px)" }}>
            {activeResponses.length} of {MIN_RESPONSES}
          </h2>
          <p className="text-[15px]" style={{ color: "var(--text-mid)" }}>
            We render the round&apos;s roll-up once at least five people have completed it. Below that number,
            individual answers become identifiable and the tool becomes a surveillance device.
            {roundsSorted.length > 1 && " Use the round picker above to look at a previous round."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <TeamHeader team={team} round={activeRound} />
      {roundPicker}

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card title="Where the team is">
          <DistributionBar responses={activeResponses} />
          <p className="mt-3 text-[13px]" style={{ color: "var(--text-muted)" }}>
            {activeResponses.length} responses in round {activeRound?.round_number}.
          </p>
        </Card>

        <Card title="Every person, plotted">
          <ScatterPlot responses={activeResponses} />
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <ComplyingCallout responses={activeResponses} />
        <WillingStalledCallout responses={activeResponses} />
      </div>

      <Card title="Psychological safety">
        <SafetyReading responses={activeResponses} />
      </Card>

      <div className="mt-4">
        <Card title="What people want leadership to understand">
          <LeadershipNotes responses={activeResponses} />
        </Card>
      </div>

      {previousRound && activeRound && (
        <div className="mt-4">
          <Card title={`Movement since round ${previousRound.round_number}`}>
            <RetakeComparison
              previous={previousResponses}
              current={activeResponses}
              previousRound={previousRound}
              currentRound={activeRound}
            />
          </Card>
        </div>
      )}

      {benchmark && (
        <div className="mt-4">
          <Card title="How your team compares">
            <Benchmark
              teamResponses={activeResponses}
              benchmark={benchmark}
            />
          </Card>
        </div>
      )}
    </div>
  );
}

function RoundPicker({
  rounds,
  activeRoundId,
  onSelect,
}: {
  rounds: TeamRound[];
  activeRoundId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="mb-6 flex items-center gap-2 flex-wrap">
      <span className="text-[11px] tracking-[0.18em] font-semibold uppercase mr-1" style={{ color: "var(--text-muted)" }}>
        Rounds
      </span>
      {rounds.map((r) => {
        const active = r.id === activeRoundId;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r.id)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors"
            style={{
              borderColor: active ? "var(--accent)" : "var(--border-soft)",
              background: active ? "var(--accent)" : "var(--bg-card)",
              color: active ? "#f5f3ef" : "var(--text-mid)",
            }}
          >
            Round {r.round_number}
            <span
              className="ml-1.5 tabular-nums"
              style={{ opacity: 0.8 }}
            >
              ({r.response_count})
            </span>
            {r.closed_at ? (
              <span className="ml-1 text-[10px] uppercase tracking-wider" style={{ opacity: 0.6 }}>
                closed
              </span>
            ) : (
              <span className="ml-1 text-[10px] uppercase tracking-wider" style={{ opacity: 0.6 }}>
                open
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function TeamHeader({ team, round }: { team: TeamViewData["team"]; round: TeamRound | null }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-1" style={{ color: "var(--accent)" }}>
        Team view
      </p>
      <h1
        className="font-semibold"
        style={{ color: "var(--navy)", fontSize: "clamp(26px, 4vw, 34px)", letterSpacing: "-0.02em" }}
      >
        {team.name || team.code}
      </h1>
      {round && (
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Round {round.round_number}
          {round.label ? ` — ${round.label}` : ""} · opened {formatDate(round.opened_at)}
        </p>
      )}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl px-5 py-6 sm:px-7 sm:py-7"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-soft)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <p className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-4" style={{ color: "var(--accent)" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function DistributionBar({ responses }: { responses: CurveResponseRow[] }) {
  const counts = tallyStages(responses);
  const total = responses.length;

  return (
    <div>
      <div className="flex h-6 w-full rounded-full overflow-hidden" style={{ background: "var(--border-soft)" }}>
        {STAGE_ORDER.map((stage) => {
          const n = counts[stage] || 0;
          if (n === 0) return null;
          const pct = (n / total) * 100;
          return (
            <div
              key={stage}
              title={`${CURVE_STAGES[stage].name}: ${n}`}
              style={{ width: `${pct}%`, background: STAGE_COLORS[stage] }}
            />
          );
        })}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
        {STAGE_ORDER.map((stage) => (
          <li key={stage} className="flex items-center justify-between">
            <span className="flex items-center gap-2" style={{ color: "var(--text)" }}>
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: STAGE_COLORS[stage] }} />
              {CURVE_STAGES[stage].name}
            </span>
            <span className="tabular-nums" style={{ color: "var(--text-muted)" }}>
              {counts[stage] || 0}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScatterPlot({ responses }: { responses: CurveResponseRow[] }) {
  const W = 260;
  const H = 260;
  const pad = 26;
  const inner = W - pad * 2;

  const toX = (u: number) => pad + (u / 15) * inner;
  const toY = (c: number) => H - pad - (c / 15) * inner;

  // Region boundaries (data coords)
  const xU4 = toX(4.5);
  const xU9 = toX(9.5);
  const yC5 = toY(5.5);
  const yC7 = toY(7.5);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Scatter of team members by usage and confidence">
      <rect x={0} y={0} width={W} height={H} fill="var(--bg-alt)" />

      {/* Complying region highlighted — it's the finding */}
      <rect x={xU9} y={yC7} width={W - pad - xU9} height={H - pad - yC7} fill="rgba(122,58,82,0.14)" />
      {/* Willing-but-stalled region */}
      <rect x={pad} y={pad} width={xU4 - pad} height={yC5 - pad} fill="rgba(224,166,116,0.12)" />

      {/* Axes */}
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--border-soft)" />
      <line x1={pad} y1={pad} x2={pad} y2={H - pad} stroke="var(--border-soft)" />

      <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--text-muted)">
        Usage →
      </text>
      <text x={12} y={H / 2} textAnchor="middle" fontSize={10} fill="var(--text-muted)" transform={`rotate(-90 12 ${H / 2})`}>
        Confidence →
      </text>

      {responses.map((r) => {
        const jitter = pseudoJitter(r.id);
        return (
          <circle
            key={r.id}
            cx={toX(r.usage_score) + jitter.x}
            cy={toY(r.confidence_score) + jitter.y}
            r={5}
            fill={STAGE_COLORS[r.stage as CurveStageKey] ?? "#8fa8be"}
            stroke="#f5f3ef"
            strokeWidth={1.5}
            opacity={0.9}
          />
        );
      })}
    </svg>
  );
}

function ComplyingCallout({ responses }: { responses: CurveResponseRow[] }) {
  const count = responses.filter((r) => r.stage === "complying").length;
  return (
    <div
      className="rounded-2xl px-5 py-6"
      style={{
        background: count > 0 ? "rgba(122,58,82,0.06)" : "var(--bg-card)",
        border: `1px solid ${count > 0 ? "rgba(122,58,82,0.35)" : "var(--border-soft)"}`,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <p className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-2" style={{ color: "#7a3a52" }}>
        The one to notice · Complying
      </p>
      <h3 className="font-semibold mb-2" style={{ color: "var(--navy)", fontSize: "24px" }}>
        {count} {count === 1 ? "person" : "people"}
      </h3>
      <p className="text-[14px] leading-snug" style={{ color: "var(--text-mid)" }}>
        {count > 0
          ? "High usage, low confidence. Using AI because they were told to, and not saying they don't trust it. They look like a success in every adoption dashboard. This is the group most likely to quietly leave."
          : "No one on this team is in the Complying quadrant right now. That's rare and good."}
      </p>
    </div>
  );
}

function WillingStalledCallout({ responses }: { responses: CurveResponseRow[] }) {
  const count = responses.filter((r) => r.stage === "willing_stalled").length;
  return (
    <div
      className="rounded-2xl px-5 py-6"
      style={{
        background: count > 0 ? "rgba(224,166,116,0.06)" : "var(--bg-card)",
        border: `1px solid ${count > 0 ? "rgba(224,166,116,0.4)" : "var(--border-soft)"}`,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <p className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-2" style={{ color: "#c67b5c" }}>
        The cheap win · Willing but stalled
      </p>
      <h3 className="font-semibold mb-2" style={{ color: "var(--navy)", fontSize: "24px" }}>
        {count} {count === 1 ? "person" : "people"}
      </h3>
      <p className="text-[14px] leading-snug" style={{ color: "var(--text-mid)" }}>
        {count > 0
          ? "Open to AI, hasn't started. Almost always a permission-and-time problem, not a skills problem. Fastest group to move."
          : "Nobody is in the Willing-but-stalled quadrant. Either everyone's already tried something, or nobody wants to."}
      </p>
    </div>
  );
}

function SafetyReading({ responses }: { responses: CurveResponseRow[] }) {
  const c5s = responses
    .map((r) => Number((r.answers as Record<string, unknown>)?.C5))
    .filter((v) => !Number.isNaN(v));
  const avg = c5s.length > 0 ? c5s.reduce((a, b) => a + b, 0) / c5s.length : 0;
  const flag = avg < 1.5;
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-[15px] leading-snug" style={{ color: "var(--text-mid)" }}>
          Average score on the &quot;could you say out loud at work that AI makes you uncomfortable?&quot; question.
        </p>
        {flag && (
          <p className="mt-2 text-[13px] font-semibold" style={{ color: "#c67b5c" }}>
            This team has a psychological-safety problem, not an AI problem. Fix that first.
          </p>
        )}
      </div>
      <div className="text-right">
        <div className="tabular-nums font-semibold" style={{ color: flag ? "#c67b5c" : "var(--navy)", fontSize: "44px", lineHeight: 1 }}>
          {avg.toFixed(1)}
        </div>
        <div className="text-[11px] mt-1 uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          out of 3
        </div>
      </div>
    </div>
  );
}

function LeadershipNotes({ responses }: { responses: CurveResponseRow[] }) {
  const notes = responses
    .map((r) => (r.leadership_note ?? "").trim())
    .filter((n) => n.length > 0);
  if (notes.length === 0) {
    return (
      <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>
        Nobody left a note this round.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-2">
      {notes.map((n, i) => (
        <li key={i} className="rounded-lg px-4 py-3" style={{ background: "var(--bg-alt)" }}>
          <p className="text-[14.5px] leading-relaxed" style={{ color: "var(--text)" }}>
            &ldquo;{n}&rdquo;
          </p>
        </li>
      ))}
    </ul>
  );
}

function RetakeComparison({
  previous,
  current,
  previousRound,
  currentRound,
}: {
  previous: CurveResponseRow[];
  current: CurveResponseRow[];
  previousRound: TeamRound;
  currentRound: TeamRound;
}) {
  const prevCounts = tallyStages(previous);
  const currCounts = tallyStages(current);

  // Match individuals across rounds by participant_hash
  const prevByHash = new Map<string, CurveResponseRow>();
  previous.forEach((r) => {
    if (r.participant_hash) prevByHash.set(r.participant_hash, r);
  });

  let forward = 0;
  let back = 0;
  let same = 0;
  const stageIndex: Record<CurveStageKey, number> = {
    dread: 0,
    willing_stalled: 1,
    unconvinced: 1,
    complying: 2,
    experimenting: 3,
    fluent: 4,
  };
  current.forEach((r) => {
    if (!r.participant_hash) return;
    const p = prevByHash.get(r.participant_hash);
    if (!p) return;
    const before = stageIndex[p.stage as CurveStageKey];
    const after = stageIndex[r.stage as CurveStageKey];
    if (after > before) forward += 1;
    else if (after < before) back += 1;
    else same += 1;
  });

  const matched = forward + back + same;

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StackedRoundBar label={`Round ${previousRound.round_number}`} counts={prevCounts} total={previous.length} />
        <StackedRoundBar label={`Round ${currentRound.round_number}`} counts={currCounts} total={current.length} />
      </div>
      <p className="text-[14.5px]" style={{ color: "var(--text-mid)" }}>
        {matched === 0 ? (
          <>Nobody was matched between rounds yet. Once individuals take round {currentRound.round_number} using the same email they used in round {previousRound.round_number}, movement will appear here.</>
        ) : (
          <>
            <strong style={{ color: "var(--navy)" }}>{forward}</strong> {forward === 1 ? "person" : "people"} moved forward,{" "}
            <strong style={{ color: "var(--navy)" }}>{back}</strong> moved back,{" "}
            <strong style={{ color: "var(--navy)" }}>{same}</strong> stayed the same.
          </>
        )}
      </p>
    </div>
  );
}

function StackedRoundBar({ label, counts, total }: { label: string; counts: Partial<Record<CurveStageKey, number>>; total: number }) {
  return (
    <div>
      <p className="text-[11px] tracking-wider uppercase mb-2" style={{ color: "var(--text-muted)" }}>
        {label} · {total} responses
      </p>
      <div className="flex h-5 w-full rounded-full overflow-hidden" style={{ background: "var(--border-soft)" }}>
        {STAGE_ORDER.map((stage) => {
          const n = counts[stage] || 0;
          if (n === 0 || total === 0) return null;
          const pct = (n / total) * 100;
          return <div key={stage} title={CURVE_STAGES[stage].name} style={{ width: `${pct}%`, background: STAGE_COLORS[stage] }} />;
        })}
      </div>
    </div>
  );
}

function Benchmark({
  teamResponses,
  benchmark,
}: {
  teamResponses: CurveResponseRow[];
  benchmark: { total: number; stages: Record<string, number> };
}) {
  if (benchmark.total < BENCHMARK_MIN) {
    return (
      <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>
        We&apos;ll show a benchmark comparison here once we have at least {BENCHMARK_MIN} responses across all teams. Currently:{" "}
        {benchmark.total}.
      </p>
    );
  }
  const teamCounts = tallyStages(teamResponses);
  const teamTotal = teamResponses.length;
  return (
    <ul className="flex flex-col gap-2 text-[14px]">
      {STAGE_ORDER.map((stage) => {
        const teamPct = teamTotal > 0 ? (teamCounts[stage] || 0) / teamTotal : 0;
        const benchPct = (benchmark.stages[stage] || 0) / benchmark.total;
        const diff = teamPct - benchPct;
        return (
          <li key={stage} className="flex items-center justify-between" style={{ color: "var(--text)" }}>
            <span className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-sm" style={{ background: STAGE_COLORS[stage] }} />
              {CURVE_STAGES[stage].name}
            </span>
            <span className="tabular-nums" style={{ color: "var(--text-muted)" }}>
              team {(teamPct * 100).toFixed(0)}% · benchmark {(benchPct * 100).toFixed(0)}% ({diff >= 0 ? "+" : ""}
              {(diff * 100).toFixed(0)} pts)
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function tallyStages(responses: CurveResponseRow[]): Partial<Record<CurveStageKey, number>> {
  const out: Partial<Record<CurveStageKey, number>> = {};
  for (const r of responses) {
    const s = r.stage as CurveStageKey;
    out[s] = (out[s] || 0) + 1;
  }
  return out;
}

function pseudoJitter(id: string): { x: number; y: number } {
  // Deterministic small jitter from the id so overlapping dots spread visibly.
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  const jx = ((h % 100) / 100 - 0.5) * 8;
  const jy = (((h >> 8) % 100) / 100 - 0.5) * 8;
  return { x: jx, y: jy };
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
