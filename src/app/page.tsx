import Link from "next/link";

export default function LandingPage() {
  return (
    <main id="main" className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl mx-auto text-center">
        <p
          className="text-[12px] tracking-[0.22em] font-medium uppercase mb-4"
          style={{ color: "var(--accent)" }}
        >
          A free tool from West Product Development LLC
        </p>

        <h1
          className="font-semibold leading-[1.1] tracking-[-0.02em] mb-6"
          style={{ fontSize: "clamp(34px, 5.5vw, 52px)", color: "var(--navy)" }}
        >
          How ready is your
          <br />
          business for AI?
        </h1>

        <p
          className="text-lg leading-relaxed mb-3"
          style={{ color: "var(--text-mid)" }}
        >
          Fifteen questions, about four minutes. You&apos;ll get your score,
          where you&apos;d hit friction, and one specific place to start.
        </p>

        <p className="text-sm mb-10" style={{ color: "var(--text-muted)" }}>
          Free. Anonymous until the last step — you only share your email if
          you want the full breakdown.
        </p>

        <Link
          href="/assessment"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-medium text-base tracking-wide transition-transform hover:-translate-y-[1px]"
          style={{
            background: "var(--navy)",
            boxShadow: "0 4px 14px rgba(30,45,66,0.18)",
          }}
        >
          See where you stand
          <span aria-hidden="true">→</span>
        </Link>

        <p className="mt-16 text-xs" style={{ color: "var(--text-muted)" }}>
          Your answers land in our own database, not a third-party form
          service. We&apos;ll email you the full breakdown. We don&apos;t sell
          your information and we don&apos;t add you to anything you
          didn&apos;t ask for.
        </p>
      </div>
    </main>
  );
}
