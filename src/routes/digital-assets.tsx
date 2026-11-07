import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Coins,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Copy,
  CheckCircle2,
  Lock,
  RefreshCw,
  Info,
} from "lucide-react";
import { meta } from "@/components/site";
import { getCurrentSession, type BankUser } from "@/lib/bank-store";

export const Route = createFileRoute("/digital-assets")({
  head: () =>
    meta(
      "Digital Assets — Stronghold Vault Trust",
      "Bitcoin, ETH & vault custody cold storage reserves for institutional accounts."
    ),
  component: DigitalAssetsPage,
});

function DigitalAssetsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<BankUser | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    setUser(session);
  }, [navigate]);

  if (!user) return null;

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2500);
  };

  const assets = user.digitalAssets || [];
  const totalCryptoUsd = assets.reduce((sum, a) => sum + a.fiatValueUsd, 0);

  return (
    <div className="min-h-screen bg-[#081528] text-white pb-20">
      {/* Top Header */}
      <header className="border-b border-primary-foreground/10 bg-[#0a1b33]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-primary-foreground/70">
            <span>Institutional Multi-Sig Custody</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pt-8">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-[#081528] shadow-md">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Digital Assets</h1>
            <p className="text-xs text-primary-foreground/70">
              Bitcoin, ETH & vault custody • Connected to Stronghold Cold Storage
            </p>
          </div>
        </div>

        {/* Regulatory Disclosure: NOT FDIC Insured */}
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-200 text-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold text-white">Regulatory Disclosure on Digital Assets</p>
              <p className="mt-1 text-amber-200/90 leading-relaxed">
                Digital assets (Bitcoin & Ethereum) held in vault custody are secured through multi-signature cold storage and institutional custody infrastructure. Unlike cash deposits in Stronghold Vault Trust Institution checking or savings accounts, <strong>digital assets are not insured by the FDIC</strong> or any government deposit insurance program.
              </p>
            </div>
          </div>
        </div>

        {/* Total Crypto Portfolio Card */}
        <div className="mt-6 rounded-2xl border border-primary-foreground/15 bg-[#0e2240] p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">
              Combined Vault Custody Value
            </span>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
              100% Backed Reserves
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white md:text-4xl">
              ${totalCryptoUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-gray-400 uppercase">USD Approximate</span>
          </div>
          <p className="mt-1 text-[11px] text-primary-foreground/60">
            Valuation synchronized with institutional index pricing.
          </p>
        </div>

        {/* Individual Asset Cards */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {assets.map((asset) => (
            <div
              key={asset.symbol}
              className="rounded-2xl border border-white/20 bg-white p-6 text-[#12233b] shadow-xl text-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold text-[#081528] font-bold text-sm">
                      {asset.symbol === "BTC" ? "₿" : "Ξ"}
                    </span>
                    <div>
                      <h3 className="font-bold text-[#0a1b33] text-sm">{asset.name}</h3>
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{asset.symbol}</span>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
                    {asset.status}
                  </span>
                </div>

                <div className="py-4">
                  <span className="text-gray-500 font-semibold uppercase text-[10px]">Held in Custody</span>
                  <p className="text-2xl font-extrabold text-[#0a1b33] mt-0.5">
                    {asset.balance} {asset.symbol}
                  </p>
                  <p className="text-xs font-semibold text-gray-500">
                    ≈ ${asset.fiatValueUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
                  <span className="font-bold uppercase text-[10px] text-gray-400">Vault Custody Address</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-[#0a1b33] truncate">
                      {asset.custodyVaultAddress}
                    </span>
                    <button
                      onClick={() => handleCopy(asset.custodyVaultAddress)}
                      className="shrink-0 text-gray-500 hover:text-[#0a1b33]"
                      title="Copy Address"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {copiedAddress === asset.custodyVaultAddress && (
                    <p className="text-[10px] text-emerald-600 font-bold">Address copied to clipboard!</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                <span>Audited: {asset.lastAuditTimestamp}</span>
                <span className="font-bold text-[#0a1b33]">Air-Gapped Vault</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
