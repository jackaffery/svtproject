import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Shield } from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";

export const Route = createFileRoute("/accessibility")({
  staticData: { sitemap: true },
  head: () => meta("Accessibility Statement — Stronghold Vault Trust Institution", "Our commitment to digital accessibility for all clients and visitors."),
  component: AccessibilityPage,
});

function AccessibilityPage() {
  const standards = [
    "Full keyboard navigation and logical focus order throughout the portal",
    "Screen reader semantic structures, ARIA labels, and live region alerts",
    "WCAG AA high contrast ratios conforming to deep navy (#0e1b2e) and ivory tones",
    "Text scaling and fluid viewport responsive design across all devices",
    "Clear field validation error messaging and PIN entry helpers",
  ];

  return (
    <>
      <PageHero eyebrow="Commitment" title="Accessibility Statement">
        Stronghold Vault Trust Institution is dedicated to ensuring digital access for all clients, including individuals with disabilities.
      </PageHero>
      <Section muted>
        <div className="mx-auto max-w-3xl rounded-xl border bg-card p-8 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-5">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-gold">
              <Shield className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground">Our Standards & Practices</h2>
              <p className="text-xs text-muted-foreground">Adhering to Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              We continually review our banking platforms and account opening workflows against accessibility benchmarks to provide an intuitive, barrier-free banking experience.
            </p>
            <ul className="mt-4 space-y-3">
              {standards.map((s) => (
                <li key={s} className="flex items-start gap-3 text-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <p className="pt-4 text-xs text-muted-foreground">
              If you experience any accessibility issues or require tailored assistance accessing our services, please contact our support team at <strong className="text-foreground">support@strongholdvaulttrustinstitution.online</strong>.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
