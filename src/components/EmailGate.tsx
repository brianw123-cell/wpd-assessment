"use client";

import { useState } from "react";

export type LeadInfo = {
  name: string;
  email: string;
  company: string;
  role: string;
};

export default function EmailGate({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (lead: LeadInfo) => void;
  isSubmitting: boolean;
}) {
  const [lead, setLead] = useState<LeadInfo>({
    name: "",
    email: "",
    company: "",
    role: "",
  });
  const canSubmit =
    lead.name.trim() && lead.email.trim() && lead.company.trim() && lead.role.trim();

  return (
    <div
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
        Almost done
      </p>
      <h2
        className="font-semibold leading-tight mb-3"
        style={{
          color: "var(--navy)",
          fontSize: "clamp(22px, 2.6vw, 28px)",
          letterSpacing: "-0.01em",
        }}
      >
        Where should we send the breakdown?
      </h2>
      <p className="text-sm mb-8" style={{ color: "var(--text-mid)" }}>
        We&apos;ll email you the full breakdown. We don&apos;t sell your
        information and we don&apos;t add you to anything you didn&apos;t
        ask for.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit && !isSubmitting) onSubmit(lead);
        }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <Field
          label="Your name"
          value={lead.name}
          onChange={(v) => setLead({ ...lead, name: v })}
          type="text"
          autoComplete="name"
        />
        <Field
          label="Email"
          value={lead.email}
          onChange={(v) => setLead({ ...lead, email: v })}
          type="email"
          autoComplete="email"
        />
        <Field
          label="Company"
          value={lead.company}
          onChange={(v) => setLead({ ...lead, company: v })}
          type="text"
          autoComplete="organization"
        />
        <Field
          label="Your role"
          value={lead.role}
          onChange={(v) => setLead({ ...lead, role: v })}
          type="text"
          placeholder="Owner, GM, Ops lead…"
          autoComplete="organization-title"
        />

        <div className="sm:col-span-2 flex justify-end pt-3">
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-medium text-base tracking-wide transition-all"
            style={{
              background: canSubmit ? "var(--navy)" : "var(--slate)",
              boxShadow: canSubmit
                ? "0 4px 14px rgba(30,45,66,0.18)"
                : "none",
              opacity: canSubmit && !isSubmitting ? 1 : 0.6,
              cursor: canSubmit && !isSubmitting ? "pointer" : "not-allowed",
            }}
          >
            {isSubmitting ? "Scoring…" : "See my results →"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  placeholder,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span
        className="text-xs font-medium tracking-wide"
        style={{ color: "var(--text-mid)" }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg px-4 py-3 text-base border-2 focus:outline-none"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border-soft)",
          color: "var(--text)",
        }}
      />
    </label>
  );
}
