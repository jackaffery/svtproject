import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck,
  KeyRound,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  Copy,
} from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";
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
    address: "",
    city: "",
    country: "United States",
  });

  const [error, setError] = useState("");
  const [createdResult, setCreatedResult] = useState<{
    verificationLink: string;
    email: string;
    fullName: string;
    accountNumber: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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

    const { user, verificationLink } = registerNewUser({
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

    setCreatedResult({
      verificationLink,
      email: user.email,
      fullName: user.fullName,
      accountNumber: user.accountNumber,
    });
  };

  const copyLink = () => {
    if (createdResult?.verificationLink) {
      navigator.clipboard.writeText(createdResult.verificationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <>
      <PageHero eyebrow="New Client Registration" title="Open an SVT Account">
        Complete institutional enrollment in 3 minutes. Your email will automatically receive an automated one-time verification link to activate real-time access.
      </PageHero>

      <Section muted>
        <div className="mx-auto max-w-2xl">
          {createdResult ? (
            <div className="rounded-2xl border border-gold/40 bg-card p-8 shadow-xl">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-gold">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-center text-2xl font-bold text-foreground">
                Registration Successful
              </h2>
              <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 p-5 text-center">
                <p className="text-base font-semibold text-primary-deep">
                  “Your registration was successful. Please check your email and click the activation link we sent you to access your account for the first time.”
                </p>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                A unique, secure one-time activation link has been dispatched to <strong>{createdResult.email}</strong> for <strong>{createdResult.fullName}</strong>.
              </p>

              {/* Secure Customer Email Simulation & Dispatch Information */}
              <div className="mt-6 rounded-xl border border-border bg-secondary p-5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <Mail className="h-4 w-4 text-gold" /> One-Time Activation Dispatch Box
                  </span>
                  <span className="rounded bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-primary-deep uppercase">
                    One-Time Token Ready
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  In accordance with security requirements, direct dashboard access is prevented until the one-time activation token is verified. For testing or local preview, open the link directly below:
                </p>

                <div className="mt-4 flex flex-col gap-2">
                  <a
                    href={createdResult.verificationLink}
                    className="cta-glow flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-3 text-sm font-bold text-primary-deep transition-all hover:bg-gold-deep"
                  >
                    <span>Open Activation Link (Simulate Email Tap)</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>

                  <button
                    onClick={copyLink}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copied ? "Copied One-Time Link!" : "Copy Verification URL"}</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 flex justify-between border-t pt-4 text-xs text-muted-foreground">
                <span>Assigned Account: <strong>****{createdResult.accountNumber.slice(-4)}</strong></span>
                <span>Security PIN: <strong>Enforced (4-Digits)</strong></span>
              </div>
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
                    Required for identity verification and FDIC-insured record keeping.
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
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value as any })}
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
                      Security PIN (Required for Transactions & Login)
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Set a confidential 4-digit security PIN to authorize transfers and access your customer dashboard.
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
                    className="cta-glow flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3.5 text-base font-bold text-primary-deep transition-all hover:bg-gold-deep"
                  >
                    <span>Submit Application & Generate Verification Link</span>
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
