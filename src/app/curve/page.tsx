"use client";

import { useReducer, useState } from "react";
import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import CurveQuestionCard from "@/components/CurveQuestionCard";
import CurveResults from "@/components/CurveResults";
import { CURVE_QUESTIONS, CURVE_TOTAL_QUESTIONS } from "@/lib/curve-questions";
import { computeCurveResult, participantHash } from "@/lib/curve-scoring";
import { submitCurveResponse } from "@/lib/curve-queries";
import type {
  CurveAnswer,
  CurveAnswersMap,
  CurveQuestion,
  CurveQuestionId,
  CurveResult,
} from "@/types/curve";

type Phase = "intro" | "questions" | "result";

type State = {
  phase: Phase;
  index: number;
  answers: CurveAnswersMap;
};

type Action =
  | { type: "start" }
  | { type: "answer_choice"; id: CurveQuestionId; score: 0 | 1 | 2 | 3 }
  | { type: "answer_text"; value: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "go_to_result" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "start":
      return { ...state, phase: "questions", index: 0 };
    case "answer_choice": {
      const answer: CurveAnswer = { id: action.id, type: "choice", score: action.score };
      return { ...state, answers: { ...state.answers, [action.id]: answer } };
    }
    case "answer_text": {
      const answer: CurveAnswer = { id: "C6", type: "text", value: action.value };
      return { ...state, answers: { ...state.answers, C6: answer } };
    }
    case "next": {
      const next = state.index + 1;
      if (next >= CURVE_TOTAL_QUESTIONS) return { ...state, phase: "result" };
      return { ...state, index: next };
    }
    case "back": {
      const prev = Math.max(0, state.index - 1);
      return { ...state, index: prev, phase: "questions" };
    }
    case "go_to_result":
      return { ...state, phase: "result" };
  }
}

