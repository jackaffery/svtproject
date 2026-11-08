import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert, KeyRound, ArrowRight, Lock } from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";
import { supabase } from "@/integrations/supabase/client";
import { getMyRoles, bootstrapFirstAdmin } from "@/lib/bank.functions";

export const Route = createFileRoute("/admin-login")({
  staticData: { sitemap: false },
  head: () =>
    meta(
      "Admin Login Portal — Stronghold Vault Trust",
      "Restricted authentication for authorized Stronghold Vault Trust administrators."
    ),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setBusy(false);
      setError("Invalid administrative credentials.");
      return;
    }

    let roles: string[] = [];
    try {
      roles = await getMyRoles({ data: undefined as never }).catch(() => []);
      if (!roles.includes("admin")) {
        // First-ever administrator bootstrap: only succeeds while no admin exists.
        const { granted } = await bootstrapFirstAdmin({ data: undefined as never });
        if (granted) roles = ["admin"];
      }
    } catch {
      roles = [];
    }

    if (!roles.includes("admin")) {
      await supabase.auth.signOut();
      setBusy(false);
      setError("This account does not have administrator access.");
      return;
    }

    navigate({ to: "/admin" });
  };

  return (
    <>
      <PageHero eyebrow="Restricted Access" title="Admin Login Portal">
        Administrative console for Stronghold Vault Trust Institution. Access is limited to authorized administrators and every action is recorded.
      </PageHero>

      <Section muted>
        <div className="mx-auto max-w-md">
          <form onSubmit={handleAdminLogin} className="rounded-2xl border border-gold/40 bg-card p-8 shadow-xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-deep text-gold shadow-md">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-center text-xl font-bold text-foreground">
              Administrator Authentication
            </h2>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Authorized personnel only — all sessions are logged
            </p>

            {error && (
              <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Admin Email
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="admin@yourdomain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="cta-glow flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3 text-sm font-bold text-primary-deep transition-all hover:bg-gold-deep disabled:opacity-50"
                >
                  <span>{busy ? "Verifying…" : "Authorize & Enter Admin Console"}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <p className="text-center text-[11px] text-muted-foreground">
                The first administrator account is activated automatically on first sign-in.
                After that, only existing administrators can grant access.
              </p>
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}
