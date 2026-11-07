import { createFileRoute } from "@tanstack/react-router";
import { KeyRound, MailCheck, ShieldCheck, Fingerprint, FileClock, AlertTriangle } from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";

const items = [
  [KeyRound, "Password protection", "Passwords are hashed and never stored in plain text."],
  [MailCheck, "Email verification", "Accounts are activated only after the email address is verified."],
  [ShieldCheck, "Role-based access", "Staff only see the information their role requires."],
  [Fingerprint, "Session management", "Sessions expire automatically and can be ended at any time."],
  [FileClock, "Audit trails", "Administrative actions are logged for accountability."],
  [AlertTriangle, "Fraud awareness", "We will never ask for your password by phone, email or message."],
] as const;

export const Route = createFileRoute("/security")({
  head: () => meta("Security — Stronghold Vault Trust", "How SVT protects your account and personal information."),
  component: () => (
    <>
      <PageHero eyebrow="Security" title="Your security, by design">Layered protections safeguard your account and personal information at every step.</PageHero>
      <Section>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(([I, t, d]) => (
            <div key={t} className="rounded-lg border p-7">
              <I className="h-7 w-7 text-primary" />
              <h2 className="mt-4 text-xl font-semibold">{t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  ),
});
