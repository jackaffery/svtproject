import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHero, Section } from "@/components/site";

export function ProductPage({ eyebrow, title, intro, features, faqs }: { eyebrow: string; title: string; intro: string; features: string[]; faqs: [string, string][] }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title}>{intro}</PageHero>
      <Section>
        <div className="grid gap-12 lg:grid-cols-[3fr_2fr]">
          <div>
            <h2 className="text-2xl font-semibold">What's included</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <li key={f} className="flex gap-3 rounded-lg border p-4"><Check className="h-5 w-5 shrink-0 text-primary" /><span>{f}</span></li>
              ))}
            </ul>
            <h2 className="mt-12 text-2xl font-semibold">Common questions</h2>
            <div className="mt-4 divide-y border-y">
              {faqs.map(([q, a]) => (
                <details key={q} className="group py-4">
                  <summary className="cursor-pointer font-semibold marker:text-primary">{q}</summary>
                  <p className="mt-2 text-muted-foreground">{a}</p>
                </details>
              ))}
            </div>
          </div>
          <aside className="h-fit rounded-lg bg-primary p-8 text-primary-foreground">
            <h3 className="text-2xl font-semibold">Apply today</h3>
            <p className="mt-3 text-primary-foreground/80">Registration takes a few minutes. Your application is reviewed before activation.</p>
            <Link to="/open-account" className="mt-6 inline-block rounded-md bg-primary-foreground px-5 py-3 font-semibold text-primary">Open an Account</Link>
          </aside>
        </div>
      </Section>
    </>
  );
}
