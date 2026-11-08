import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, KeyRound, ArrowRight } from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  staticData: { sitemap: false },
  head: () =>
    meta(
      "Customer Login — Stronghold Vault Trust Institution",
      "Sign in to your Stronghold Vault Trust customer portal."
    ),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setBusy(false);
      setError(
        signInError.message.toLowerCase().includes("email not confirmed")
          ? "Please confirm your email first — check your inbox for the verification link."
          : "Invalid email or password. Please try again."
      );
      return;
    }

    // Check the account status before sending the customer through.
    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .single();

    const status = profile?.status ?? "pending_approval";
    if (status === "suspended" || status === "closed" || status === "rejected") {
      await supabase.auth.signOut();
      setBusy(false);
      setError("This account is currently under administrative review. Please contact support.");
      return;
    }

    navigate({ to: "/dashboard" });
  };

  return (
    <>
      <PageHero eyebrow="Secure Access" title="Customer Login">
        Sign in with your registered email and password to manage accounts, execute transfers, and view statements.
      </PageHero>

      <Section muted>
        <div className="mx-auto max-w-md">
          <form onSubmit={handleLogin} className="rounded-2xl border bg-card p-8 shadow-sm">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-gold">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-center text-xl font-bold text-foreground">Client Portal Access</h2>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Institutional encryption active (256-bit TLS)
            </p>

            {error && (
              <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
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

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="cta-glow flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3 text-sm font-bold text-primary-deep transition-all hover:bg-gold-deep disabled:opacity-50"
                >
                  <span>{busy ? "Signing in…" : "Sign In to Dashboard"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                <Link to="/open-account" className="font-semibold text-primary hover:underline">
                  Open an Account →
                </Link>
                <Link to="/reset-password" className="hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}
