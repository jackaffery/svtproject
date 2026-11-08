import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, KeyRound, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";
import { findUserByEmail, setCurrentSession, getBankUsers } from "@/lib/bank-store";

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
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const user = findUserByEmail(email);
    if (!user) {
      setError("No account found matching this email address.");
      return;
    }

    if (user.status === "pending_verification") {
      setError("Please check your email and click the one-time activation link to activate your account before logging in.");
      return;
    }

    if (user.status === "suspended") {
      setError("This account is currently blocked or under administrative review. Please contact support.");
      return;
    }

    if (user.pin !== pin) {
      setError("Incorrect 4-digit PIN. Please try again.");
      return;
    }

    setCurrentSession(user);
    navigate({ to: "/dashboard" });
  };

  const handleQuickLoginDemo = () => {
    const users = getBankUsers();
    const demo = users[0];
    if (demo) {
      setCurrentSession(demo);
      navigate({ to: "/dashboard" });
    }
  };

  return (
    <>
      <PageHero eyebrow="Secure Access" title="Customer Login">
        Sign in with your registered email and 4-digit security PIN to manage accounts, execute transfers, and view statements.
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
                  4-Digit Security PIN
                </label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="••••"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full tracking-[0.4em] rounded-md border bg-background py-2.5 pl-9 pr-3 text-center text-base font-bold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="cta-glow flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3 text-sm font-bold text-primary-deep transition-all hover:bg-gold-deep"
                >
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Demo 1-Click Access Pill */}
              <div className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-center">
                <p className="text-[11px] font-semibold text-primary">Observer / Demo Profile Ready</p>
                <button
                  type="button"
                  onClick={handleQuickLoginDemo}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary-deep"
                >
                  <UserCheck className="h-3.5 w-3.5 text-gold" />
                  <span>Instant Login as Alexander Sterling (PIN: 2026)</span>
                </button>
              </div>

              <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                <Link to="/open-account" className="font-semibold text-primary hover:underline">
                  Open an Account →
                </Link>
                <Link to="/contact" className="hover:underline">
                  Forgot PIN?
                </Link>
              </div>
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}
