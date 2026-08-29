import Link from "next/link";

const STOPS = [
  {
    n: "1",
    tag: "The newest one",
    title: "Team AI fluency check",
    body: "Twelve questions on judgment, verification and delegation. Nothing about how many tools you use.",
    href: "/fluency",
    cta: "Take it",
  },
  {
    n: "2",
    tag: "What a manager sees",
    title: "The fluency team report",
    body: "Twenty-two people, two rounds, and a number for how many did what they said they would.",
    href: "/fluency/team/demo",
    cta: "Open it",
  },
  {
    n: "3",
    tag: "What a participant sees",
    title: "The change curve",
    body: "Ten questions scoring usage and confidence separately, so they don't average each other out.",
    href: "/curve",
    cta: "Take it",
  },
  {
    n: "4",
    tag: "What a manager sees",
    title: "The change curve roll-up",
    body: "Look at the cluster in the lower right: daily users who don't trust it. Dashboards count them as wins.",
    href: "/team/demo",
    cta: "Open it",
  },
  {
    n: "5",
    tag: "What changes over time",
    title: "The retake",
    body: "Same team sixty days later. Switch rounds with the buttons at the top of the report.",
    href: "/team/demo",
    cta: "Open it",
  },
  {
    n: "6",
    tag: "The owner's view",
    title: "Across every team",
    body: "What I'd see running this at many companies at once. Sample data only.",
    href: "/admin/sample",
    cta: "Open it",
  },
  {
    n: "7",
    tag: "For a business owner",
    title: "AI readiness assessment",
    body: "Fifteen questions aimed at whoever runs the company rather than at a team.",
    href: "/assessment",
    cta: "Take it",
  },
];

export default function TourPage() {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <main id="main" className="flex-1 px-4 sm:px-8 py-5">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-3">
            <h1
              className="font-semibold leading-tight tracking-[-0.02em]"
              style={{ fontSize: "clamp(24px, 3.4vw, 34px)", color: "var(--navy)" }}
            >
              Seven links, in order
            </h1>
            <p className="text-[15px]" style={{ color: "var(--text-mid)" }}>
              Nothing asks for a password or an email. Every name and answer is made up.
            </p>
          </div>

          <ol className="flex flex-col gap-[6px]">
            {STOPS.map((s) => (
              <li key={s.n}>
                <Link
                  href={s.href}
                  className="group flex items-center gap-4 sm:gap-6 rounded-xl px-4 sm:px-6 py-[31px] transition-transform hover:-translate-y-[1px]"
                  style={{
                    background: "var(--bg-card)",
                    boxShadow: "var(--shadow-card)",
                    border: "1px solid var(--border-soft)",
                  }}
                >
                  <span
                    className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-semibold text-[15px]"
                    style={{ background: "var(--navy)", color: "#f5f3ef" }}
                  >
                    {s.n}
                  </span>

                  <span className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-baseline sm:gap-4">
                    <span className="flex flex-col min-w-0 sm:w-[15rem] sm:shrink-0">
                      <span
                        className="text-[10px] tracking-[0.16em] font-semibold uppercase"
                        style={{ color: "var(--accent)" }}
                      >
                        {s.tag}
                      </span>
                      <span className="font-semibold text-[17px] leading-tight" style={{ color: "var(--navy)" }}>
                        {s.title}
                      </span>
                    </span>
                    <span className="text-[14px] leading-snug min-w-0" style={{ color: "var(--text-mid)" }}>
                      {s.body}
                    </span>
                  </span>

                  <span
                    className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-[14px]"
                    style={{ background: "var(--bg-page)", color: "var(--navy)", border: "1px solid var(--border-soft)" }}
                  >
                    {s.cta}
                    <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <p className="mt-3">
            <Link href="/" className="text-[15px] font-semibold underline" style={{ color: "var(--accent)" }}>
              ← West Product Development LLC
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
