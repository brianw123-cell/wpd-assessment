"use client";

import { useEffect, useRef, useState } from "react";
import type { CurveQuestion, CurveChoice } from "@/types/curve";

type Props = {
  question: CurveQuestion;
  currentChoice?: 0 | 1 | 2 | 3;
  currentText?: string;
  onChoose: (score: 0 | 1 | 2 | 3) => void;
  onText: (value: string) => void;
  onTextNext: () => void;
  onBack: (() => void) | null;
};

export default function CurveQuestionCard({
  question,
  currentChoice,
  currentText,
  onChoose,
  onText,
  onTextNext,
  onBack,
}: Props) {
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
        {axisLabel(question.axis, question.id)}
      </p>

      <h2
        className="font-semibold leading-tight mb-8"
        style={{
          color: "var(--navy)",
          fontSize: "clamp(20px, 2.4vw, 26px)",
          letterSpacing: "-0.01em",
        }}
      >
        {question.prompt}
      </h2>

      {question.type === "choice" ? (
        <ChoiceGrid
          options={question.options}
          current={currentChoice}
          onChoose={onChoose}
        />
      ) : (
        <TextField
          value={currentText ?? ""}
          placeholder={question.placeholder}
          onChange={onText}
          onNext={onTextNext}
        />
      )}

      {onBack && (
        <div className="mt-8 pt-6 border-t" style={{ borderColor: "var(--border-soft)" }}>
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}

function ChoiceGrid({
  options,
  current,
  onChoose,
}: {
  options: CurveChoice[];
  current?: 0 | 1 | 2 | 3;
  onChoose: (score: 0 | 1 | 2 | 3) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => {
        const selected = current === opt.score;
        return (
          <button
            key={opt.score}
            type="button"
            onClick={() => onChoose(opt.score)}
            className="text-left w-full rounded-xl px-5 py-4 transition-all border-2"
            style={{
              background: selected ? "var(--bg-alt)" : "var(--bg-card)",
              borderColor: selected ? "var(--accent)" : "var(--border-soft)",
              color: "var(--text)",
            }}
            onMouseEnter={(e) => {
              if (!selected) {
                e.currentTarget.style.borderColor = "var(--slate)";
                e.currentTarget.style.background = "#fafaf7";
              }
            }}
            onMouseLeave={(e) => {
              if (!selected) {
                e.currentTarget.style.borderColor = "var(--border-soft)";
                e.currentTarget.style.background = "var(--bg-card)";
              }
            }}
          >
            <span className="text-base sm:text-[17px] leading-snug">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TextField({
  value,
  placeholder,
  onChange,
  onNext,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onNext: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div>
      <textarea
        ref={ref}
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-xl px-4 py-3 text-base border-2 focus:outline-none"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-soft)",
          color: "var(--text)",
          resize: "vertical",
        }}
      />
      <div className="flex justify-between items-center mt-4">
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          You can leave this blank if you&apos;d rather not answer.
        </span>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium text-sm tracking-wide transition-transform hover:-translate-y-[1px]"
          style={{
            background: "var(--navy)",
            boxShadow: "0 4px 14px rgba(30,45,66,0.18)",
          }}
        >
          Finish →
        </button>
      </div>
    </div>
  );
}

function axisLabel(axis: "U" | "C", id: string): string {
  if (id === "C6") return "For your leadership";
  return axis === "U" ? "How you use it" : "How you feel about it";
}
