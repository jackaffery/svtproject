import { createFileRoute, Link } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { meta, Section } from "@/components/site";

export const Route = createFileRoute("/open-account")({
  head: () => meta("Open an Account — Stronghold Vault Trust", "Apply for a Stronghold Vault Trust savings or checking account."),
  component: () => (
    <Section muted>
      <div className="mx-auto max-w-md rounded-lg border bg-card p-8 text-center">
        <UserPlus className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-4 text-3xl font-semibold">Open an Account</h1>
        <p className="mt-3 text-muted-foreground">Online applications open soon. Contact us to register your interest.</p>
        <Link to="/contact" className="mt-6 inline-block rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground">Contact us</Link>
      </div>
    </Section>
  ),
});
