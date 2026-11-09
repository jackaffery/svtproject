import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  KeyRound,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle,
  Inbox,
  RefreshCw,
  Lock,
} from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { registerNewUser } from "@/lib/bank-store";

export const Route = createFileRoute("/open-account")({
  staticData: { sitemap: false },
  head: () =>
    meta(
      "Open an Account — Stronghold Vault Trust Institution",
      "Apply online for a secure savings, checking, or private trust account."
    ),
  component: OpenAccountPage,
});

function OpenAccountPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    accountType: "Personal Checking" as "Personal Checking" | "High-Yield Savings" | "Private Wealth Trust",
    pin: "",
    confirmPin: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    country: "United States",
  });

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.email || !formData.phone || !formData.address) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^\d{4}$/.test(formData.pin)) {
      setError("Security PIN must be exactly 4 digits.");
      return;
    }

    if (formData.pin !== formData.confirmPin) {
      setError("Security PIN confirmation does not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    setBusy(true);

    // Synchronize to bank-store as a brand new fresh account with zero funds and zero history
    try {
      registerNewUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        accountType: formData.accountType,
        pin: formData.pin,
        address: formData.address,
        city: formData.city || "New York",
        country: formData.country,
        initialDeposit: 0,
      });
    } catch {
      // Continue
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email.trim(),
      password: formData.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}, ${formData.country}`,
          account_type: formData.accountType,
          pin: formData.pin,
        },
      },
    });
    setBusy(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // With email confirmation on, there is no session yet — the customer
    // must click the link in their inbox before signing in.
    setCreatedEmail(formData.email.trim());
  };

  const handleResendEmail = async () => {
    if (!createdEmail) return;
    setResending(true);
    setResendMsg("");
    const { error: err } = await supabase.auth.resend({
      type: "signup",
      email: createdEmail,
      options: { emailRedirectTo: window.location.origin },
    });
    setResending(false);
    setResendMsg(
      err
        ? "Could not resend right now — please try again in a few minutes."
        : "A fresh verification email has been dispatched to your inbox."
    );
  };

  return (
    <>
      <PageHero eyebrow="New Client Registration" title="Open an SVT Account">
        Complete institutional enrollment in 3 minutes. Your email will automatically receive a secure verification link to activate access.
      </PageHero>

      <Section muted>
        <div className="mx-auto max-w-2xl">
          {createdEmail ? (
            <div className="rounded-2xl border border-gold/40 bg-card p-8 shadow-xl">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-gold">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-center text-2xl font-bold text-foreground">
                Registration Successful
              </h2>
              <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-5 text-center">
                <p className="text-base font-semibold text-primary-deep leading-relaxed">
                  “Your registration was successful. A verification link has been sent to your registered email address. Please check your inbox and click the link to activate and access your account for the first time.”
                </p>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-secondary/60 p-5 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                  <Inbox className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-foreground">
                  Check Your Email Inbox
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  An official email from <strong>STRONGHOLD VAULT TRUST INSTITUTION</strong> with your secure account activation link was dispatched to <strong>{createdEmail}</strong>.
                </p>

                {resendMsg && (
                  <div className="mt-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs font-semibold text-emerald-700">
                    {resendMsg}
                  </div>
                )}

                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resending}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-gold ${resending ? "animate-spin" : ""}`} />
                    <span>{resending ? "Dispatching..." : "Resend Verification Email"}</span>
                  </button>

                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary-deep transition-colors"
                  >
                    <span>Go to Customer Login</span>
                  </Link>
                </div>
              </div>

              <p className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
                After verifying your email, our compliance team reviews every application before full access is granted.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b pb-4">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-gold">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">Client Information</h3>
                  <p className="text-xs text-muted-foreground">
                    Required for identity verification and record keeping.
                  </p>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold tracking-wide uppercase text-muted-foreground">Account Type</label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value as typeof formData.accountType })}
                    className="mt-1.5 w-full rounded-md border bg-background px-3.5 py-2.5 text-sm font-medium focus:border-primary focus:outline-none"
                  >
                    <option value="Personal Checking">Personal Checking (Zero Monthly Fees)</option>
                    <option value="High-Yield Savings">High-Yield Vault Savings (4.85% APY)</option>
                    <option value="Private Wealth Trust">Private Wealth Trust (Institutional Custody)</option>
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold tracking-wide uppercase text-muted-foreground">Full Legal Name</label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Pamela Del Rey"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full rounded-md border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold tracking-wide uppercase text-muted-foreground">Email Address</label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-md border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold tracking-wide uppercase text-muted-foreground">Phone Number</label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <input
                        type="tel"
                        required
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-md border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold tracking-wide uppercase text-muted-foreground">Citizenship / Country</label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-gold-ink" />
                    <span className="text-xs font-bold tracking-wide uppercase text-primary">
                      4-Digit Security Transfer PIN
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Set a confidential 4-digit PIN required to authorize wire transfers and sensitive account transactions.
                  </p>

                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-foreground">Enter 4-Digit PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        placeholder="••••"
                        value={formData.pin}
                        onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, "") })}
                        className="mt-1 w-full tracking-[0.4em] rounded-md border bg-background px-3 py-2 text-center text-base font-bold focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Confirm 4-Digit PIN</label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        placeholder="••••"
                        value={formData.confirmPin}
                        onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, "") })}
                        className="mt-1 w-full tracking-[0.4em] rounded-md border bg-background px-3 py-2 text-center text-base font-bold focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gold/30 bg-gold/5 p-4">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gold-ink" />
                    <span className="text-xs font-bold tracking-wide uppercase text-primary">
                      Account Password
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Choose a secure password (at least 8 characters) to protect your customer dashboard.
                  </p>

                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-foreground">Enter Password</label>
                      <input
                        type="password"
                        minLength={8}
                        required
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground">Confirm Password</label>
                      <input
                        type="password"
                        minLength={8}
                        required
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-bold tracking-wide uppercase text-muted-foreground">Residential Address</label>
                    <input
                      type="text"
                      required
                      placeholder="Street address, Suite / Apt"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold tracking-wide uppercase text-muted-foreground">City & State</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New York, NY"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="cta-glow flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3.5 text-base font-bold text-primary-deep transition-all hover:bg-gold-deep disabled:opacity-50"
                  >
                    <span>{busy ? "Submitting…" : "Submit Application"}</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  By applying, you confirm information submitted is accurate and agree to SVT's Electronic Disclosures.
                </p>
              </div>
            </form>
          )}
        </div>
      </Section>
    </>
  );
}
