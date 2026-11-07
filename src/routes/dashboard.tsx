import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  CreditCard,
  Send,
  Building,
  Clock,
  CheckCircle,
  FileText,
  LogOut,
  Eye,
  EyeOff,
  User,
  SlidersHorizontal,
} from "lucide-react";
import { meta } from "@/components/site";
import { getCurrentSession, setCurrentSession, addTransaction, type BankUser } from "@/lib/bank-store";

export const Route = createFileRoute("/dashboard")({
  head: () =>
    meta(
      "Customer Portal Dashboard — Stronghold Vault Trust",
      "Private banking dashboard for Stronghold Vault Trust Institution clients."
    ),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<BankUser | null>(null);
  const [showFullAccount, setShowFullAccount] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [transferPin, setTransferPin] = useState("");
  const [transferMsg, setTransferMsg] = useState<{ text: string; error?: boolean } | null>(null);

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

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferMsg(null);

    if (!user) return;
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setTransferMsg({ text: "Please enter a valid amount.", error: true });
      return;
    }

    if (numAmount > user.balance) {
      setTransferMsg({ text: "Insufficient funds in checking balance.", error: true });
      return;
    }

    if (transferPin !== user.pin) {
      setTransferMsg({ text: "Incorrect 4-digit PIN.", error: true });
      return;
    }

    addTransaction(user.id, {
      type: "wire",
      description: `Institutional Transfer to ${recipient}`,
      amount: -numAmount,
      date: new Date().toISOString().slice(0, 10),
      status: "completed",
      reference: `TRF-${Math.floor(100000 + Math.random() * 900000)}`,
    });

    const refreshed = getCurrentSession();
    setUser(refreshed);
    setTransferMsg({ text: `Successfully transferred $${numAmount.toLocaleString()} to ${recipient}.` });
    setAmount("");
    setRecipient("");
    setTransferPin("");
    setTimeout(() => {
      setTransferModal(false);
      setTransferMsg(null);
    }, 2000);
  };

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent" />
      </div>
    );
  }

  const formattedBalance = user.balance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const formattedSavings = user.savingsBalance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-screen bg-secondary/40 pb-16">
      {/* Top Customer Brand Bar */}
      <div className="border-b bg-primary-deep text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-gold text-primary-deep font-bold">
              {user.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-primary-foreground">{user.fullName}</h1>
                <span className="rounded bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold uppercase tracking-wider">
                  {user.status === "active" ? "Active • Verified" : "Pending Verification"}
                </span>
              </div>
              <p className="text-xs text-primary-foreground/70">
                {user.accountType} • Routing: {user.routingNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary-foreground/20 px-3 py-1.5 text-xs font-semibold text-primary-foreground/90 hover:bg-primary-foreground/10"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-gold" />
              <span>Admin Console</span>
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/80"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pt-8">
        {/* Verification Warning if pending */}
        {user.status === "pending_verification" && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-bold">Action Required: Verify Email</p>
                <p className="text-xs text-amber-800">
                  A one-time verification link was generated during enrollment.
                </p>
              </div>
              {user.verificationLink && (
                <a
                  href={user.verificationLink}
                  className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700"
                >
                  Verify Now (1-Click)
                </a>
              )}
            </div>
          </div>
        )}

        {/* Primary Account Balances Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Checking / Cash Balance Card */}
          <div className="rounded-2xl border border-primary-foreground/10 bg-primary-deep p-6 text-primary-foreground shadow-lg md:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold">Primary Vault Balance</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-sm font-medium text-gold">$</span>
                  <span className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                    {formattedBalance}
                  </span>
                  <span className="text-xs text-primary-foreground/60">USD</span>
                </div>
              </div>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold/15 text-gold">
                <Wallet className="h-6 w-6" />
              </span>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between border-t border-primary-foreground/15 pt-4 text-xs text-primary-foreground/80">
              <div className="flex items-center gap-2">
                <span>Account:</span>
                <span className="font-mono font-semibold text-white">
                  {showFullAccount ? user.accountNumber : `•••• •••• ${user.accountNumber.slice(-4)}`}
                </span>
                <button
                  onClick={() => setShowFullAccount(!showFullAccount)}
                  className="text-gold hover:underline"
                  aria-label="Toggle account visibility"
                >
                  {showFullAccount ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-gold">
                <Shield className="h-4 w-4" /> FDIC Insured Up to $250,000
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <button
                onClick={() => setTransferModal(true)}
                className="cta-glow flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-xs font-bold text-primary-deep transition-all hover:bg-gold-deep"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send Wire / Funds</span>
              </button>

              <button
                onClick={() => {
                  addTransaction(user.id, {
                    type: "deposit",
                    description: "ACH Direct Mobile Deposit",
                    amount: 5000,
                    date: new Date().toISOString().slice(0, 10),
                    status: "completed",
                    reference: `DEP-${Math.floor(100000 + Math.random() * 900000)}`,
                  });
                  setUser(getCurrentSession());
                }}
                className="flex items-center justify-center gap-2 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-foreground/20"
              >
                <ArrowDownLeft className="h-3.5 w-3.5 text-gold" />
                <span>Deposit Funds</span>
              </button>

              <Link
                to="/services"
                className="flex items-center justify-center gap-2 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-foreground/20"
              >
                <CreditCard className="h-3.5 w-3.5 text-gold" />
                <span>Request Card</span>
              </Link>

              <Link
                to="/contact"
                className="flex items-center justify-center gap-2 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-foreground/20"
              >
                <FileText className="h-3.5 w-3.5 text-gold" />
                <span>Statement</span>
              </Link>
            </div>
          </div>

          {/* Secondary Savings / Yield Card */}
          <div className="flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  High-Yield Vault Reserve
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                  4.85% APY
                </span>
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">${formattedSavings}</p>
              <p className="mt-1 text-xs text-muted-foreground">Accruing daily interest paid monthly</p>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-secondary/50 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Monthly Limit:</span>
                <span className="font-semibold text-foreground">${user.monthlyDepositLimit.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Security PIN:</span>
                <span className="font-mono font-semibold text-foreground">Active (••••)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Ledger */}
        <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Recent Transactions & Disclosures</h2>
              <p className="text-xs text-muted-foreground">Real-time ledger activity and status</p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              Total Recorded: {user.transactions.length}
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-semibold">Date & Reference</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {user.transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-muted/30">
                      <td className="py-3.5">
                        <p className="font-semibold text-foreground">{tx.date}</p>
                        <p className="font-mono text-xs text-muted-foreground">{tx.reference}</p>
                      </td>
                      <td className="py-3.5 font-medium text-foreground">{tx.description}</td>
                      <td className="py-3.5">
                        <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium uppercase text-muted-foreground">
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle className="h-3 w-3" /> Completed
                        </span>
                      </td>
                      <td className={`py-3.5 text-right font-bold ${isPositive ? "text-emerald-600" : "text-foreground"}`}>
                        {isPositive ? "+" : ""}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Wire / Transfer Modal with PIN Security */}
      {transferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-foreground">Initiate Wire / Transfer</h3>
              <button
                onClick={() => setTransferModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {transferMsg && (
              <div
                className={`mt-4 rounded-md p-3 text-xs font-semibold ${
                  transferMsg.error ? "border border-destructive/30 bg-destructive/10 text-destructive" : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
                }`}
              >
                {transferMsg.text}
              </div>
            )}

            <form onSubmit={handleExecuteTransfer} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">Recipient Name or IBAN/Routing</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JPMorgan Chase - Escrow #3829"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-muted-foreground">Transfer Amount ($ USD)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-gold/40 bg-gold/5 p-3">
                <label className="text-xs font-bold uppercase text-primary">Enter 4-Digit Security PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={transferPin}
                  onChange={(e) => setTransferPin(e.target.value.replace(/\D/g, ""))}
                  className="mt-1.5 w-full tracking-[0.4em] rounded-md border bg-background px-3 py-2 text-center text-base font-bold focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferModal(false)}
                  className="w-1/2 rounded-md border border-border py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cta-glow w-1/2 rounded-md bg-gold py-2 text-xs font-bold text-primary-deep hover:bg-gold-deep"
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
