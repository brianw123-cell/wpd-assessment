"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={<StatusMessage title="Signing you in…" body="One moment." />}
    >
      <CallbackInner />
    </Suspense>
  );
}

function CallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Signing you in…");

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      // Verify a session actually exists before redirecting. If the auth SDK
      // hasn't hydrated it yet, wait for the SIGNED_IN event.
      const { data: existing } = await supabase.auth.getSession();
      if (existing.session) {
        if (!cancelled) router.replace("/admin");
        return;
      }
      // Wait up to 4 seconds for the session to arrive.
      let unsub: (() => void) | null = null;
      const timeout = setTimeout(() => {
        unsub?.();
        if (cancelled) return;
        setError("Session didn't stick. Try requesting a new sign-in link.");
      }, 4000);
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" && session) {
          clearTimeout(timeout);
          unsub?.();
          if (!cancelled) router.replace("/admin");
        }
      });
      unsub = () => sub.subscription.unsubscribe();
    };

    (async () => {
      try {
        const code = searchParams.get("code");

        // PKCE flow — modern Supabase magic links use this
        if (code) {
          setStatus("Exchanging sign-in code…");
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setError(`Sign-in exchange failed: ${exchangeError.message}`);
            return;
          }
          await finish();
          return;
        }

        // Legacy hash-fragment flow — the SDK auto-processes #access_token=... on load
        if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
          setStatus("Verifying sign-in…");
          await finish();
          return;
        }

        // Some Supabase configs use ?token_hash + ?type instead
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type") as
          | "magiclink"
          | "email"
          | "recovery"
          | "invite"
          | null;
        if (tokenHash && type) {
          setStatus("Verifying sign-in token…");
          const { error: verifyErr } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
          });
          if (verifyErr) {
            setError(`Verification failed: ${verifyErr.message}`);
            return;
          }
          await finish();
          return;
        }

        // Nothing to exchange — user hit this URL directly
        setError(
          "No sign-in code was found in this link. Try requesting a new one."
        );
      } catch (err) {
        setError(`Unexpected error: ${(err as Error).message}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <StatusMessage title="Sign-in failed" body={error} showLoginLink />
    );
  }

  return <StatusMessage title={status} body="One moment." />;
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
