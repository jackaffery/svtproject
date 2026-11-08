import { createFileRoute } from "@tanstack/react-router";
import { meta, PageHero, Section } from "@/components/site";

export const Route = createFileRoute("/privacy")({
  staticData: { sitemap: true },
  head: () => meta("Privacy Policy — Stronghold Vault Trust", "How Stronghold Vault Trust Institution collects, uses and protects your information."),
  component: () => (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <Section>
        <div className="max-w-3xl space-y-6 text-muted-foreground">
          <p><strong className="text-foreground">Information we collect.</strong> Details you provide at registration (name, contact details, address, date of birth) and records of activity within your account.</p>
          <p><strong className="text-foreground">How we use it.</strong> To operate your account, verify your identity, provide support and meet legal obligations. We do not sell personal information.</p>
          <p><strong className="text-foreground">How we protect it.</strong> Encrypted connections, hashed passwords, role-based staff access and audit logging.</p>
          <p><strong className="text-foreground">Your rights.</strong> You may request access to, correction of, or deletion of your personal information by contacting support.</p>
        </div>
      </Section>
    </>
  ),
});
