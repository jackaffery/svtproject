import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () =>
    meta(
      "Reset Password — Stronghold Vault Trust Institution",
      "Request a password reset link or set a new password for your SVT customer account."
    ),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"request" | "recovery">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Recovery links arrive with type=recovery in the URL hash.
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setMode("recovery");
    }
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (err) {
      setError(err.message);
    } else {
      setMessage("If an account exists for this email, a reset link is on its way. Please check your inbox.");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
    } else {
      setMessage("Your password has been updated. Redirecting to sign in…");
      setTimeout(() => navigate({ to: "/login" }), 1500);
    }
  };

  return (
    <>
      <PageHero eyebrow="Account Recovery" title="Reset Your Password">
        {mode === "recovery"
          ? "Choose a new password for your customer account."
          : "Enter your registered email and we will send you a secure reset link."}
      </PageHero>

      <Section muted>
        <div className="mx-auto max-w-md">
          <form
            onSubmit={mode === "recovery" ? handleReset : handleRequest}
            className="rounded-2xl border bg-card p-8 shadow-sm"
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-gold">
              <ShieldCheck className="h-6 w-6" />
            </div>

            {error && (
              <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {error}
              </div>
            )}
            {message && (
              <div className="mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700">
                {message}
              </div>
            )}

            <div className="mt-6 space-y-4">
              {mode === "request" ? (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Registered Email
                  </label>
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      placeholder="you@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      New Password
                    </label>
                    <div className="relative mt-1.5">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        placeholder="At least 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Confirm New Password
                    </label>
                    <div className="relative mt-1.5">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        placeholder="Repeat the password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full rounded-md border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={busy}
                className="cta-glow flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3 text-sm font-bold text-primary-deep transition-all hover:bg-gold-deep disabled:opacity-50"
              >
                <span>{busy ? "Please wait…" : mode === "recovery" ? "Set New Password" : "Send Reset Link"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Back to Sign In
                </Link>
                <Link to="/contact" className="hover:underline">
                  Need help?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}
