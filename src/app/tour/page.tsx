import Link from "next/link";

const STOPS = [
  {
    n: "1",
    tag: "The newest one",
    title: "Team AI fluency check",
    body: "Twelve questions that ask nothing about how many tools you use. It measures judgment, verification and delegation, because that is what companies actually mean when they write down a definition of fluency. At the end you write one thing you will try.",
    href: "/fluency",
    cta: "Take the fluency check",
  },
  {
    n: "2",
    tag: "What a manager sees",
    title: "The fluency team report",
    body: "Twenty-two people across two rounds. The distribution moved, the weakest behavior is named, and there is a number for how many people did the thing they wrote down last time. That last number is the one leadership asks for and nobody can answer.",
    href: "/fluency/team/demo",
    cta: "Open the fluency report",
  },
  {
    n: "3",
    tag: "What a participant sees",
    title: "Take it yourself",
    body: "Ten questions, about three minutes. It scores two things separately: how much you actually use AI, and how you feel about it.",
    href: "/curve",
    cta: "Start the change curve",
  },
  {
    n: "4",
    tag: "What a manager sees",
    title: "The team roll-up",
    body: "A seeded team of twenty-two. Look at the cluster in the lower right — people using AI daily who don't trust it. Every adoption dashboard counts them as a win.",
    href: "/team/demo",
    cta: "Open the team view",
  },
  {
    n: "5",
    tag: "What changes over time",
    title: "The retake",
    body: "Same team, sixty days later. Use the round buttons at the top of the team view to switch between them.",
    href: "/team/demo",
    cta: "Open the team view",
  },
  {
    n: "6",
    tag: "What the owner of the tool sees",
    title: "Across every team",
    body: "The view you'd have if you ran this across many companies. Sample data only.",
    href: "/admin/sample",
    cta: "Open the sample dashboard",
  },
  {
    n: "7",
    tag: "The other tool",
    title: "AI readiness for a business",
    body: "Fifteen questions aimed at a business owner rather than a team. Different instrument, same machinery underneath.",
    href: "/assessment",
    cta: "Take the readiness assessment",
  },
];

export default function TourPage() {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <main id="main" className="flex-1 px-4 sm:px-6 py-10 sm:py-16">
        <div className="w-full max-w-3xl mx-auto">
          <p className="text-[12px] tracking-[0.22em] font-medium uppercase mb-4" style={{ color: "var(--accent)" }}>
            A short tour
          </p>
          <h1
            className="font-semibold leading-[1.1] tracking-[-0.02em] mb-4"
            style={{ fontSize: "clamp(28px, 5vw, 42px)", color: "var(--navy)" }}
          >
            Seven links, in order
          </h1>
          <p className="text-lg leading-relaxed mb-10" style={{ color: "var(--text-mid)" }}>
            Nothing here asks for a password or an email. Go in order if you want the point of it,
            or skip to whichever view interests you.
          </p>

          <ol className="flex flex-col gap-4">
            {STOPS.map((s) => (
              <li
                key={s.n + s.title}
                className="rounded-2xl px-6 py-6"
                style={{
                  background: "var(--bg-card)",
                  boxShadow: "var(--shadow-card)",
                  border: "1px solid var(--border-soft)",
                }}
              >
                <p
                  className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-2"
                  style={{ color: "var(--accent)" }}
                >
                  {s.n} · {s.tag}
                </p>
                <h2 className="font-semibold mb-2" style={{ color: "var(--navy)", fontSize: "21px" }}>
                  {s.title}
                </h2>
                <p className="text-[15px] leading-relaxed mb-5" style={{ color: "var(--text-mid)" }}>
                  {s.body}
                </p>
                <Link
                  href={s.href}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-[15px]"
                  style={{ background: "var(--navy)", color: "#f5f3ef" }}
                >
                  {s.cta}
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>

          <p className="mt-10 text-sm" style={{ color: "var(--text-muted)" }}>
            Every name, company and answer you&apos;ll see is made up. No real person&apos;s responses are in here.
          </p>
          <p className="mt-8">
            <Link href="/" className="text-base font-semibold underline" style={{ color: "var(--accent)" }}>
              ← West Product Development LLC
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
