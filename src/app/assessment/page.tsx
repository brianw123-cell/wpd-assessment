"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import Link from "next/link";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard from "@/components/QuestionCard";
import EmailGate, { type LeadInfo } from "@/components/EmailGate";
import Results from "@/components/Results";
import { QUESTIONS, TOTAL_QUESTIONS } from "@/lib/questions";
import { computeResult } from "@/lib/scoring";
import type {
  Answer,
  AnswersMap,
  Question,
  QuestionId,
  Result,
} from "@/types/assessment";
import { startAssessment, saveProgress, submitAssessment } from "@/lib/queries";

type Phase = "questions" | "email" | "results";

type State = {
  index: number;
  answers: AnswersMap;
  phase: Phase;
};

type Action =
  | { type: "answer_choice"; id: QuestionId; score: 0 | 1 | 2 | 3 }
  | { type: "answer_text"; value: string }
  | { type: "next" }
  | { type: "back" }
  | { type: "go_to_email" }
  | { type: "go_to_results" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "answer_choice": {
      const answer: Answer = { id: action.id, type: "choice", score: action.score };
      return { ...state, answers: { ...state.answers, [action.id]: answer } };
    }
    case "answer_text": {
      const answer: Answer = { id: "E2", type: "text", value: action.value };
      return { ...state, answers: { ...state.answers, E2: answer } };
    }
    case "next": {
      const next = state.index + 1;
      if (next >= TOTAL_QUESTIONS) {
        return { ...state, phase: "email" };
      }
      return { ...state, index: next };
    }
    case "back": {
      const prev = Math.max(0, state.index - 1);
      return { ...state, index: prev, phase: "questions" };
    }
    case "go_to_email":
      return { ...state, phase: "email" };
    case "go_to_results":
      return { ...state, phase: "results" };
  }
}

export default function AssessmentPage() {
  const [state, dispatch] = useReducer(reducer, {
    index: 0,
    answers: {},
    phase: "questions",
  });
  const [rowInitialized, setRowInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  // Ensure we have a DB row as soon as the user starts answering
  // (so an abandon is still captured as a partial).
  useEffect(() => {
    if (rowInitialized) return;
    if (Object.keys(state.answers).length === 0) return;
    const source =
      typeof window !== "undefined" ? document.referrer || null : null;
    const ua = typeof window !== "undefined" ? window.navigator.userAgent : "";
    startAssessment(state.answers, {
      source: source ?? undefined,
      user_agent: ua,
    }).then((id) => {
      if (id) setRowInitialized(true);
    });
  }, [state.answers, rowInitialized]);

  // Every time the answers change (after the first), persist a partial.
  useEffect(() => {
    if (!rowInitialized) return;
    const t = setTimeout(() => {
      saveProgress(state.answers);
    }, 400);
    return () => clearTimeout(t);
  }, [state.answers, rowInitialized]);

  const currentQuestion: Question | undefined = QUESTIONS[state.index];

  const handleChoose = (id: QuestionId, score: 0 | 1 | 2 | 3) => {
    dispatch({ type: "answer_choice", id, score });
    // Auto-advance after a short beat so the selection reads
    setTimeout(() => dispatch({ type: "next" }), 260);
  };

  const handleText = (value: string) => {
    dispatch({ type: "answer_text", value });
  };

  const handleTextNext = () => {
    dispatch({ type: "next" });
  };

  const handleBack = () => {
    dispatch({ type: "back" });
  };

  const handleLeadSubmit = async (lead: LeadInfo) => {
    setIsSubmitting(true);
    try {
      const computed = computeResult(state.answers);
      const ok = await submitAssessment({
        answers: state.answers,
        lead,
        result: computed,
      });
      if (!ok) {
        // Still show the result even if the DB write failed — degrade gracefully
        console.warn("Submission write failed; showing local result anyway.");
      }
      setResult(computed);
      dispatch({ type: "go_to_results" });
      // Scroll to top to reveal results properly
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <TopBar phase={state.phase} />

      <main id="main" className="flex-1 flex items-start justify-center px-4 sm:px-6 py-8 sm:py-12">
        {state.phase === "questions" && currentQuestion && (
          <div className="w-full max-w-2xl mx-auto">
            <div className="mb-6 px-1">
              <ProgressBar current={state.index + 1} total={TOTAL_QUESTIONS} />
            </div>
            <QuestionCard
              question={currentQuestion}
              currentChoice={
                pickChoiceScore(state.answers[currentQuestion.id])
              }
              currentText={pickTextValue(state.answers.E2)}
              onChoose={(score) =>
                currentQuestion.type === "choice" &&
                handleChoose(currentQuestion.id, score)
              }
              onText={handleText}
              onTextNext={handleTextNext}
              onBack={state.index > 0 ? handleBack : null}
            />
          </div>
        )}

        {state.phase === "email" && (
          <EmailGate onSubmit={handleLeadSubmit} isSubmitting={isSubmitting} />
        )}

        {state.phase === "results" && result && <Results result={result} />}
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
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
          style={{ color: "var(--accent)" }}
        >
          <span aria-hidden="true">←</span>
          West Product Development LLC
        </Link>
        <span
          className="text-[11px] tracking-[0.18em] font-semibold uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          {phaseLabel(phase)}
        </span>
      </div>
    </header>
  );
}

function phaseLabel(p: Phase): string {
  if (p === "questions") return "AI Readiness Assessment";
  if (p === "email") return "One more step";
  return "Your Result";
}

function pickChoiceScore(a: Answer | undefined): 0 | 1 | 2 | 3 | undefined {
  if (!a || a.type !== "choice") return undefined;
  return a.score;
}
function pickTextValue(a: Answer | undefined): string | undefined {
  if (!a || a.type !== "text") return undefined;
  return a.value;
}
