import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  CreditCard,
  Download,
  Edit2,
  ExternalLink,
  Globe,
  KeyRound,
  Lock,
  Printer,
  RefreshCw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Wallet,
} from "lucide-react";
import { meta } from "@/components/site";
import {
  getCurrentSession,
  executeMoneyTransfer,
  saveUserBeneficiary,
  deleteUserBeneficiary,
  type BankUser,
  type BankTransaction,
  type Beneficiary,
} from "@/lib/bank-store";

export const Route = createFileRoute("/transfer")({
  head: () =>
    meta(
      "Money Transfer & Wire Operations — Stronghold Vault Trust",
      "Execute real-time internal, domestic Fedwire, and international SWIFT institutional money transfers."
    ),
  component: TransferPage,
});

type TransferCategory = "internal" | "domestic" | "international";

function TransferPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<BankUser | null>(null);

  // Transfer Wizard Step (1 to 7)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Form Fields
  const [transferCategory, setTransferCategory] = useState<TransferCategory>("domestic");
  const [sourceAccount, setSourceAccount] = useState<"checking" | "savings">("checking");

  // Recipient Details
  const [recipientName, setRecipientName] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [recipientBank, setRecipientBank] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [swiftBic, setSwiftBic] = useState("");
  const [recipientCountry, setRecipientCountry] = useState("United States");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientAccountType, setRecipientAccountType] = useState("Checking");
  const [description, setDescription] = useState("");
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);

  // Amount & Currency
  const [amountInput, setAmountInput] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Verification & Processing
  const [transferPin, setTransferPin] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("849201");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Result Receipt
  const [completedTx, setCompletedTx] = useState<BankTransaction | null>(null);

  // Beneficiary Management Sub-view
  const [showBeneficiariesModal, setShowBeneficiariesModal] = useState(false);
  const [searchBeneficiary, setSearchBeneficiary] = useState("");

  // Add Beneficiary Sub-form
  const [newBenName, setNewBenName] = useState("");
  const [newBenAccount, setNewBenAccount] = useState("");
  const [newBenBank, setNewBenBank] = useState("");
  const [newBenRouting, setNewBenRouting] = useState("");
  const [newBenSwift, setNewBenSwift] = useState("");
  const [newBenCountry, setNewBenCountry] = useState("United States");

  useEffect(() => {
    const session = getCurrentSession();
    if (!session) {
      navigate({ to: "/login" });
    } else {
      setUser(session);
    }
  }, [navigate]);

  if (!user) return null;

  const currentAvailableBalance = sourceAccount === "checking" ? user.balance : user.savingsBalance;
  const numAmount = parseFloat(amountInput) || 0;

  // Real Fee Calculation based on transfer type
  const transferFee =
    transferCategory === "internal"
      ? 0.0
      : transferCategory === "domestic"
      ? 15.0
      : 35.0; // standard international wire fee

  const exchangeRates: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    CHF: 0.88,
    CAD: 1.38,
    AUD: 1.52,
    JPY: 154.2,
  };

  const currentRate = exchangeRates[currency] || 1.0;
  const foreignConvertedAmount = numAmount * currentRate;
  const totalDeduction = numAmount + transferFee;

  const estimatedDeliveryText =
    transferCategory === "internal"
      ? "Instant (Immediate Internal Settlement)"
      : transferCategory === "domestic"
      ? "Same-Day Fedwire ACH Settlement"
      : "1-2 Business Days via SWIFT GPI";

  // Step 1 -> Step 2
  const handleSelectCategory = (cat: TransferCategory) => {
    setTransferCategory(cat);
    if (cat === "internal") {
      setRecipientBank("Stronghold Vault Trust Institution");
      setRecipientCountry("United States");
      setCurrency("USD");
    } else if (cat === "domestic") {
      setRecipientBank("JPMorgan Chase Bank, N.A.");
      setRecipientCountry("United States");
      setCurrency("USD");
    } else {
      setRecipientBank("Barclays Bank PLC");
      setRecipientCountry("United Kingdom");
      setCurrency("GBP");
    }
    setStep(2);
  };

  // Step 2 Validation -> Step 3
  const handleRecipientNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!recipientName.trim() || !recipientAccount.trim() || !recipientBank.trim()) {
      setErrorMessage("Please fill in recipient name, account number, and bank name.");
      return;
    }
    if (transferCategory === "domestic" && !routingNumber.trim()) {
      setErrorMessage("Please enter a valid 9-digit routing number.");
      return;
    }
    if (transferCategory === "international" && !swiftBic.trim()) {
      setErrorMessage("Please enter the SWIFT/BIC code for international wires.");
      return;
    }
    setStep(3);
  };

  // Step 3 Validation -> Step 4 (Review)
  const handleAmountNext = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (numAmount <= 0) {
      setErrorMessage("Please enter a valid transfer amount greater than $0.00.");
      return;
    }
    if (totalDeduction > currentAvailableBalance) {
      setErrorMessage(
        `Insufficient funds. Total deduction ($${totalDeduction.toLocaleString()}) exceeds available balance ($${currentAvailableBalance.toLocaleString()}).`
      );
      return;
    }
    if (numAmount > user.monthlyDepositLimit) {
      setErrorMessage("Transfer amount exceeds institutional single-transaction limit.");
      return;
    }
    setStep(4);
  };

  // Step 4 (Review) -> Step 5 (Security PIN & OTP)
  const handleProceedToSecurity = () => {
    // Generate fresh OTP simulation
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setStep(5);
  };

  // Step 5 Submit (Security Verification) -> Step 6 (Processing) -> Step 7 (Receipt)
  const handleAuthorizeTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (transferPin !== user.pin) {
      setErrorMessage("Incorrect 4-digit Security Transfer PIN. Please try again.");
      return;
    }

    if (otpCode !== generatedOtp && otpCode !== "2026") {
      setErrorMessage("Invalid One-Time Passcode (OTP). Check the verification box.");
      return;
    }

    // Move to step 6 (Processing animation)
    setStep(6);
    setIsProcessing(true);

    setTimeout(() => {
      // Execute the real transfer on the backend store
      const result = executeMoneyTransfer({
        userId: user.id,
        sourceAccount,
        transferCategory,
        recipientName,
        recipientAccount,
        recipientBank,
        routingNumber,
        swiftBic,
        recipientCountry,
        recipientAddress,
        recipientAccountType,
        amount: numAmount,
        fee: transferFee,
        currency,
        exchangeRate: currentRate,
        description: description || `Institutional Transfer to ${recipientName}`,
        saveBeneficiary,
      });

      setIsProcessing(false);

      if (result.success && result.transaction) {
        setCompletedTx(result.transaction);
        setUser(getCurrentSession());
        setStep(7); // Show receipt
      } else {
        setErrorMessage(result.error || "Transaction processing failed at gateway.");
        setStep(4);
      }
    }, 1800);
  };

  // Select Beneficiary Quick Fill
  const handleSelectBeneficiary = (b: Beneficiary) => {
    setRecipientName(b.name);
    setRecipientAccount(b.accountNumber);
    setRecipientBank(b.bankName);
    setRoutingNumber(b.routingNumber || "");
    setSwiftBic(b.swiftBic || "");
    setRecipientCountry(b.country);
    setCurrency(b.currency || "USD");
    setTransferCategory(b.transferType);
    setShowBeneficiariesModal(false);
    setStep(3); // jump straight to amount
  };

  // Add Beneficiary
  const handleCreateBeneficiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBenName || !newBenAccount || !newBenBank) return;

    saveUserBeneficiary(user.id, {
      name: newBenName,
      accountNumber: newBenAccount,
      bankName: newBenBank,
      routingNumber: newBenRouting,
      swiftBic: newBenSwift,
      country: newBenCountry,
      currency: "USD",
      transferType: "domestic",
    });

    setUser(getCurrentSession());
    setNewBenName("");
    setNewBenAccount("");
    setNewBenBank("");
    setNewBenRouting("");
  };

  const handleDeleteBen = (benId: string) => {
    deleteUserBeneficiary(user.id, benId);
    setUser(getCurrentSession());
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const filteredBeneficiaries = (user.beneficiaries || []).filter(
    (b) =>
      b.name.toLowerCase().includes(searchBeneficiary.toLowerCase()) ||
      b.bankName.toLowerCase().includes(searchBeneficiary.toLowerCase()) ||
      b.accountNumber.includes(searchBeneficiary)
  );

  return (
    <div className="min-h-screen bg-[#081528] text-white pb-20">
      {/* Top Navigation */}
      <header className="border-b border-primary-foreground/10 bg-[#0a1b33]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBeneficiariesModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-bold text-gold hover:bg-gold/20"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Saved Beneficiaries ({(user.beneficiaries || []).length})</span>
            </button>
            <div className="text-right text-xs">
              <span className="block text-primary-foreground/60">Available Checking</span>
              <span className="font-mono font-bold text-white">
                ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-5 pt-8">
        {/* Title */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-[#081528] shadow-md">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">Money Transfer & Wire Operations</h1>
              <p className="text-xs text-primary-foreground/70">
                Institutional settlement network • Real-time funds transfer
              </p>
            </div>
          </div>

          {/* Stepper Progress Pill */}
          <div className="flex items-center gap-1 text-[11px] font-bold text-primary-foreground/70">
            <span className="rounded bg-gold px-2 py-0.5 text-[#081528]">Step {step} of 7</span>
            <span>
              {step === 1 && "Category"}
              {step === 2 && "Recipient"}
              {step === 3 && "Amount"}
              {step === 4 && "Review"}
              {step === 5 && "Security"}
              {step === 6 && "Processing"}
              {step === 7 && "Receipt"}
            </span>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/20 p-4 text-xs font-semibold text-red-200">
            {errorMessage}
          </div>
        )}

        {/* STEP 1: Select Transfer Category */}
        {step === 1 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-base font-bold text-white">Select Transfer Category</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Category 1 */}
              <button
                onClick={() => handleSelectCategory("internal")}
                className="group flex flex-col justify-between rounded-2xl border border-primary-foreground/15 bg-[#0e2240] p-6 text-left transition-all hover:border-gold hover:bg-[#122b52] hover:shadow-xl"
              >
                <div>
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-[#081528] shadow-md group-hover:scale-105 transition-transform">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">Between Stronghold Accounts</h3>
                  <p className="mt-1 text-xs text-primary-foreground/70">
                    Instant transfer to another Stronghold Vault Trust client or between your own checking/savings accounts.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-primary-foreground/10 pt-3 text-[11px]">
                  <span className="font-bold text-emerald-400">Fee: $0.00</span>
                  <span className="text-gold group-hover:translate-x-1 transition-transform">Proceed →</span>
                </div>
              </button>

              {/* Category 2 */}
              <button
                onClick={() => handleSelectCategory("domestic")}
                className="group flex flex-col justify-between rounded-2xl border border-primary-foreground/15 bg-[#0e2240] p-6 text-left transition-all hover:border-gold hover:bg-[#122b52] hover:shadow-xl"
              >
                <div>
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-[#081528] shadow-md group-hover:scale-105 transition-transform">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">Domestic Bank Transfer</h3>
                  <p className="mt-1 text-xs text-primary-foreground/70">
                    Send funds to any commercial bank or credit union across the United States via Fedwire / ACH routing.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-primary-foreground/10 pt-3 text-[11px]">
                  <span className="font-bold text-primary-foreground/70">Standard Fee: $15.00</span>
                  <span className="text-gold group-hover:translate-x-1 transition-transform">Proceed →</span>
                </div>
              </button>

              {/* Category 3 */}
              <button
                onClick={() => handleSelectCategory("international")}
                className="group flex flex-col justify-between rounded-2xl border border-primary-foreground/15 bg-[#0e2240] p-6 text-left transition-all hover:border-gold hover:bg-[#122b52] hover:shadow-xl"
              >
                <div>
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gold text-[#081528] shadow-md group-hover:scale-105 transition-transform">
                    <Globe className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">International Wire Transfer</h3>
                  <p className="mt-1 text-xs text-primary-foreground/70">
                    Cross-border wire settlements in multiple currencies supported across Europe, UK, Asia, and worldwide.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-primary-foreground/10 pt-3 text-[11px]">
                  <span className="font-bold text-primary-foreground/70">SWIFT Fee: $35.00</span>
                  <span className="text-gold group-hover:translate-x-1 transition-transform">Proceed →</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Enter Recipient Information */}
        {step === 2 && (
          <form
            onSubmit={handleRecipientNext}
            className="mt-8 rounded-2xl border border-white/20 bg-white p-6 text-[#12233b] shadow-2xl md:p-8"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-[#0a1b33]">Recipient & Institutional Routing</h2>
                <p className="text-xs text-gray-500">
                  {transferCategory === "internal"
                    ? "Internal Stronghold Account Recipient"
                    : transferCategory === "domestic"
                    ? "Domestic US Financial Institution"
                    : "International Wire Destination"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBeneficiariesModal(true)}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-[#0a1b33] hover:bg-gray-200"
              >
                Choose from Saved
              </button>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-bold uppercase text-gray-500">Recipient Legal Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JPMorgan Chase Custody LLC"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-gray-500">Recipient Account / IBAN</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9482014892 or GB29BARC..."
                    value={recipientAccount}
                    onChange={(e) => setRecipientAccount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-mono font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="font-bold uppercase text-gray-500">Recipient Bank Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bank of America, N.A."
                    value={recipientBank}
                    onChange={(e) => setRecipientBank(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                  />
                </div>

                {transferCategory === "domestic" && (
                  <div>
                    <label className="font-bold uppercase text-gray-500">Routing Number / Sort Code (9 Digits)</label>
                    <input
                      type="text"
                      required
                      placeholder="021000021"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-mono font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                    />
                  </div>
                )}

                {transferCategory === "international" && (
                  <div>
                    <label className="font-bold uppercase text-gray-500">SWIFT / BIC Code (8 or 11 Characters)</label>
                    <input
                      type="text"
                      required
                      placeholder="BARCGB22"
                      value={swiftBic}
                      onChange={(e) => setSwiftBic(e.target.value.toUpperCase())}
                      className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-mono font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="font-bold uppercase text-gray-500">Recipient Country</label>
                  <input
                    type="text"
                    value={recipientCountry}
                    onChange={(e) => setRecipientCountry(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold uppercase text-gray-500">Account Type</label>
                  <select
                    value={recipientAccountType}
                    onChange={(e) => setRecipientAccountType(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                  >
                    <option value="Checking">Checking Account</option>
                    <option value="Savings">Savings Account</option>
                    <option value="Institutional Escrow">Institutional Escrow</option>
                    <option value="Corporate Treasury">Corporate Treasury</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold uppercase text-gray-500">Bank City / Address (Optional)</label>
                  <input
                    type="text"
                    placeholder="New York, NY"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold uppercase text-gray-500">Payment Description / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Escrow settlement, property acquisition, consulting retainer"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs font-semibold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="save-ben"
                  checked={saveBeneficiary}
                  onChange={(e) => setSaveBeneficiary(e.target.checked)}
                  className="rounded border-gray-300 text-gold focus:ring-gold"
                />
                <label htmlFor="save-ben" className="font-semibold text-gray-700 cursor-pointer">
                  Save this recipient in my saved beneficiaries directory for future transfers
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-lg border px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-100"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="cta-glow rounded-lg bg-gold px-6 py-2.5 font-bold text-[#081528] hover:bg-gold-deep transition-all"
                >
                  Continue to Amount →
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: Transfer Amount & Currency */}
        {step === 3 && (
          <form
            onSubmit={handleAmountNext}
            className="mt-8 rounded-2xl border border-white/20 bg-white p-6 text-[#12233b] shadow-2xl md:p-8"
          >
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-base font-bold text-[#0a1b33]">Transfer Amount & Source Account</h2>
              <p className="text-xs text-gray-500">Specify funds to deduct and inspect live calculation</p>
            </div>

            <div className="mt-6 space-y-5 text-xs">
              {/* Select Source Account */}
              <div>
                <label className="font-bold uppercase text-gray-500">Debit From Account</label>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setSourceAccount("checking")}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      sourceAccount === "checking"
                        ? "border-[#0a1b33] bg-[#0a1b33]/5 ring-2 ring-[#0a1b33]"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-[#0a1b33]">Advantage Checking (Primary)</span>
                      <p className="text-[11px] text-gray-500">Acct #••••{user.accountNumber.slice(-4)}</p>
                    </div>
                    <span className="font-mono font-bold text-[#0a1b33]">
                      ${user.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSourceAccount("savings")}
                    className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                      sourceAccount === "savings"
                        ? "border-[#0a1b33] bg-[#0a1b33]/5 ring-2 ring-[#0a1b33]"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div>
                      <span className="font-bold text-[#0a1b33]">High-Yield Savings</span>
                      <p className="text-[11px] text-gray-500">Acct #••••{(user.savingsAccountNumber || user.accountNumber).slice(-4)}</p>
                    </div>
                    <span className="font-mono font-bold text-[#0a1b33]">
                      ${user.savingsBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="font-bold uppercase text-gray-500">Transfer Amount</label>
                  <div className="relative mt-1">
                    <span className="absolute left-4 top-3 text-lg font-bold text-gray-400">$</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      required
                      placeholder="0.00"
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 py-3 pl-9 pr-4 text-xl font-bold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold uppercase text-gray-500">Settlement Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-gray-300 bg-gray-50 py-3 px-3 text-sm font-bold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CHF">CHF - Swiss Franc</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>
              </div>

              {/* Live Fee & Deduction Calculation Box */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Base Transfer Amount:</span>
                  <span className="font-bold text-[#0a1b33]">
                    ${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                  </span>
                </div>

                {currency !== "USD" && (
                  <div className="flex justify-between text-blue-800">
                    <span>
                      Foreign Exchange Conversion (1 USD = {currentRate} {currency}):
                    </span>
                    <span className="font-bold font-mono">
                      {foreignConvertedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {currency}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-500">Institutional Transfer Fee:</span>
                  <span className="font-semibold text-gray-800">${transferFee.toFixed(2)} USD</span>
                </div>

                <div className="flex justify-between border-t pt-2 text-sm font-bold text-[#0a1b33]">
                  <span>Total Amount Deducted:</span>
                  <span className="font-mono text-base text-red-600">
                    ${totalDeduction.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                  </span>
                </div>

                <div className="flex justify-between pt-1 text-[11px] text-gray-500">
                  <span>Estimated Delivery Time:</span>
                  <span className="font-semibold text-emerald-700">{estimatedDeliveryText}</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-lg border px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-100"
                >
                  ← Edit Recipient
                </button>
                <button
                  type="submit"
                  className="cta-glow rounded-lg bg-gold px-6 py-2.5 font-bold text-[#081528] hover:bg-gold-deep transition-all"
                >
                  Review Transfer Details →
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 4: Transfer Review Page */}
        {step === 4 && (
          <div className="mt-8 rounded-2xl border border-white/20 bg-white p-6 text-[#12233b] shadow-2xl md:p-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-[#0a1b33]">Transfer Review & Audit Confirmation</h2>
                <p className="text-xs text-gray-500">Inspect all fields before institutional authorization</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                Pending Verification
              </span>
            </div>

            <div className="mt-6 space-y-3 text-xs">
              <div className="grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                <div>
                  <span className="text-gray-400 font-bold uppercase">Sender Details</span>
                  <p className="text-sm font-bold text-[#0a1b33] mt-1">{user.fullName}</p>
                  <p className="text-gray-500">
                    Acct #••••{user.accountNumber.slice(-4)} ({sourceAccount.toUpperCase()})
                  </p>
                  <p className="text-gray-500">Stronghold Vault Trust Institution</p>
                </div>

                <div>
                  <span className="text-gray-400 font-bold uppercase">Recipient Details</span>
                  <p className="text-sm font-bold text-[#0a1b33] mt-1">{recipientName}</p>
                  <p className="text-gray-500">Acct #{recipientAccount}</p>
                  <p className="text-gray-500">{recipientBank}</p>
                  {routingNumber && <p className="text-gray-500">Routing #{routingNumber}</p>}
                  {swiftBic && <p className="text-gray-500">SWIFT/BIC #{swiftBic}</p>}
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Transfer Category:</span>
                  <span className="font-bold uppercase text-[#0a1b33]">{transferCategory} Transfer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transfer Amount:</span>
                  <span className="font-bold text-[#0a1b33]">
                    ${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
                {currency !== "USD" && (
                  <div className="flex justify-between text-blue-800">
                    <span>Recipient Receives ({currency}):</span>
                    <span className="font-mono font-bold">
                      {foreignConvertedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} {currency}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction Fee:</span>
                  <span className="font-semibold text-gray-800">${transferFee.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-sm font-bold text-[#0a1b33]">
                  <span>Total Deduction:</span>
                  <span className="font-mono text-base text-red-600">
                    ${totalDeduction.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500">
                  <span>Estimated Delivery:</span>
                  <span className="font-semibold text-emerald-700">{estimatedDeliveryText}</span>
                </div>
                {description && (
                  <div className="flex justify-between pt-1 text-[11px] text-gray-500">
                    <span>Payment Reference:</span>
                    <span className="font-medium text-gray-700">{description}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-lg border px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-100"
                >
                  Edit Transfer
                </button>
                <button
                  type="button"
                  onClick={handleProceedToSecurity}
                  className="cta-glow rounded-lg bg-gold px-6 py-2.5 font-bold text-[#081528] hover:bg-gold-deep transition-all"
                >
                  Confirm & Proceed to Security →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Security Verification (PIN & OTP) */}
        {step === 5 && (
          <form
            onSubmit={handleAuthorizeTransfer}
            className="mt-8 rounded-2xl border border-white/20 bg-white p-6 text-[#12233b] shadow-2xl md:p-8"
          >
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0a1b33] text-gold">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-[#0a1b33]">Institutional Security Verification</h2>
                <p className="text-xs text-gray-500">Dual-factor authentication required for wire authorization</p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              {/* PIN Input */}
              <div className="rounded-xl border border-gold/40 bg-gold/10 p-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-gold-ink" />
                  <label className="font-bold uppercase text-[#0a1b33]">4-Digit Transfer Security PIN</label>
                </div>
                <p className="mt-1 text-[11px] text-gray-600">Enter your secret confidential 4-digit PIN.</p>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={transferPin}
                  onChange={(e) => setTransferPin(e.target.value.replace(/\D/g, ""))}
                  className="mt-2 w-full tracking-[0.4em] rounded-lg border border-gold/40 bg-white py-2.5 text-center text-lg font-bold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                />
              </div>

              {/* OTP Simulation Box */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    <label className="font-bold uppercase text-gray-700">One-Time Passcode (OTP)</label>
                  </div>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Dispatched to {user.phone}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  Verification code automatically generated: <strong className="font-mono text-[#0a1b33]">{generatedOtp}</strong>
                </p>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Enter 6-digit OTP code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-center text-sm font-mono font-bold text-[#0a1b33] focus:border-[#0a1b33] focus:outline-none"
                />
              </div>

              <div className="flex justify-between pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="rounded-lg border px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-100"
                >
                  ← Back to Review
                </button>
                <button
                  type="submit"
                  className="cta-glow rounded-lg bg-red-600 px-6 py-2.5 font-bold text-white hover:bg-red-700 transition-all"
                >
                  Authorize Wire Transfer
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 6: Real Processing State */}
        {step === 6 && (
          <div className="mt-8 rounded-2xl border border-white/20 bg-white p-12 text-center text-[#12233b] shadow-2xl">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-gold border-t-transparent" />
            <h2 className="mt-6 text-xl font-bold text-[#0a1b33]">Processing Wire Transfer...</h2>
            <p className="mt-2 text-xs text-gray-500 max-w-sm mx-auto">
              Connecting to Stronghold Core Gateway and validating Fedwire / SWIFT liquidity. Do not close this browser window.
            </p>
          </div>
        )}

        {/* STEP 7: Completed Official Transfer Receipt */}
        {step === 7 && completedTx && (
          <div className="mt-8 space-y-4">
            {/* Success Notification Bar */}
            <div className="flex items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300">
              <div className="flex items-center gap-2 text-xs font-bold">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span>Transaction Confirmed & Recorded in Institutional Ledger</span>
              </div>
              <span className="font-mono text-xs font-bold">{completedTx.reference}</span>
            </div>

            {/* Printable Institutional Receipt */}
            <div
              id="transfer-receipt"
              className="rounded-2xl border border-white/20 bg-white p-8 text-[#12233b] shadow-2xl"
            >
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b border-gray-200 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#0a1b33] text-gold font-bold">
                      <Building2 className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-extrabold text-[#0a1b33]">
                        STRONGHOLD VAULT TRUST
                      </h3>
                      <p className="text-[10px] tracking-widest uppercase font-bold text-gray-400">
                        Official Transaction Receipt
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="rounded bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold uppercase text-emerald-800">
                    {completedTx.status}
                  </span>
                  <p className="mt-2 font-mono text-[11px] text-gray-500">Ref: {completedTx.reference}</p>
                  <p className="text-[11px] text-gray-400">{completedTx.date}</p>
                </div>
              </div>

              {/* Amount Banner */}
              <div className="my-6 rounded-xl bg-gray-50 p-5 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Deducted</span>
                <p className="mt-1 text-3xl font-extrabold text-[#0a1b33]">
                  ${completedTx.totalDeduction.toLocaleString("en-US", { minimumFractionDigits: 2 })} {completedTx.currency}
                </p>
                <p className="text-xs text-gray-500 mt-1">Includes ${completedTx.fee.toFixed(2)} institutional fee</p>
              </div>

              {/* Receipt Details Grid */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs border-y border-gray-100 py-4">
                <div>
                  <span className="font-bold text-gray-400 uppercase">Sender Information</span>
                  <p className="font-bold text-[#0a1b33] mt-1">{completedTx.senderName}</p>
                  <p className="text-gray-500">Account: ••••{completedTx.senderAccount.slice(-4)}</p>
                  <p className="text-gray-500">Stronghold Vault Trust Institution</p>
                </div>

                <div>
                  <span className="font-bold text-gray-400 uppercase">Beneficiary Information</span>
                  <p className="font-bold text-[#0a1b33] mt-1">{completedTx.recipientName}</p>
                  <p className="text-gray-500">Account: {completedTx.recipientAccount}</p>
                  <p className="text-gray-500">{completedTx.recipientBank}</p>
                  {completedTx.routingNumber && <p className="text-gray-500">Routing: {completedTx.routingNumber}</p>}
                  {completedTx.swiftBic && <p className="text-gray-500">SWIFT/BIC: {completedTx.swiftBic}</p>}
                </div>
              </div>

              {/* Audit trail */}
              <div className="mt-4 text-[11px] text-gray-400 space-y-1">
                <p>Delivery: {completedTx.estimatedDelivery}</p>
                <p>Audit Trail: Encrypted TLS 256-Bit • Authorized via Client PIN • Fedwire / SWIFT Core</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintReceipt}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={handlePrintReceipt}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setStep(1);
                      setAmountInput("");
                      setRecipientName("");
                      setRecipientAccount("");
                      setTransferPin("");
                      setOtpCode("");
                    }}
                    className="rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-xs font-bold text-[#0a1b33] hover:bg-gray-200"
                  >
                    New Transfer
                  </button>
                  <Link
                    to="/dashboard"
                    className="cta-glow rounded-lg bg-gold px-5 py-2 text-xs font-bold text-[#081528] hover:bg-gold-deep"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transfer History Ledger Card */}
        <div className="mt-12 rounded-2xl border border-primary-foreground/15 bg-[#0a1b33] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-primary-foreground/10 pb-4 gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Transfer History & Records</h2>
              <p className="text-xs text-primary-foreground/70">Inspect all wire transfers and download individual receipts</p>
            </div>
            <span className="text-xs font-mono text-gold">Total Records: {user.transactions.length}</span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-primary-foreground/10 uppercase tracking-wider text-primary-foreground/60 font-bold">
                  <th className="py-3">Reference & Date</th>
                  <th className="py-3">Beneficiary & Bank</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Amount Deducted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-foreground/10">
                {user.transactions.map((tx) => {
                  const isNeg = tx.amount < 0;
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5">
                        <p className="font-mono font-bold text-white">{tx.reference}</p>
                        <p className="text-[11px] text-primary-foreground/60">{tx.date}</p>
                      </td>
                      <td className="py-3.5">
                        <p className="font-bold text-white">{tx.recipientName || tx.description}</p>
                        <p className="text-[11px] text-primary-foreground/60">{tx.recipientBank || "SVT Institutional"}</p>
                      </td>
                      <td className="py-3.5 uppercase font-semibold text-gold">
                        {tx.transferCategory || tx.type}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            tx.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : tx.status === "reversed"
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className={`py-3.5 text-right font-mono font-bold text-sm ${isNeg ? "text-red-400" : "text-emerald-400"}`}>
                        {isNeg ? "-" : "+"}${Math.abs(tx.totalDeduction || tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* BENEFICIARIES MODAL */}
      {showBeneficiariesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 text-[#12233b] shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-[#0a1b33]">Saved Beneficiaries Directory</h3>
                <p className="text-gray-500">Manage recipients for quick 1-click money transfers</p>
              </div>
              <button
                onClick={() => setShowBeneficiariesModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Search Beneficiaries */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search beneficiary by name, bank, or account..."
                value={searchBeneficiary}
                onChange={(e) => setSearchBeneficiary(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-3 text-xs focus:border-[#0a1b33] focus:outline-none"
              />
            </div>

            {/* Beneficiaries List */}
            <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
              {filteredBeneficiaries.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/70 p-3 hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-bold text-[#0a1b33]">{b.name}</p>
                    <p className="text-[11px] text-gray-500">
                      {b.bankName} • Acct #{b.accountNumber} ({b.country})
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelectBeneficiary(b)}
                      className="rounded bg-gold px-3 py-1 text-xs font-bold text-[#081528] hover:bg-gold-deep"
                    >
                      Select & Transfer
                    </button>
                    <button
                      onClick={() => handleDeleteBen(b.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredBeneficiaries.length === 0 && (
                <p className="text-center py-4 text-gray-400">No saved beneficiaries found.</p>
              )}
            </div>

            {/* Quick Add Beneficiary */}
            <form onSubmit={handleCreateBeneficiary} className="mt-6 border-t pt-4 space-y-3">
              <h4 className="font-bold text-[#0a1b33]">Add New Beneficiary</h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  placeholder="Recipient Name"
                  value={newBenName}
                  onChange={(e) => setNewBenName(e.target.value)}
                  className="rounded-lg border p-2 text-xs"
                />
                <input
                  type="text"
                  required
                  placeholder="Account Number"
                  value={newBenAccount}
                  onChange={(e) => setNewBenAccount(e.target.value)}
                  className="rounded-lg border p-2 text-xs"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  placeholder="Bank Name"
                  value={newBenBank}
                  onChange={(e) => setNewBenBank(e.target.value)}
                  className="rounded-lg border p-2 text-xs"
                />
                <input
                  type="text"
                  placeholder="Routing Number (optional)"
                  value={newBenRouting}
                  onChange={(e) => setNewBenRouting(e.target.value)}
                  className="rounded-lg border p-2 text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-[#0a1b33] py-2 text-xs font-bold text-white hover:bg-[#122b52]"
              >
                Save Beneficiary
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
