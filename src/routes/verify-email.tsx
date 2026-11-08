import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight, Inbox } from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";

export const Route = createFileRoute("/verify-email")({
  staticData: { sitemap: false },
  head: () =>
    meta(
      "Verify Email — Stronghold Vault Trust Institution",
      "Confirm your email address to activate your Stronghold Vault Trust account."
    ),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  return (
    <>
      <PageHero eyebrow="Identity Verification" title="Confirm Your Email">
        Your account is activated through the secure confirmation link we email to you.
      </PageHero>

      <Section muted>
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
            <Inbox className="h-8 w-8 text-gold" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-foreground">Check Your Inbox</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            When you register, we email you a one-time confirmation link. Click it to verify your
            address and activate your account. Once verified, your application goes to our team for
            final approval.
          </p>

          <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-4 text-left text-xs">
            <div className="flex items-start gap-2 py-1">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span className="text-muted-foreground">
                The link is single-use and expires for your security.
              </span>
            </div>
            <div className="flex items-start gap-2 py-1">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span className="text-muted-foreground">
                After confirmation, sign in with your email and password.
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              to="/login"
              className="cta-glow flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3 text-sm font-bold text-primary-deep transition-all hover:bg-gold-deep"
            >
              <span>Go to Customer Login</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="rounded-md border border-border px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary"
            >
              Contact Client Support
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
