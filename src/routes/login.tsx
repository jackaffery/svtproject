import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { meta, Section } from "@/components/site";

export const Route = createFileRoute("/login")({
  head: () => meta("Customer Login — Stronghold Vault Trust", "Sign in to your Stronghold Vault Trust customer portal."),
  component: () => (
    <Section muted>
      <div className="mx-auto max-w-md rounded-lg border bg-card p-8 text-center">
        <Lock className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-4 text-3xl font-semibold">Customer Login</h1>
        <p className="mt-3 text-muted-foreground">Our secure customer portal is launching soon. Need help in the meantime?</p>
        <Link to="/contact" className="mt-6 inline-block rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground">Contact support</Link>
      </div>
    </Section>
  ),
});
