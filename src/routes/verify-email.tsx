import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";
import { verifyUserEmail, type BankUser } from "@/lib/bank-store";

export const Route = createFileRoute("/verify-email")({
  head: () =>
    meta(
      "Verify Email — Stronghold Vault Trust Institution",
      "One-time verification link for opening Stronghold Vault Trust accounts."
    ),
  validateSearch: (search: Record<string, unknown>): { token?: string; email?: string } => ({
    token: typeof search.token === "string" ? search.token : undefined,
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token, email } = useSearch({ from: "/verify-email" });
  const [verifiedUser, setVerifiedUser] = useState<BankUser | null>(null);
  const [status, setStatus] = useState<"checking" | "success" | "invalid">("checking");

  useEffect(() => {
    if (token && email) {
      const user = verifyUserEmail(token, email);
      if (user) {
        setVerifiedUser(user);
        setStatus("success");
      } else {
        setStatus("invalid");
      }
    } else {
      setStatus("invalid");
    }
  }, [token, email]);

  return (
    <>
      <PageHero eyebrow="Identity Verification" title="One-Time Verification Link">
        Confirming security credentials and activating full institutional banking access.
      </PageHero>

      <Section muted>
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
          {status === "checking" && (
            <div className="py-8">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent" />
              <p className="mt-4 text-sm font-semibold text-foreground">Validating one-time token...</p>
            </div>
          )}

          {status === "success" && verifiedUser && (
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-foreground">Email Verified Successfully</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your account for <strong>{verifiedUser.fullName}</strong> is now verified and active.
              </p>

              <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-4 text-left text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Account Holder:</span>
                  <span className="font-semibold text-foreground">{verifiedUser.fullName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-mono font-semibold text-foreground">
                    ••••{verifiedUser.accountNumber.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-semibold text-emerald-600 uppercase">Active</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/dashboard"
                  className="cta-glow flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3 text-sm font-bold text-primary-deep transition-all hover:bg-gold-deep"
                >
                  <span>Go to Customer Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {status === "invalid" && (
            <div>
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive/15 text-destructive">
                <XCircle className="h-10 w-10" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-foreground">Invalid or Expired Link</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This one-time verification link could not be validated or has already been used.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Link
                  to="/login"
                  className="rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary-deep"
                >
                  Sign in with Credentials & PIN
                </Link>
                <Link
                  to="/open-account"
                  className="rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary"
                >
                  Start New Application
                </Link>
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
