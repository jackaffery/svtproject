import { createFileRoute } from "@tanstack/react-router";
import { meta, PageHero, Section } from "@/components/site";
import { services } from "@/lib/services";

export const Route = createFileRoute("/services")({
  staticData: { sitemap: true },
  head: () => meta("Services — Stronghold Vault Trust", "Savings, checking, business services, planning resources, statements and secure support."),
  component: () => (
    <>
      <PageHero eyebrow="Services" title="Financial services, clearly explained">Every service lists who it's for and the terms that apply — no fine print surprises.</PageHero>
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((s) => (
            <article key={s.title} className="rounded-lg border p-7">
              <s.icon className="h-7 w-7 text-primary" />
              <h2 className="mt-4 text-2xl font-semibold">{s.title}</h2>
              <p className="mt-2 text-muted-foreground">{s.desc}</p>
              <dl className="mt-5 space-y-3 border-t pt-5 text-sm">
                <div><dt className="font-semibold">Eligibility</dt><dd className="text-muted-foreground">{s.eligibility}</dd></div>
                <div><dt className="font-semibold">Terms</dt><dd className="text-muted-foreground">{s.terms}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </Section>
    </>
  ),
});
