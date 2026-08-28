"use client";

import { DIMENSIONS } from "@/lib/fluency-questions";
import type { FluencyQuestion } from "@/types/fluency";

type Props = {
  question: FluencyQuestion;
  currentChoice?: 0 | 1 | 2 | 3;
  onChoose: (score: 0 | 1 | 2 | 3) => void;
  onBack: (() => void) | null;
};

export default function FluencyQuestionCard({ question, currentChoice, onChoose, onBack }: Props) {
  return (
    <div
      key={question.id}
      className="q-fade-in w-full max-w-2xl mx-auto rounded-2xl px-6 py-8 sm:px-10 sm:py-10"
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
        {DIMENSIONS[question.dim].name}
      </p>
      <h2
        className="font-semibold mb-7 leading-snug"
        style={{ color: "var(--navy)", fontSize: "clamp(20px, 3vw, 26px)", letterSpacing: "-0.01em" }}
      >
        {question.prompt}
      </h2>
      <div className="flex flex-col gap-3">
        {question.options.map((o) => {
          const selected = currentChoice === o.score;
          return (
            <button
              key={o.score}
              type="button"
              onClick={() => onChoose(o.score)}
              className="text-left px-5 py-4 rounded-xl text-[15px] leading-snug transition-colors"
              style={{
                background: selected ? "var(--navy)" : "var(--bg-page)",
                color: selected ? "#f5f3ef" : "var(--text)",
                border: `1px solid ${selected ? "var(--navy)" : "var(--border-soft)"}`,
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-sm underline"
          style={{ color: "var(--text-muted)" }}
        >
          ← Back
        </button>
      )}
    </div>
  );
}
