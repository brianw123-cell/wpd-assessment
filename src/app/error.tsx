"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Route-level error boundary. Catches any client-side error thrown by a page
 * or component under it and shows a plain fallback instead of a blank screen.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Client error caught by root error.tsx:", error);
  }, [error]);

  return (
    <main id="main" className="flex-1 flex items-center justify-center px-6 py-16">
      <div
        className="w-full max-w-md rounded-2xl px-8 py-10 text-center"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-soft)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <p
          className="text-[11px] tracking-[0.18em] font-semibold uppercase mb-3"
          style={{ color: "#c67b5c" }}
        >
          Something broke
        </p>
        <h1
          className="font-semibold mb-3"
          style={{ color: "var(--navy)", fontSize: "24px", letterSpacing: "-0.01em" }}
        >
          The page hit an error
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-mid)" }}>
          Your data hasn&apos;t been lost. Try the buttons below, or reload the page.
          {error.digest && (
            <>
              <br />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Reference: {error.digest}
              </span>
            </>
          )}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-white text-sm font-semibold"
            style={{ background: "var(--navy)" }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold border"
            style={{ borderColor: "var(--border-soft)", color: "var(--accent)", background: "var(--bg-card)" }}
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
