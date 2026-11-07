import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2,
  Wallet,
  ArrowRightLeft,
  CreditCard,
  Coins,
  ShieldCheck,
  Eye,
  EyeOff,
  LogOut,
  User,
  SlidersHorizontal,
  ChevronDown,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  FileCheck2,
} from "lucide-react";
import { meta } from "@/components/site";
import { getCurrentSession, setCurrentSession, addTransaction, type BankUser } from "@/lib/bank-store";

export const Route = createFileRoute("/dashboard")({
  head: () =>
    meta(
      "Customer Account Portal & Online Banking — Stronghold Vault Trust",
      "Executive Customer Banking Portal & Real-Time Account Management."
    ),
  component: CustomerDashboardPage,
});

function CustomerDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<BankUser | null>(null);
  const [activeTab, setActiveTab] = useState<"All Accounts" | "Checking" | "Savings">("All Accounts");
  const [hideBalance, setHideBalance] = useState(false);
  const [wireModal, setWireModal] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [wireAmount, setWireAmount] = useState("");
  const [wirePin, setWirePin] = useState("");
  const [wireStatus, setWireStatus] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session) {
      navigate({ to: "/login" });
    } else {
      setUser(session);
    }
  }, [navigate]);

  const handleLogout = () => {
    setCurrentSession(null);
    navigate({ to: "/login" });
  };

  const handleSendWire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setWireStatus(null);

    const amt = parseFloat(wireAmount);
    if (!amt || amt <= 0) {
      setWireStatus({ text: "Please enter a valid transfer amount.", error: true });
      return;
    }
    if (amt > user.balance) {
      setWireStatus({ text: "Insufficient checking funds.", error: true });
      return;
    }
    if (wirePin !== user.pin) {
      setWireStatus({ text: "Incorrect 4-digit transfer PIN.", error: true });
      return;
    }

    addTransaction(user.id, {
      type: "wire",
      description: `Institutional Wire Transfer to ${recipient}`,
      amount: -amt,
      date: new Date().toISOString().slice(0, 10),
      status: "completed",
      reference: `SVT-WT-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    const refreshed = getCurrentSession();
    setUser(refreshed);
    setWireStatus({ text: `Wire of $${amt.toLocaleString()} processed successfully.` });
    setRecipient("");
    setWireAmount("");
    setWirePin("");
    setTimeout(() => {
      setWireModal(false);
      setWireStatus(null);
    }, 2000);
  };

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  const combinedBalance = user.balance + user.savingsBalance;
  const initialLetter = (user.fullName || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#081528] text-white">
      {/* Top Banner (If Impersonated or Staff Mode) */}
      <div className="flex flex-wrap items-center justify-between border-b border-primary-foreground/10 bg-[#061120] px-4 py-2 text-xs text-primary-foreground/80">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          <span>Institutional Customer Online Banking — Encrypted Session Active</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="rounded bg-gold/20 px-2 py-0.5 text-[11px] font-bold text-gold hover:bg-gold/30"
          >
            ← Return to Master Admin Console
          </Link>
        </div>
      </div>

      {/* Primary Customer Portal Navbar */}
      <header className="border-b border-primary-foreground/10 bg-[#0a1b33]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gold text-[#081528] shadow-md">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-tight text-white">
                  STRONGHOLD VAULT TRUST
                </span>
                <span className="rounded bg-gold/15 px-2 py-0.5 text-[10px] font-bold text-gold uppercase tracking-wider">
                  FDIC Insured
                </span>
              </div>
              <p className="text-[11px] text-primary-foreground/70">Customer Account Portal & Online Banking</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/account-profile"
              className="flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-foreground/20"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="h-6 w-6 rounded-full border border-gold object-cover"
                />
              ) : (
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-[#081528] font-bold text-[11px]">
                  {initialLetter}
                </span>
              )}
              <span>Account & Profile</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Hero Section */}
      <main className="mx-auto max-w-7xl px-5 py-8">
        {/* Welcome Header */}
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="h-16 w-16 shrink-0 rounded-2xl border-2 border-gold object-cover shadow-lg"
            />
          ) : (
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-2xl font-bold text-[#081528] shadow-lg">
              {initialLetter}
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Customer Dashboard</p>
            <h1 className="text-2xl font-bold text-white capitalize md:text-3xl">
              Welcome back, {user.fullName}
            </h1>
          </div>
        </div>

        {/* Central White / Ivory Banking Panel */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white p-6 text-[#12233b] shadow-2xl md:p-8">
          {/* Filter Tabs and Hide Balance */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Available balance:</span>
              <div className="flex rounded-lg bg-gray-100 p-1">
                {(["All Accounts", "Checking", "Savings"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${
                      activeTab === tab
                        ? "bg-white text-[#0a1b33] shadow-sm"
                        : "text-gray-600 hover:text-[#0a1b33]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setHideBalance(!hideBalance)}
              className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:underline"
            >
              {hideBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              <span>{hideBalance ? "Show Balance" : "Hide Balance"}</span>
            </button>
          </div>

          {/* Big Amount Display */}
          <div className="py-6">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-[#0a1b33] md:text-5xl">
                {hideBalance
                  ? "$ ••••••••"
                  : `$ ${combinedBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                USD (Combined Total)
              </span>
            </div>
          </div>

          {/* Account Cards Breakdown */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Checking Box */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">{user.accountType || "Advantage Checking"}</span>
                <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-red-700">
                  Primary
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-[#0a1b33]">
                {hideBalance
                  ? "$ ••••••"
                  : `$ ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Acct #••••{user.accountNumber.slice(-4)} • RTN #{user.routingNumber}
              </p>
            </div>

            {/* Savings Box */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-800">High-Yield Savings (4.75% APY)</span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-700">
                  Interest
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold text-[#0a1b33]">
                {hideBalance
                  ? "$ ••••••"
                  : `$ ${user.savingsBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Acct #••••{(user.savingsAccountNumber || user.accountNumber).slice(-4)} • FDIC Insured
              </p>
            </div>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Link
            to="/transfer"
            className="group flex items-start gap-4 rounded-2xl border border-primary-foreground/15 bg-[#0e2240] p-6 text-left transition-all hover:bg-[#122b52] hover:shadow-lg"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-[#081528] shadow-md transition-transform group-hover:scale-105">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Transfers</h3>
              <p className="mt-1 text-xs text-primary-foreground/70">Domestic & international wire payments</p>
            </div>
          </Link>

          <Link
            to="/cards"
            className="group flex items-start gap-4 rounded-2xl border border-primary-foreground/15 bg-[#0e2240] p-6 text-left transition-all hover:bg-[#122b52] hover:shadow-lg"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-[#081528] shadow-md transition-transform group-hover:scale-105">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Cards & Limits</h3>
              <p className="mt-1 text-xs text-primary-foreground/70">Debit, credit, PIN & daily limits</p>
            </div>
          </Link>

          <Link
            to="/digital-assets"
            className="group flex items-start gap-4 rounded-2xl border border-primary-foreground/15 bg-[#0e2240] p-6 text-left transition-all hover:bg-[#122b52] hover:shadow-lg"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-[#081528] shadow-md transition-transform group-hover:scale-105">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Digital Assets</h3>
              <p className="mt-1 text-xs text-primary-foreground/70">Bitcoin, ETH & vault custody</p>
            </div>
          </Link>
        </div>

        {/* Ledger & Transactions Card */}
        <div className="mt-8 rounded-2xl border border-primary-foreground/15 bg-[#0a1b33] p-6">
          <div className="flex items-center justify-between border-b border-primary-foreground/10 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Transaction History & Statements</h2>
              <p className="text-xs text-primary-foreground/70">Verified electronic records and wire references</p>
            </div>
            <Link
              to="/account-profile"
              className="text-xs font-semibold text-gold hover:underline"
            >
              Edit Details & PIN →
            </Link>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary-foreground/10 text-xs font-bold uppercase tracking-wider text-primary-foreground/60">
                  <th className="pb-3">Reference & Date</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-foreground/10">
                {user.transactions.map((tx) => {
                  const isPos = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-white/5">
                      <td className="py-3.5">
                        <p className="font-bold text-white">{tx.date}</p>
                        <p className="font-mono text-xs text-primary-foreground/60">{tx.reference}</p>
                      </td>
                      <td className="py-3.5 font-medium text-white">{tx.description}</td>
                      <td className="py-3.5">
                        <span className="rounded bg-primary-foreground/10 px-2 py-0.5 text-xs uppercase font-semibold text-gold">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
                          <FileCheck2 className="h-3.5 w-3.5" /> Completed
                        </span>
                      </td>
                      <td className={`py-3.5 text-right font-bold text-base ${isPos ? "text-emerald-400" : "text-white"}`}>
                        {isPos ? "+" : ""}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Wire Transfer Modal with 4-Digit PIN */}
      {wireModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-gold/40 bg-[#0a1b33] p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-primary-foreground/15 pb-3">
              <h3 className="font-bold text-white">Execute Wire / Internal Transfer</h3>
              <button
                onClick={() => setWireModal(false)}
                className="text-primary-foreground/60 hover:text-white"
              >
                ✕
              </button>
            </div>

            {wireStatus && (
              <div
                className={`mt-4 rounded-md p-3 text-xs font-semibold ${
                  wireStatus.error ? "bg-red-500/20 text-red-300" : "bg-emerald-500/20 text-emerald-300"
                }`}
              >
                {wireStatus.text}
              </div>
            )}

            <form onSubmit={handleSendWire} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-primary-foreground/70">
                  Recipient Name / IBAN / Account
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Citibank Escrow Services #94821"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1 w-full rounded-md border border-primary-foreground/20 bg-[#081528] px-3 py-2 text-sm text-white focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-primary-foreground/70">
                  Transfer Amount ($ USD)
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="0.00"
                  value={wireAmount}
                  onChange={(e) => setWireAmount(e.target.value)}
                  className="mt-1 w-full rounded-md border border-primary-foreground/20 bg-[#081528] px-3 py-2 text-sm text-white focus:border-gold focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-gold/40 bg-gold/10 p-3">
                <label className="text-xs font-bold uppercase text-gold">4-Digit Security Transfer PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={wirePin}
                  onChange={(e) => setWirePin(e.target.value.replace(/\D/g, ""))}
                  className="mt-1.5 w-full tracking-[0.4em] rounded-md border border-gold/40 bg-[#081528] px-3 py-2 text-center text-base font-bold text-white focus:border-gold focus:outline-none"
                />
                <p className="mt-1 text-center text-[10px] text-primary-foreground/70">Default PIN: {user.pin}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWireModal(false)}
                  className="w-1/2 rounded-md border border-primary-foreground/20 py-2.5 text-xs font-semibold text-primary-foreground/80 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cta-glow w-1/2 rounded-md bg-gold py-2.5 text-xs font-bold text-[#081528] hover:bg-gold-deep"
                >
                  Authorize Wire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
