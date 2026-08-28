"use client";

import { useMemo, useState } from "react";
import { DIMENSIONS } from "@/lib/fluency-questions";
import { FLUENCY_LEVELS } from "@/lib/fluency-scoring";
import type { FluencyLevelKey, FluencyTeamView as ViewData } from "@/types/fluency";

// Same privacy rule as the change curve: below five responses individuals are
// identifiable, and we told them their answers stay private.
const MIN_AGGREGATE = 3;
const MIN_DETAIL = 5;

const LEVEL_ORDER: FluencyLevelKey[] = ["unpracticed", "developing", "practiced", "fluent"];
const LEVEL_COLOR: Record<FluencyLevelKey, string> = {
  unpracticed: "#c8785f",
  developing: "#c9a961",
  practiced: "#5b87b5",
  fluent: "#2f4f6f",
};

export default function FluencyTeamView({ view }: { view: ViewData }) {
  const { team, rounds, responses } = view;
  const isDemo = !!team.is_demo;
  const withResponses = rounds.filter((r) => r.response_count > 0);
  const [roundId, setRoundId] = useState<string | null>(
    withResponses.length ? withResponses[withResponses.length - 1].id : rounds[0]?.id ?? null
  );

  const active = useMemo(() => responses.filter((r) => r.round_id === roundId), [responses, roundId]);
  const activeRound = rounds.find((r) => r.id === roundId) ?? null;
  const priorRound = useMemo(() => {
    if (!activeRound) return null;
    const earlier = withResponses.filter((r) => r.round_number < activeRound.round_number);
    return earlier.length ? earlier[earlier.length - 1] : null;
  }, [activeRound, withResponses]);
  const priorResponses = useMemo(
    () => (priorRound ? responses.filter((r) => r.round_id === priorRound.id) : []),
    [responses, priorRound]
  );

  const showAggregate = isDemo || active.length >= MIN_AGGREGATE;
  const showDetail = isDemo || active.length >= MIN_DETAIL;

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    LEVEL_ORDER.forEach((k) => (c[k] = 0));
    active.forEach((r) => (c[r.level] = (c[r.level] ?? 0) + 1));
    return c;
  }, [active]);

  const priorCounts = useMemo(() => {
    const c: Record<string, number> = {};
    LEVEL_ORDER.forEach((k) => (c[k] = 0));
    priorResponses.forEach((r) => (c[r.level] = (c[r.level] ?? 0) + 1));
    return c;
  }, [priorResponses]);

  const avg = useMemo(() => {
    if (!active.length) return { J: 0, V: 0, D: 0 };
    const s = active.reduce(
      (acc, r) => ({
        J: acc.J + r.judgment_score,
        V: acc.V + r.verification_score,
        D: acc.D + r.delegation_score,
      }),
      { J: 0, V: 0, D: 0 }
    );
    return { J: s.J / active.length, V: s.V / active.length, D: s.D / active.length };
  }, [active]);

  // Nudge accounting: who committed to something, and of those who were asked
  // this round whether they did the last one, how many said yes.
  const commitments = active.filter((r) => r.commitment);
  const askedOutcome = active.filter((r) => r.prior_commitment_outcome);
  const didIt = askedOutcome.filter((r) => r.prior_commitment_outcome === "yes").length;
  const partly = askedOutcome.filter((r) => r.prior_commitment_outcome === "partly").length;

  const weakestDim = (["J", "V", "D"] as const).reduce((a, b) => (avg[a] <= avg[b] ? a : b));

  return (
    <div className="w-full max-w-5xl mx-auto">
      <p className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-2" style={{ color: "var(--accent)" }}>
        Team fluency
      </p>
      <h1
        className="font-semibold mb-2"
        style={{ color: "var(--navy)", fontSize: "clamp(26px, 4vw, 38px)", letterSpacing: "-0.02em" }}
      >
        {team.name || team.code}
      </h1>

      {team.fluency_definition && (
        <div
          className="px-5 py-4 rounded-xl mb-6"
          style={{ background: "var(--bg-page)", border: "1px solid var(--border-soft)" }}
        >
          <p className="text-[11px] tracking-[0.16em] font-semibold uppercase mb-2" style={{ color: "var(--text-muted)" }}>
            What fluency means here
          </p>
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--navy)" }}>
            {team.fluency_definition}
          </p>
        </div>
      )}

      {rounds.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <span className="text-[11px] tracking-[0.16em] font-semibold uppercase mr-1" style={{ color: "var(--text-muted)" }}>
            Rounds
          </span>
          {rounds.map((r) => {
            const on = r.id === roundId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRoundId(r.id)}
                className="px-4 py-1.5 rounded-full text-[13px] font-medium"
                style={{
                  background: on ? "var(--navy)" : "var(--bg-card)",
                  color: on ? "#f5f3ef" : "var(--text-mid)",
                  border: `1px solid ${on ? "var(--navy)" : "var(--border-soft)"}`,
                }}
              >
                Round {r.round_number} ({r.response_count})
              </button>
            );
          })}
        </div>
      )}

      {!showAggregate ? (
        <Panel>
          <h2 className="font-semibold mb-2" style={{ color: "var(--navy)", fontSize: "20px" }}>
            {active.length} of {MIN_AGGREGATE} responses
          </h2>
          <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-mid)" }}>
            The team summary appears once {MIN_AGGREGATE} people have responded. Below that, individual
            answers are identifiable, and we told everyone theirs would stay private.
          </p>
        </Panel>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <Panel>
            <PanelTitle>Where the team is</PanelTitle>
            <div className="flex h-6 rounded-full overflow-hidden mb-5" style={{ background: "var(--border-soft)" }}>
              {LEVEL_ORDER.map((k) =>
                counts[k] ? (
                  <div
                    key={k}
                    style={{ width: `${(counts[k] / active.length) * 100}%`, background: LEVEL_COLOR[k] }}
                    title={`${FLUENCY_LEVELS[k].name}: ${counts[k]}`}
                  />
                ) : null
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {LEVEL_ORDER.map((k) => (
                <div key={k} className="flex items-center justify-between text-[14px]">
                  <span className="flex items-center gap-2" style={{ color: "var(--text-mid)" }}>
                    <span className="w-3 h-3 rounded-sm inline-block" style={{ background: LEVEL_COLOR[k] }} />
                    {FLUENCY_LEVELS[k].name}
                  </span>
                  <span className="tabular-nums" style={{ color: "var(--navy)" }}>
                    {counts[k]}
                    {priorRound && (
                      <Delta now={counts[k]} before={priorCounts[k]} />
                    )}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[13px] mt-4" style={{ color: "var(--text-muted)" }}>
              {active.length} responses{activeRound ? ` in round ${activeRound.round_number}` : ""}
              {priorRound ? `, compared against round ${priorRound.round_number}` : ""}.
            </p>
          </Panel>

          <Panel>
            <PanelTitle>The three behaviors</PanelTitle>
            <div className="flex flex-col gap-5">
              {(["J", "V", "D"] as const).map((d) => (
                <div key={d}>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[15px] font-medium" style={{ color: "var(--navy)" }}>
                      {DIMENSIONS[d].name}
                    </span>
                    <span className="text-[13px] tabular-nums" style={{ color: "var(--text-muted)" }}>
                      {avg[d].toFixed(1)} / 12 avg
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border-soft)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(avg[d] / 12) * 100}%`,
                        background: d === weakestDim ? "var(--accent)" : "var(--navy)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[14px] leading-relaxed mt-5" style={{ color: "var(--text-mid)" }}>
              <strong style={{ color: "var(--navy)" }}>Weakest as a group: {DIMENSIONS[weakestDim].name}.</strong>{" "}
              {DIMENSIONS[weakestDim].blurb} That is where a session would pay off most, and it is not
              something more tool access fixes.
            </p>
          </Panel>

          <Panel>
            <PanelTitle>Did the last round stick?</PanelTitle>
            {askedOutcome.length === 0 ? (
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-mid)" }}>
                Nobody has been asked yet. Everyone who writes down a commitment gets shown it the next
                time they take this, and is asked whether it happened. That answer becomes the number
                on this panel, which is the one leadership actually asks for.
              </p>
            ) : (
              <>
                <p className="mb-3" style={{ color: "var(--navy)", fontSize: "34px", fontWeight: 600 }}>
                  {Math.round((didIt / askedOutcome.length) * 100)}%
                </p>
                <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-mid)" }}>
                  {didIt} of {askedOutcome.length} people did the thing they wrote down last time
                  {partly > 0 ? `, and ${partly} got partway` : ""}. This is the closest thing to proof
                  that a session changed anything.
                </p>
              </>
            )}
          </Panel>

          <Panel>
            <PanelTitle>What people committed to</PanelTitle>
            {!showDetail ? (
              <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-mid)" }}>
                Written commitments unlock at {MIN_DETAIL} responses. Below that, people are
                identifiable from what they wrote, and we told them their answers would stay private.
                {" "}
                {active.length} of {MIN_DETAIL} so far.
              </p>
            ) : commitments.length === 0 ? (
              <p className="text-[15px]" style={{ color: "var(--text-mid)" }}>
                Nobody wrote one down this round.
              </p>
            ) : (
              <ul className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
                {commitments.map((r) => (
                  <li
                    key={r.id}
                    className="text-[14px] leading-relaxed px-4 py-3 rounded-lg"
                    style={{ background: "var(--bg-page)", color: "var(--text-mid)" }}
                  >
                    {r.commitment}
                    {r.commitment_due && (
                      <span className="block text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>
                        by {r.commitment_due}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}

function Delta({ now, before }: { now: number; before: number }) {
  const d = now - before;
  if (d === 0) return null;
  return (
    <span
      className="ml-2 text-[12px] font-medium"
      style={{ color: d > 0 ? "#2f6f4f" : "#b3261e" }}
    >
      {d > 0 ? "▲" : "▼"}
      {Math.abs(d)}
    </span>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl px-6 py-6"
      style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-soft)" }}
    >
      {children}
    </div>
  );
}
function PanelTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-4" style={{ color: "var(--text-muted)" }}>
      {children}
    </p>
  );
}
