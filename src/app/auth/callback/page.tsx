"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <StatusMessage title="Signing you in…" body="One moment." />
      }
    >
      <CallbackInner />
    </Suspense>
  );
}

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const code = searchParams.get("code");

      // Case 1: PKCE flow (modern) — code=... query param, exchange for session.
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        router.replace("/admin");
        return;
      }

      // Case 2: legacy hash-fragment flow — Supabase writes the session into the URL hash
      // (#access_token=...). The SDK auto-detects these on load, so if there's a hash,
      // we just wait a beat and check the session.
      if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
        // Give the SDK a tick to process the fragment.
        setTimeout(async () => {
          const { data } = await supabase.auth.getSession();
          if (data.session) router.replace("/admin");
          else setError("The sign-in link couldn't be verified. Try requesting a new one.");
        }, 200);
        return;
      }

      // Case 3: nothing to exchange — the user probably navigated here directly.
      router.replace("/login");
    })();
  }, [router, searchParams]);

  if (error) {
    return (
      <StatusMessage
        title="Sign-in failed"
        body={error}
        showLoginLink
      />
    );
  }

  return <StatusMessage title="Signing you in…" body="One moment." />;
}

function StatusMessage({
  title,
  body,
  showLoginLink,
}: {
  title: string;
  body: string;
  showLoginLink?: boolean;
}) {
  return (
    <main
      id="main"
      className="flex-1 flex items-center justify-center px-6 py-16"
    >
      <div
        className="max-w-md rounded-2xl px-8 py-10 text-center"
        style={{
          background: "var(--bg-card)",
          boxShadow: "var(--shadow-card)",
          border: "1px solid var(--border-soft)",
        }}
      >
        <h1
          className="font-semibold mb-3"
          style={{ color: "var(--navy)", fontSize: "22px" }}
        >
          {title}
        </h1>
        <p className="text-[15px]" style={{ color: "var(--text-mid)" }}>
          {body}
        </p>
        {showLoginLink && (
          <a
            href="/login"
            className="mt-6 inline-block text-sm font-medium underline"
            style={{ color: "var(--accent)" }}
          >
            Back to login
          </a>
        )}
      </div>
    </main>
  );
}
