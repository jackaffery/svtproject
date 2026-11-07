import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sliders,
  DollarSign,
  Ban,
  RotateCcw,
} from "lucide-react";
import { meta } from "@/components/site";
import { getCurrentSession, updateUserCard, type BankUser, type BankCard } from "@/lib/bank-store";

export const Route = createFileRoute("/cards")({
  head: () =>
    meta(
      "Cards & Limits — Stronghold Vault Trust",
      "Manage institutional debit and credit cards, PIN management, and daily spending limits."
    ),
  component: CardsAndLimitsPage,
});

function CardsAndLimitsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<BankUser | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string>("");

  // PIN Management State
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");

  // Daily Spending Limit State
  const [spendingLimitInput, setSpendingLimitInput] = useState("");
  const [atmLimitInput, setAtmLimitInput] = useState("");

  const [revealNumber, setRevealNumber] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    const session = getCurrentSession();
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    setUser(session);
    if (session.cards && session.cards.length > 0) {
      const first = session.cards[0];
      setSelectedCardId(first.id);
      setSpendingLimitInput(first.dailySpendingLimit.toString());
      setAtmLimitInput(first.dailyAtmLimit.toString());
    }
  }, [navigate]);

  if (!user || !user.cards || user.cards.length === 0) {
    return (
      <div className="min-h-screen bg-[#081528] text-white flex items-center justify-center">
        <div className="text-center">
          <p>No cards issued for this account.</p>
          <Link to="/dashboard" className="text-gold underline mt-2 inline-block">Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  const selectedCard = user.cards.find((c) => c.id === selectedCardId) || user.cards[0];

  const handleSelectCard = (c: BankCard) => {
    setSelectedCardId(c.id);
    setSpendingLimitInput(c.dailySpendingLimit.toString());
    setAtmLimitInput(c.dailyAtmLimit.toString());
    setFeedback(null);
  };

  const handleUpdateLimits = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const spend = parseFloat(spendingLimitInput);
    const atm = parseFloat(atmLimitInput);

    if (isNaN(spend) || spend < 100) {
      setFeedback({ text: "Please enter a valid daily spending limit ($100 minimum).", error: true });
      return;
    }
    if (isNaN(atm) || atm < 100) {
      setFeedback({ text: "Please enter a valid daily ATM withdrawal limit ($100 minimum).", error: true });
      return;
    }

    const updated = updateUserCard(user.id, selectedCard.id, {
      dailySpendingLimit: spend,
      dailyAtmLimit: atm,
    });

    if (updated) {
      setUser(getCurrentSession());
      setFeedback({ text: `Daily spending & ATM limits updated successfully for ${selectedCard.type.toUpperCase()} card.` });
    }
  };

  const handleUpdateCardPin = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (currentPinInput !== selectedCard.pin) {
      setFeedback({ text: "Current 4-digit card PIN does not match.", error: true });
      return;
    }
    if (!/^\d{4}$/.test(newPinInput)) {
      setFeedback({ text: "New card PIN must be exactly 4 digits.", error: true });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      setFeedback({ text: "PIN confirmation does not match.", error: true });
      return;
    }

    const updated = updateUserCard(user.id, selectedCard.id, { pin: newPinInput });
    if (updated) {
      setUser(getCurrentSession());
      setCurrentPinInput("");
      setNewPinInput("");
      setConfirmPinInput("");
      setFeedback({ text: `Card PIN updated and encrypted in secure card-management hardware.` });
    }
  };

  const handleToggleFreeze = () => {
    const nextStatus = selectedCard.status === "active" ? "frozen" : "active";
    const updated = updateUserCard(user.id, selectedCard.id, { status: nextStatus });
    if (updated) {
      setUser(getCurrentSession());
      setFeedback({
        text: `Card is now ${nextStatus === "frozen" ? "FROZEN (transactions temporarily blocked)" : "ACTIVE"}.`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#081528] text-white pb-20">
      {/* Top Navbar */}
      <header className="border-b border-primary-foreground/10 bg-[#0a1b33]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded bg-gold/20 px-2.5 py-1 text-xs font-bold text-gold uppercase tracking-wider">
              Secure Card System
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pt-8">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-[#081528] shadow-md">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Cards & Limits</h1>
            <p className="text-xs text-primary-foreground/70">
              Debit, credit, PIN & daily limits • Connected to Stronghold Core Issuer
            </p>
          </div>
        </div>

        {feedback && (
          <div
            className={`mt-6 rounded-xl p-4 text-xs font-semibold ${
              feedback.error ? "border border-red-500/30 bg-red-500/20 text-red-200" : "border border-emerald-500/30 bg-emerald-500/20 text-emerald-200"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Card Selector Tabs */}
        <div className="mt-8 flex gap-3">
          {user.cards.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectCard(c)}
              className={`rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                selectedCard.id === c.id
                  ? "bg-gold text-[#081528] shadow-lg scale-105"
                  : "bg-[#0e2240] text-primary-foreground/70 hover:bg-[#122b52]"
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>{c.type} Card (••••{c.cardNumber.slice(-4)})</span>
            </button>
          ))}
        </div>

        {/* Visual Card Display */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Physical / Virtual Card Mockup */}
          <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-br from-[#0e2240] via-[#0a1b33] to-[#061120] p-6 text-white shadow-2xl flex flex-col justify-between min-h-[220px]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold">
                  STRONGHOLD VAULT TRUST
                </span>
                <p className="text-xs text-primary-foreground/70 uppercase font-semibold mt-0.5">
                  {selectedCard.type === "credit" ? "Private Wealth Platinum" : "Institutional Commercial"}
                </p>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                  selectedCard.status === "active" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                }`}
              >
                {selectedCard.status}
              </span>
            </div>

            <div className="my-4">
              <span className="font-mono text-xl tracking-[0.2em] font-extrabold text-white">
                {revealNumber ? selectedCard.cardNumber.replace(/•/g, "4") : selectedCard.cardNumber}
              </span>
              <div className="mt-2 flex items-center justify-between text-xs text-primary-foreground/70">
                <span>Expires: <strong>{selectedCard.expiryDate}</strong></span>
                <span>CVV: <strong>{revealNumber ? selectedCard.cvv : "•••"}</strong></span>
                <button
                  type="button"
                  onClick={() => setRevealNumber(!revealNumber)}
                  className="text-gold hover:underline flex items-center gap-1 text-[11px]"
                >
                  {revealNumber ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  <span>{revealNumber ? "Hide" : "Show"}</span>
                </button>
              </div>
            </div>

            <div className="flex items-end justify-between border-t border-primary-foreground/15 pt-3 text-xs">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Cardholder</span>
                <p className="font-bold tracking-wider">{selectedCard.cardholderName}</p>
              </div>
              <button
                onClick={handleToggleFreeze}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                  selectedCard.status === "active"
                    ? "bg-red-600/80 text-white hover:bg-red-700"
                    : "bg-emerald-600/80 text-white hover:bg-emerald-700"
                }`}
              >
                {selectedCard.status === "active" ? "Freeze Card" : "Unfreeze Card"}
              </button>
            </div>
          </div>

          {/* Daily Spending & ATM Limits Form */}
          <div className="rounded-2xl border border-white/20 bg-white p-6 text-[#12233b] shadow-xl text-xs">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Sliders className="h-4 w-4 text-gold-ink" />
              <h3 className="font-bold text-[#0a1b33] uppercase tracking-wider">
                Daily Spending Limits
              </h3>
            </div>

            <form onSubmit={handleUpdateLimits} className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between font-bold text-gray-600 uppercase text-[11px]">
                  <span>Daily Point-of-Sale / Online Limit</span>
                  <span className="text-[#0a1b33]">Current: ${selectedCard.dailySpendingLimit.toLocaleString()}</span>
                </div>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    required
                    value={spendingLimitInput}
                    onChange={(e) => setSpendingLimitInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-7 pr-3 font-mono font-bold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-gray-600 uppercase text-[11px]">
                  <span>Daily ATM Cash Withdrawal Limit</span>
                  <span className="text-[#0a1b33]">Current: ${selectedCard.dailyAtmLimit.toLocaleString()}</span>
                </div>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    required
                    value={atmLimitInput}
                    onChange={(e) => setAtmLimitInput(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-7 pr-3 font-mono font-bold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-2.5 text-[11px] text-gray-500">
                Changes apply immediately across all global payment terminals and sync with Solo Admin.
              </div>

              <button
                type="submit"
                className="cta-glow w-full rounded-lg bg-gold py-2.5 font-bold text-[#081528] hover:bg-gold-deep transition-all"
              >
                Update Daily Limits
              </button>
            </form>
          </div>
        </div>

        {/* PIN Management Section */}
        <div className="mt-8 rounded-2xl border border-white/20 bg-white p-6 text-[#12233b] shadow-xl text-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-gold-ink" />
              <h3 className="font-bold text-[#0a1b33] uppercase tracking-wider">
                Card PIN Management
              </h3>
            </div>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Hardware Encrypted
            </span>
          </div>

          <form onSubmit={handleUpdateCardPin} className="mt-4 space-y-4">
            <p className="text-gray-500 text-[11px]">
              Set or change the 4-digit security PIN for your {selectedCard.type.toUpperCase()} card (••••{selectedCard.cardNumber.slice(-4)}). Used at physical merchant POS devices and ATM terminals.
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="font-bold uppercase text-gray-500">Current 4-Digit Card PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={currentPinInput}
                  onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ""))}
                  className="mt-1 w-full tracking-[0.4em] rounded-lg border border-gray-300 bg-gray-50 p-2 text-center text-sm font-bold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-500">New 4-Digit PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ""))}
                  className="mt-1 w-full tracking-[0.4em] rounded-lg border border-gray-300 bg-gray-50 p-2 text-center text-sm font-bold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-500">Confirm New PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ""))}
                  className="mt-1 w-full tracking-[0.4em] rounded-lg border border-gray-300 bg-gray-50 p-2 text-center text-sm font-bold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="rounded-lg bg-[#0a1b33] px-6 py-2.5 font-bold text-white hover:bg-[#122b52] transition-colors"
            >
              Authorize & Save Card PIN
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
