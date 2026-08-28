"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import FluencyQuestionCard from "@/components/FluencyQuestionCard";
import { FLUENCY_QUESTIONS, DIMENSIONS } from "@/lib/fluency-questions";
import { computeFluencyResult, participantHash } from "@/lib/fluency-scoring";
import { getPriorCommitment, submitFluencyResponse, type PriorCommitment } from "@/lib/fluency-queries";
import type { FluencyAnswersMap, FluencyResult } from "@/types/fluency";

type Phase = "intro" | "checkin" | "questions" | "commit" | "result";

export default function FluencyPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [teamCode, setTeamCode] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<FluencyAnswersMap>({});
  const [hash, setHash] = useState<string | null>(null);
  const [prior, setPrior] = useState<PriorCommitment | null>(null);
  const [priorOutcome, setPriorOutcome] = useState<string | null>(null);
  const [commitment, setCommitment] = useState("");
  const [result, setResult] = useState<FluencyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const q = FLUENCY_QUESTIONS[idx];
  const dueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  }, []);

  const start = async () => {
    setError(null);
    const code = teamCode.trim().toLowerCase();
    if (code && !identifier.trim()) {
      setError("Add your work email so a retake can be matched to this one.");
      return;
    }
    setBusy(true);
    try {
      if (code && identifier.trim()) {
        const h = await participantHash(identifier, code);
        setHash(h);
        const p = await getPriorCommitment({ teamCode: code, participantHash: h });
        if (p?.commitment) {
          setPrior(p);
          setPhase("checkin");
          return;
        }
      }
      setPhase("questions");
    } finally {
      setBusy(false);
    }
  };

  const choose = (score: 0 | 1 | 2 | 3) => {
    setAnswers((a) => ({ ...a, [q.id]: { id: q.id, score } }));
    setTimeout(() => {
      if (idx + 1 < FLUENCY_QUESTIONS.length) setIdx(idx + 1);
      else setPhase("commit");
    }, 140);
  };

  const finish = async () => {
    setBusy(true);
    setError(null);
    try {
      const r = computeFluencyResult(answers);
      const res = await submitFluencyResponse({
        teamCode: teamCode.trim() ? teamCode.trim().toLowerCase() : null,
        participantHash: hash,
        answers,
        result: r,
        commitment: commitment.trim() || null,
        commitmentDue: commitment.trim() ? dueDate : null,
        priorOutcome,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(r);
      setPhase("result");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <TopBar />
      <main id="main" className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-2xl mx-auto">
          {phase === "intro" && (
            <Card>
              <Eyebrow>AI fluency check</Eyebrow>
              <H1>Where you are with AI, by what you actually do</H1>
              <P>
                Twelve questions, about four minutes. It asks nothing about how many tools you use or
                how often you use them. It asks how you decide, how you check, and what you hand over,
                because that&apos;s what fluency actually is.
              </P>
              <P muted>
                Leave the team code blank to take it on your own. Your individual answers are never
                shown to your employer.
              </P>
              <Field label="Team code (optional)">
                <input
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value)}
                  placeholder="e.g. demo"
                  className="w-full px-4 py-3 rounded-xl text-[15px]"
                  style={{ background: "var(--bg-page)", border: "1px solid var(--border-soft)" }}
                />
              </Field>
              {teamCode.trim() && (
                <Field label="Work email">
                  <input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-xl text-[15px]"
                    style={{ background: "var(--bg-page)", border: "1px solid var(--border-soft)" }}
                  />
                  <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                    Only used to match a later retake to this one, and to remind you of what you said
                    you&apos;d try. It&apos;s scrambled before it&apos;s stored and never appears on the
                    team report.
                  </span>
                </Field>
              )}
              {error && <ErrorLine>{error}</ErrorLine>}
              <Primary onClick={start} disabled={busy}>
                {busy ? "One moment…" : "Start"}
              </Primary>
            </Card>
          )}

          {phase === "checkin" && prior && (
            <Card>
              <Eyebrow>Before we start</Eyebrow>
              <H1>Last time, you said you&apos;d try this</H1>
              <blockquote
                className="px-5 py-4 rounded-xl mb-6 text-[16px] leading-relaxed"
                style={{ background: "var(--bg-page)", border: "1px solid var(--border-soft)", color: "var(--navy)" }}
              >
                {prior.commitment}
              </blockquote>
              <P>Did you do it? There&apos;s no wrong answer and nobody sees your name against it.</P>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  { v: "yes", label: "Yes, I did it" },
                  { v: "partly", label: "Partly" },
                  { v: "no", label: "No, it didn't happen" },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => {
                      setPriorOutcome(o.v);
                      setPhase("questions");
                    }}
                    className="text-left px-5 py-4 rounded-xl text-[15px]"
                    style={{ background: "var(--bg-page)", border: "1px solid var(--border-soft)", color: "var(--text)" }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {phase === "questions" && (
            <>
              <div className="mb-6">
                <ProgressBar current={idx + 1} total={FLUENCY_QUESTIONS.length} />
              </div>
              <FluencyQuestionCard
                question={q}
                currentChoice={answers[q.id]?.score}
                onChoose={choose}
                onBack={idx > 0 ? () => setIdx(idx - 1) : null}
              />
            </>
          )}

          {phase === "commit" && (
            <Card>
              <Eyebrow>One last thing</Eyebrow>
              <H1>What&apos;s one thing you&apos;ll try in the next two weeks?</H1>
              <P>
                Be specific and make it small. &quot;Use AI more&quot; never happens. &quot;Draft the
                Monday status update with it&quot; does. If you take this again, we&apos;ll show you
                what you wrote and ask whether it happened.
              </P>
              <textarea
                value={commitment}
                onChange={(e) => setCommitment(e.target.value)}
                rows={3}
                placeholder="One specific thing, on a task you already do"
                className="w-full px-4 py-3 rounded-xl text-[15px] mb-2"
                style={{ background: "var(--bg-page)", border: "1px solid var(--border-soft)" }}
              />
              <P muted>You can skip this, but the people who write something down are the ones who do it.</P>
              {error && <ErrorLine>{error}</ErrorLine>}
              <Primary onClick={finish} disabled={busy}>
                {busy ? "Saving…" : "See my result"}
              </Primary>
            </Card>
          )}

          {phase === "result" && result && (
            <Card>
              <Eyebrow>Your result</Eyebrow>
              <H1>{result.level.name}</H1>
              <P>{result.level.paragraph}</P>

              <div className="flex flex-col gap-4 my-8">
                {(
                  [
                    ["J", result.judgment],
                    ["V", result.verification],
                    ["D", result.delegation],
                  ] as const
                ).map(([dim, score]) => (
                  <div key={dim}>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-[15px] font-medium" style={{ color: "var(--navy)" }}>
                        {DIMENSIONS[dim].name}
                      </span>
                      <span className="text-[13px] tabular-nums" style={{ color: "var(--text-muted)" }}>
                        {score} / 12
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border-soft)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(score / 12) * 100}%`,
                          background: dim === result.weakest ? "var(--accent)" : "var(--navy)",
                        }}
                      />
                    </div>
                    <p className="text-[13px] mt-1" style={{ color: "var(--text-muted)" }}>
                      {DIMENSIONS[dim].blurb}
                    </p>
                  </div>
                ))}
              </div>

              <div
                className="px-5 py-4 rounded-xl mb-6"
                style={{ background: "var(--bg-page)", border: "1px solid var(--border-soft)" }}
              >
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-mid)" }}>
                  <strong style={{ color: "var(--navy)" }}>Where you&apos;d gain the most:</strong>{" "}
                  {DIMENSIONS[result.weakest].name.toLowerCase()}. {DIMENSIONS[result.weakest].blurb}
                </p>
              </div>

              {commitment.trim() && (
                <div
                  className="px-5 py-4 rounded-xl mb-6"
                  style={{ background: "var(--navy)", color: "#f5f3ef" }}
                >
                  <p className="text-[13px] uppercase tracking-[0.16em] font-semibold mb-2" style={{ opacity: 0.7 }}>
                    You said you&apos;d try
                  </p>
                  <p className="text-[15px] leading-relaxed">{commitment}</p>
                  <p className="text-[13px] mt-3" style={{ opacity: 0.7 }}>
                    Put fifteen minutes on your calendar for it before you close this tab. That single
                    step is the difference between the people who move and the people who don&apos;t.
                  </p>
                </div>
              )}

              <P muted>
                Nobody sees your individual answers. If you entered a team code, your result joins the
                team&apos;s summary once at least five people have responded.
              </P>
              <Link href="/" className="text-base font-semibold underline" style={{ color: "var(--accent)" }}>
                ← West Product Development LLC
              </Link>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

function TopBar() {
  return (
    <header className="w-full px-6 py-4 border-b" style={{ borderColor: "var(--border-soft)" }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
          ← West Product Development LLC
        </Link>
        <span className="text-[11px] tracking-[0.18em] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
          Fluency check
        </span>
      </div>
    </header>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full rounded-2xl px-6 py-8 sm:px-10 sm:py-10"
      style={{ background: "var(--bg-card)", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-soft)" }}
    >
      {children}
    </div>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-3" style={{ color: "var(--accent)" }}>
      {children}
    </p>
  );
}
function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1
      className="font-semibold mb-4 leading-snug"
      style={{ color: "var(--navy)", fontSize: "clamp(22px, 3.4vw, 30px)", letterSpacing: "-0.01em" }}
    >
      {children}
    </h1>
  );
}
function P({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p className="text-[15px] leading-relaxed mb-5" style={{ color: muted ? "var(--text-muted)" : "var(--text-mid)" }}>
      {children}
    </p>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2 mb-5">
      <span className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      {children}
    </label>
  );
}
function ErrorLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm mb-4" style={{ color: "#b3261e" }}>
      {children}
    </p>
  );
}
function Primary({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-[15px] disabled:opacity-60"
      style={{ background: "var(--navy)", color: "#f5f3ef" }}
    >
      {children}
      <span aria-hidden="true">→</span>
    </button>
  );
}
