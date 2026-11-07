import { createFileRoute, Link } from "@tanstack/react-router";
import { Map, ArrowRight } from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";

export const Route = createFileRoute("/sitemap")({
  head: () => meta("Sitemap — Stronghold Vault Trust Institution", "Overview of pages and portals on Stronghold Vault Trust Institution."),
  component: SitemapPage,
});

function SitemapPage() {
  const sections = [
    {
      title: "Main Banking & Services",
      links: [
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
        { name: "All Services", path: "/services" },
        { name: "Savings Accounts", path: "/savings" },
        { name: "Checking Accounts", path: "/checking" },
        { name: "Security & Safeguards", path: "/security" },
        { name: "Contact Support", path: "/contact" },
      ],
    },
    {
      title: "Customer & Banking Access",
      links: [
        { name: "Open an Account (Registration)", path: "/open-account" },
        { name: "Customer Login", path: "/login" },
        { name: "Client Portal & Dashboard", path: "/dashboard" },
        { name: "Admin Console", path: "/admin" },
      ],
    },
    {
      title: "Regulatory & Compliance",
      links: [
        { name: "Privacy Policy", path: "/privacy" },
        { name: "Terms of Service", path: "/terms" },
        { name: "Accessibility Statement", path: "/accessibility" },
      ],
    },
  ];

  return (
    <>
      <PageHero eyebrow="Directory" title="Sitemap">
        Navigate all institutional pages, services, customer account tools, and compliance disclosures.
      </PageHero>
      <Section muted>
        <div className="grid gap-8 md:grid-cols-3">
          {sections.map((sec) => (
            <div key={sec.title} className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
                <Map className="h-5 w-5 text-gold" /> {sec.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {sec.links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="group flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-primary"
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
