import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock, Eye, Users } from "lucide-react";
import heroAsset from "@/assets/hero-meeting.png.asset.json";
import { meta, Section } from "@/components/site";
import { services } from "@/lib/services";

export const Route = createFileRoute("/")({
  head: () => meta("Stronghold Vault Trust Institution — Financial Confidence", "Modern financial services built around accessibility, transparency and customer convenience."),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={heroAsset.url} alt="Stronghold Vault Trust team in a client meeting" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="hero-scrim absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-5 py-28 md:py-40">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-primary-foreground/80">Your Trust. Your Future. Your Financial Security.</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.08] text-primary-foreground md:text-6xl">
            Building Financial Confidence. Protecting Your Future.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-primary-foreground/85">
            Discover a modern approach to financial services with Stronghold Vault Trust Institution. Explore financial solutions designed around accessibility, transparency and customer convenience.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/services" className="inline-flex items-center gap-2 rounded-md bg-primary-foreground px-6 py-3 font-semibold text-primary hover:bg-secondary">
              Explore Our Services <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="rounded-md border border-primary-foreground/60 px-6 py-3 font-semibold text-primary-foreground hover:bg-primary-foreground/10">
              Customer Login
            </Link>
          </div>
        </div>
      </section>

      <div className="border-b">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-3">
          {[
            { i: Lock, t: "Security first", d: "Encrypted sessions and role-based access controls." },
            { i: Eye, t: "Transparent terms", d: "Clear eligibility and fees, disclosed up front." },
            { i: Users, t: "Customer focused", d: "Real people behind every support request." },
          ].map(({ i: I, t, d }) => (
            <div key={t} className="flex gap-4">
              <I className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div><p className="font-semibold">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
            </div>
          ))}
        </div>
      </div>

      <Section muted>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Financial services</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Solutions built around you</h2>
          </div>
          <Link to="/services" className="font-semibold text-primary hover:underline">View all services →</Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((s) => (
            <div key={s.title} className="rounded-lg border bg-card p-7 transition-shadow hover:shadow-lg">
              <s.icon className="h-7 w-7 text-primary" />
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-semibold">Ready to get started?</h2>
            <p className="mt-2 text-primary-foreground/80">Apply online in minutes. Every application is reviewed by our team.</p>
          </div>
          <Link to="/open-account" className="rounded-md bg-primary-foreground px-6 py-3 font-semibold text-primary hover:bg-secondary">Open an Account</Link>
        </div>
      </section>
    </>
  );
}