export default function CurvePage() {
  const [state, dispatch] = useReducer(reducer, {
    phase: "intro",
    index: 0,
    answers: {},
  });
  const [teamCode, setTeamCode] = useState("");
  const [participantId, setParticipantId] = useState(""); // email OR any string; hashed
  const [result, setResult] = useState<CurveResult | null>(null);
  const [addedToTeam, setAddedToTeam] = useState(false);
  const [teamCodeError, setTeamCodeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion: CurveQuestion | undefined = CURVE_QUESTIONS[state.index];

  const handleChoose = (id: CurveQuestionId, score: 0 | 1 | 2 | 3) => {
    dispatch({ type: "answer_choice", id, score });
    setTimeout(() => dispatch({ type: "next" }), 260);
  };

  const handleTextNext = async () => {
    dispatch({ type: "next" });
  };

  const handleBack = () => dispatch({ type: "back" });

  // Fires when we transition into result phase (via last question)
  const submitIfNeeded = async () => {
    if (result || submitting) return;
    setSubmitting(true);
    try {
      const computed = computeCurveResult(state.answers);
      const trimmedCode = teamCode.trim().toLowerCase() || null;
      let pHash: string | null = null;
      if (trimmedCode && participantId.trim().length > 0) {
        pHash = await participantHash(participantId, trimmedCode);
      }
      const submission = await submitCurveResponse({
        teamCode: trimmedCode,
        participantHash: pHash,
        answers: state.answers,
        result: computed,
        createdFrom: "individual",
      });

      // If they typed a team code but the team doesn't exist, retry as an
      // anonymous individual take and warn them clearly. Silently dropping
      // their answers is the worst outcome.
      if (trimmedCode && !submission.ok && submission.error === "team_not_found") {
        setTeamCodeError(
          `We couldn't find a team with the code "${trimmedCode}". Your answers were saved as an anonymous individual take instead.`
        );
        await submitCurveResponse({
          teamCode: null,
          participantHash: null,
          answers: state.answers,
          result: computed,
          createdFrom: "individual",
        });
      }
      setResult(computed);
      setAddedToTeam(!!(trimmedCode && submission.ok));
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  if (state.phase === "result" && !result && !submitting) {
    void submitIfNeeded();
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <TopBar phase={state.phase} />

      <main id="main" className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
        {state.phase === "intro" && (
          <div className="w-full max-w-xl mx-auto text-center">
            <p
              className="text-[12px] tracking-[0.22em] font-medium uppercase mb-4"
              style={{ color: "var(--accent)" }}
            >
              A free tool from West Product Development LLC
            </p>
            <h1
              className="font-semibold leading-[1.1] tracking-[-0.02em] mb-6"
              style={{ fontSize: "clamp(30px, 5vw, 46px)", color: "var(--navy)" }}
            >
              Where you are with AI at work
            </h1>
            <p className="text-lg leading-relaxed mb-2" style={{ color: "var(--text-mid)" }}>
              Ten questions, about three minutes. You&apos;ll get a stage and one short paragraph honest enough
              to be useful.
            </p>
            <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
              Anonymous. If your team is running this together, put in the team code below and your answer joins
              the roll-up. Your individual answers are never shown to your employer.
            </p>

            <div className="text-left rounded-xl px-5 py-5 mb-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-soft)" }}>
              <label className="flex flex-col gap-2 mb-4">
                <span className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--text-muted)" }}>
                  Team code (optional)
                </span>
                <input
                  type="text"
                  value={teamCode}
                  onChange={(e) => setTeamCode(e.target.value)}
                  placeholder="e.g. demo"
                  className="rounded-lg px-4 py-3 text-base border-2 focus:outline-none"
                  style={{
                    background: "var(--bg-alt)",
                    borderColor: "var(--border-soft)",
                    color: "var(--text)",
                  }}
                />
              </label>
              {teamCode.trim().length > 0 && (
                <label className="flex flex-col gap-2">
                  <span className="text-xs font-medium tracking-wide uppercase" style={{ color: "var(--text-muted)" }}>
                    Your email (required so we can match your retake)
                  </span>
                  <input
                    type="email"
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                    placeholder="you@work.com"
                    required
                    className="rounded-lg px-4 py-3 text-base border-2 focus:outline-none"
                    style={{
                      background: "var(--bg-alt)",
                      borderColor: "var(--border-soft)",
                      color: "var(--text)",
                    }}
                  />
                  <span className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
                    We hash this immediately. Your email is never stored next to your answers, and
                    your employer will never see it. Without it, we can&apos;t connect your Round 2
                    answer back to Round 1.
                  </span>
                </label>
              )}
            </div>

            <button
              type="button"
              onClick={() => dispatch({ type: "start" })}
              disabled={teamCode.trim().length > 0 && !isValidEmail(participantId)}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-medium text-base tracking-wide transition-transform hover:-translate-y-[1px]"
              style={{
                background: "var(--navy)",
                boxShadow: "0 4px 14px rgba(30,45,66,0.18)",
                opacity: teamCode.trim().length > 0 && !isValidEmail(participantId) ? 0.5 : 1,
                cursor: teamCode.trim().length > 0 && !isValidEmail(participantId) ? "not-allowed" : "pointer",
              }}
            >
              Start
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}

        {state.phase === "questions" && currentQuestion && (
          <div className="w-full max-w-2xl mx-auto">
            <div className="mb-6 px-1">
              <ProgressBar current={state.index + 1} total={CURVE_TOTAL_QUESTIONS} />
            </div>
            <CurveQuestionCard
              question={currentQuestion}
              currentChoice={pickChoiceScore(state.answers[currentQuestion.id])}
              currentText={pickTextValue(state.answers.C6)}
              onChoose={(score) =>
                currentQuestion.type === "choice" &&
                handleChoose(currentQuestion.id, score)
              }
              onText={(v) => dispatch({ type: "answer_text", value: v })}
              onTextNext={handleTextNext}
              onBack={state.index > 0 ? handleBack : null}
            />
          </div>
        )}

        {state.phase === "result" && (
          <>
            {submitting || !result ? (
              <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                Scoring…
              </div>
            ) : (
              <CurveResults
                result={result}
                teamCode={teamCode.trim().toLowerCase() || null}
                addedToTeam={addedToTeam}
                teamCodeError={teamCodeError}
              />
            )}
          </>
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

function TopBar({ phase }: { phase: Phase }) {
  return (
    <header className="w-full px-6 py-4 border-b" style={{ borderColor: "var(--border-soft)" }}>
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight"
          style={{ color: "var(--navy)" }}
        >
          West Product Development LLC
        </Link>
        <span
          className="text-[11px] tracking-[0.18em] font-semibold uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          {phase === "intro" ? "AI Change Curve" : phase === "questions" ? "Change Curve" : "Your stage"}
        </span>
      </div>
    </header>
  );
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function pickChoiceScore(a: CurveAnswer | undefined): 0 | 1 | 2 | 3 | undefined {
  if (!a || a.type !== "choice") return undefined;
  return a.score;
}
function pickTextValue(a: CurveAnswer | undefined): string | undefined {
  if (!a || a.type !== "text") return undefined;
  return a.value;
}
