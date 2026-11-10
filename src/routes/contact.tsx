import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail } from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";

const SUPPORT_EMAIL = "support@strongholdvaulttrustinstitution.online";

const faqs: [string, string][] = [
  ["How long does an application review take?", "Most applications are reviewed within a few business days. You'll be notified by email."],
  ["I forgot my password. What should I do?", "Use the 'Forgot password' link on the Customer Login page to reset it securely."],
  ["Will SVT ever ask for my password?", "Never. Report any message asking for your password to our support team."],
];

export const Route = createFileRoute("/contact")({
  staticData: { sitemap: true },
  head: () => meta("Contact Us — Stronghold Vault Trust", "Reach SVT customer support, read FAQs and send us a message."),
  component: Contact,
});

function Contact() {
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "" });
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email) || f.message.trim().length < 10) {
      setErr("Please enter your name, a valid email and a message of at least 10 characters.");
      return;
    }
    setErr("");
    const body = `${f.message}\n\n— ${f.name} (${f.email})`;
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(f.subject || "Website enquiry")}&body=${encodeURIComponent(body)}`;
  };
  const input = "w-full rounded-md border border-input bg-background px-4 py-3 text-sm md:text-base outline-none focus:border-primary focus:ring-2 focus:ring-ring/20 box-border";
  return (
    <>
      <PageHero eyebrow="Contact us" title="We're here to help">Send us a message or browse answers to common questions.</PageHero>
      <Section>
        <div className="grid gap-10 lg:grid-cols-[3fr_2fr]">
          <form onSubmit={submit} className="space-y-4 w-full" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <input className={input} placeholder="Full name" maxLength={100} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              <input className={input} type="email" placeholder="Email address" maxLength={255} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </div>
            <input className={input} placeholder="Subject" maxLength={150} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} />
            <textarea className={`${input} min-h-40 resize-y`} placeholder="How can we help?" maxLength={2000} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} />
            {err && <p role="alert" className="text-sm text-destructive">{err}</p>}
            <button className="w-full sm:w-auto rounded-md bg-primary px-8 py-3.5 font-semibold text-primary-foreground hover:bg-primary-deep transition-colors">
              Send message
            </button>
          </form>
          <aside className="space-y-8 w-full min-w-0">
            <div className="rounded-xl bg-secondary p-5 sm:p-6 border border-border/50">
              <p className="eyebrow">Customer assistance</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-3 flex items-start gap-2.5 font-semibold text-primary hover:underline text-xs sm:text-sm break-all leading-relaxed"
              >
                <Mail className="h-4 w-4 shrink-0 mt-0.5 text-gold-deep" />
                <span className="break-all">{SUPPORT_EMAIL}</span>
              </a>
              <p className="mt-3 text-xs text-muted-foreground leading-normal">
                Official institutional email for all account inquiries, compliance verification, and general customer support.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">FAQ</h2>
              <div className="mt-3 divide-y border-y">
                {faqs.map(([q, a]) => (
                  <details key={q} className="py-4"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-2 text-sm text-muted-foreground">{a}</p></details>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
