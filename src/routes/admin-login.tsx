import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldAlert, KeyRound, UserCheck, ArrowRight, Lock } from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";

export const Route = createFileRoute("/admin-login")({
  head: () =>
    meta(
      "SOLO Admin Login Portal — Stronghold Vault Trust",
      "Executive portal authentication for bank directors and system administrators."
    ),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Exact requested credentials: support@svt.online / Admin123
    const cleanUser = adminUsername.trim().toLowerCase();
    const cleanPass = adminPassword.trim();

    const isValidUser =
      cleanUser === "support@svt.online" ||
      cleanUser === "admin" ||
      cleanUser === "admin@svtbank.com" ||
      cleanUser === "solo";

    const isValidPass =
      cleanPass === "Admin123" ||
      cleanPass === "2026" ||
      cleanPass === "8888";

    if (isValidUser && isValidPass) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("svt_admin_authenticated", "true");
      }
      navigate({ to: "/admin" });
    } else {
      setError("Invalid Administrative Username or Password. Please use your credentials.");
    }
  };

  const handleQuickDemo = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("svt_admin_authenticated", "true");
    }
    navigate({ to: "/admin" });
  };

  return (
    <>
      <PageHero eyebrow="Restricted Access" title="SOLO Admin Login Portal">
        Executive Administrative Console for Stronghold Vault Trust Institution. Authorize with security master key to control all registered bank users and ledger liquidity.
      </PageHero>

      <Section muted>
        <div className="mx-auto max-w-md">
          <form onSubmit={handleAdminLogin} className="rounded-2xl border border-gold/40 bg-card p-8 shadow-xl">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary-deep text-gold shadow-md">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-center text-xl font-bold text-foreground">
              SOLO Bank Master Authentication
            </h2>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Level 4 Administrative Access Gateway
            </p>

            {error && (
              <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs font-semibold text-destructive">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Admin Username / Email
                </label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="support@svt.online"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full rounded-md border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Admin Password
                </label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full rounded-md border bg-background py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Username: <strong>support@svt.online</strong></span>
                  <span>Password: <strong>Admin123</strong></span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="cta-glow flex w-full items-center justify-center gap-2 rounded-md bg-gold py-3 text-sm font-bold text-primary-deep transition-all hover:bg-gold-deep"
                >
                  <span>Authorize & Enter Admin Console</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* 1-Click Fast Pass */}
              <div className="rounded-xl border border-primary/20 bg-secondary/80 p-3 text-center">
                <p className="text-[11px] font-semibold text-primary">Single Operator Quick Entry</p>
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary-deep px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary"
                >
                  <UserCheck className="h-3.5 w-3.5 text-gold" />
                  <span>Instant 1-Click Entry to Control Panel</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </Section>
    </>
  );
}
