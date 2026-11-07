import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, ShieldCheck, X } from "lucide-react";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/services", label: "Services" },
  { to: "/savings", label: "Savings" },
  { to: "/checking", label: "Checking" },
  { to: "/security", label: "Security" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className={`block font-display text-lg font-semibold ${light ? "text-primary-foreground" : "text-foreground"}`}>SVT</span>
        <span className={`block truncate text-[0.6rem] font-bold tracking-[0.18em] uppercase ${light ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          Stronghold Vault Trust Institution
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 lg:flex lg:justify-between">
        <Logo />
        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/login" className="rounded-md border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary">Customer Login</Link>
          <Link to="/open-account" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-deep">Open an Account</Link>
        </div>
        <button aria-label="Toggle menu" className="rounded-md border p-2 lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t px-5 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 font-medium hover:bg-secondary">{n.label}</Link>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="mt-2 rounded-md border px-3 py-2 text-center font-semibold">Customer Login</Link>
            <Link to="/open-account" onClick={() => setOpen(false)} className="rounded-md bg-primary px-3 py-2 text-center font-semibold text-primary-foreground">Open an Account</Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary-deep text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm text-primary-foreground/75">Your Trust. Your Future. Your Financial Security.</p>
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary-foreground/60">Explore</p>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.slice(1).map((n) => <li key={n.to}><Link to={n.to} className="hover:underline">{n.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-primary-foreground/60">Legal</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:underline">Terms & Conditions</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Stronghold Vault Trust Institution. SVT is a financial services platform and does not represent itself as a licensed bank or deposit-taking institution.
        </p>
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="border-b bg-secondary">
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold md:text-5xl">{title}</h1>
        {children && <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{children}</p>}
      </div>
    </section>
  );
}

export function Section({ children, muted = false }: { children: ReactNode; muted?: boolean }) {
  return (
    <section className={muted ? "bg-secondary" : ""}>
      <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">{children}</div>
    </section>
  );
}

export function meta(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
