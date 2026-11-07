import { createFileRoute } from "@tanstack/react-router";
import { meta, PageHero, Section } from "@/components/site";

export const Route = createFileRoute("/terms")({
  head: () => meta("Terms & Conditions — Stronghold Vault Trust", "The terms that govern use of Stronghold Vault Trust Institution services."),
  component: () => (
    <>
      <PageHero eyebrow="Legal" title="Terms & Conditions" />
      <Section>
        <div className="max-w-3xl space-y-6 text-muted-foreground">
          <p><strong className="text-foreground">Nature of services.</strong> SVT is a financial services platform. It does not represent itself as a licensed bank, and nothing on this site is an offer to accept deposits.</p>
          <p><strong className="text-foreground">Eligibility.</strong> Applicants must be 18 or older and complete verification. SVT may approve or decline any application.</p>
          <p><strong className="text-foreground">Account security.</strong> You are responsible for keeping your credentials confidential and reporting suspected unauthorized access promptly.</p>
          <p><strong className="text-foreground">Changes.</strong> We may update these terms and will notify customers of material changes.</p>
        </div>
      </Section>
    </>
  ),
});
