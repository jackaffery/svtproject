import { createFileRoute } from "@tanstack/react-router";
import { meta, PageHero, Section } from "@/components/site";

const values = [
  ["Trust", "We earn confidence through consistent, honest conduct."],
  ["Integrity", "We do what we say, and say what we do."],
  ["Accountability", "We own our decisions and their outcomes."],
  ["Security", "Protecting your information is foundational."],
  ["Excellence", "We hold our service to a high standard."],
];

export const Route = createFileRoute("/about")({
  head: () => meta("About Us — Stronghold Vault Trust", "Our mission, vision and the values that guide Stronghold Vault Trust Institution."),
  component: () => (
    <>
      <PageHero eyebrow="About us" title="A modern institution built on trust">
        Stronghold Vault Trust Institution (SVT) is a financial services platform focused on accessible, transparent and dependable tools for individuals and businesses.
      </PageHero>
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border-l-4 border-primary bg-secondary p-8">
            <p className="eyebrow">Mission</p>
            <p className="mt-3 font-display text-2xl">To provide transparent, accessible and dependable financial services.</p>
          </div>
          <div className="rounded-lg border-l-4 border-primary bg-secondary p-8">
            <p className="eyebrow">Vision</p>
            <p className="mt-3 font-display text-2xl">To build lasting customer confidence through responsible financial solutions.</p>
          </div>
        </div>
        <h2 className="mt-16 text-3xl font-semibold">Core values</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {values.map(([t, d], i) => (
            <div key={t} className="rounded-lg border p-6">
              <p className="font-display text-3xl text-primary">0{i + 1}</p>
              <p className="mt-3 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  ),
});
