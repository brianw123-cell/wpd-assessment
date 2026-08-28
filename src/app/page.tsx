import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="w-full px-6 py-4 border-b" style={{ borderColor: "var(--border-soft)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--navy)" }}>
            West Product Development LLC
          </span>
          <span className="text-[11px] tracking-[0.18em] font-semibold uppercase" style={{ color: "var(--text-muted)" }}>
            Two free tools
          </span>
        </div>
      </header>

      <main id="main" className="flex-1 flex items-start justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[12px] tracking-[0.22em] font-medium uppercase mb-4" style={{ color: "var(--accent)" }}>
              Two free tools from West Product Development LLC
            </p>
            <h1
              className="font-semibold leading-[1.1] tracking-[-0.02em] mb-4"
              style={{ fontSize: "clamp(30px, 5vw, 46px)", color: "var(--navy)" }}
            >
              A quick honest read on where you stand with AI
            </h1>
            <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "var(--text-mid)" }}>
              Pick one. Both are free and fast, and we don&apos;t add you to any email list.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ProductCard
              tag="For business owners"
              title="AI Readiness for your business"
              body="Fifteen questions, about four minutes. You'll get your score, where you'd hit friction, and one specific place to start."
              detail="Anonymous until the last step — you only share your email if you want the full breakdown."
              cta="See where you stand"
              href="/assessment"
            />
            <ProductCard
              tag="For teams"
              title="Where your team is with AI"
              body="Ten questions, about three minutes. You'll get a stage on the change curve and one honest paragraph."
              detail="If your team runs it together, a manager can see the roll-up. Individual answers are never shown to your employer."
              cta="Take the change curve"
              href="/curve"
              secondaryCta={{ label: "Set up a team →", href: "/team/new" }}
              variant="alt"
            />
          </div>

          <p className="mt-14 text-center text-xs" style={{ color: "var(--text-muted)" }}>
            Your answers land in our own database, not a third-party form service. We don&apos;t sell your
            information and we don&apos;t add you to anything you didn&apos;t ask for.
          </p>
        </div>
      </main>

      <footer className="pt-4 pb-8 text-center text-xs flex flex-col gap-2" style={{ color: "var(--text-muted)" }}>
        <span>
          <Link href="/tour" className="underline" style={{ color: "var(--accent)" }}>
            Take the guided tour
          </Link>
        </span>
        <span>&copy; West Product Development LLC</span>
      </footer>
    </div>
  );
}

function ProductCard({
  tag,
  title,
  body,
  detail,
  cta,
  href,
  variant = "default",
  secondaryCta,
}: {
  tag: string;
  title: string;
  body: string;
  detail: string;
  cta: string;
  href: string;
  variant?: "default" | "alt";
  secondaryCta?: { label: string; href: string };
}) {
  const isAlt = variant === "alt";
  return (
    <div
      className="rounded-2xl px-7 py-8 flex flex-col"
      style={{
        background: isAlt ? "var(--navy)" : "var(--bg-card)",
        color: isAlt ? "#f5f3ef" : "var(--text)",
        boxShadow: "var(--shadow-card)",
        border: isAlt ? "1px solid var(--navy)" : "1px solid var(--border-soft)",
      }}
    >
      <p
        className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-3"
        style={{ color: isAlt ? "var(--slate)" : "var(--accent)" }}
      >
        {tag}
      </p>
      <h2
        className="font-semibold mb-3 leading-tight"
        style={{
          color: isAlt ? "#f5f3ef" : "var(--navy)",
          fontSize: "clamp(22px, 2.6vw, 28px)",
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </h2>
      <p
        className="text-[15px] leading-relaxed mb-3"
        style={{ color: isAlt ? "rgba(245,243,239,0.9)" : "var(--text-mid)" }}
      >
        {body}
      </p>
      <p
        className="text-[13px] leading-snug mb-6"
        style={{ color: isAlt ? "rgba(245,243,239,0.65)" : "var(--text-muted)" }}
      >
        {detail}
      </p>
      <div className="mt-auto flex items-center gap-4 flex-wrap">
        <Link
          href={href}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-[15px] tracking-wide transition-transform hover:-translate-y-[1px]"
          style={{
            background: isAlt ? "#f5f3ef" : "var(--navy)",
            color: isAlt ? "var(--navy)" : "#f5f3ef",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
          }}
        >
          {cta}
          <span aria-hidden="true">→</span>
        </Link>
        {secondaryCta && (
          <Link
            href={secondaryCta.href}
            className="text-sm font-medium underline"
            style={{ color: isAlt ? "rgba(245,243,239,0.9)" : "var(--accent)" }}
          >
            {secondaryCta.label}
          </Link>
        )}
      </div>
    </div>
  );
}
