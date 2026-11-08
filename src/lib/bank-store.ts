export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  routingNumber?: string | undefined;
  swiftBic?: string | undefined;
  country: string;
  currency: string;
  transferType: "internal" | "domestic" | "international";
  createdAt: string;
}

export interface BankTransaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer" | "wire" | "fee";
  transferCategory?: "internal" | "domestic" | "international" | undefined;
  description: string;
  amount: number; // negative for deductions
  fee: number;
  totalDeduction: number;
  currency: string;
  exchangeRate?: number | undefined;
  senderName: string;
  senderAccount: string;
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
  routingNumber?: string | undefined;
  swiftBic?: string | undefined;
  recipientCountry?: string | undefined;
  recipientAddress?: string | undefined;
  estimatedDelivery?: string | undefined;
  date: string;
  status: "pending" | "processing" | "completed" | "failed" | "reversed";
  reference: string;
  auditTrail?: { timestamp: string; action: string; performedBy: string }[] | undefined;
}

export interface BankCard {
  id: string;
  type: "debit" | "credit";
  cardholderName: string;
  cardNumber: string; // e.g. "4532 •••• •••• 8841"
  expiryDate: string;
  cvv: string;
  pin: string;
  status: "active" | "frozen" | "blocked";
  dailySpendingLimit: number;
  dailyAtmLimit: number;
  currentDailySpend: number;
  billingAddress: string;
  issuedDate: string;
}

export interface DigitalAssetHolding {
  symbol: "BTC" | "ETH";
  name: string;
  balance: number;
  fiatValueUsd: number;
  custodyVaultAddress: string;
  status: "active" | "pending_network_sync" | "maintenance";
  lastAuditTimestamp: string;
}

export interface IrsRefundRecord {
  id: string;
  ssnLast4: string;
  taxYear: string;
  refundAmount: number;
  filingStatus: "Single" | "Married Filing Jointly" | "Head of Household";
  depositStatus: "pending_review" | "approved" | "deposited" | "rejected";
  treasuryTraceNumber: string;
  submissionDate: string;
  depositDate?: string;
  notes?: string;
}

export interface BankUser {
  id: string;
  fullName: string;
  username?: string | undefined;
  email: string;
  phone: string;
  avatarUrl?: string | undefined;
  accountNumber: string;
  savingsAccountNumber?: string | undefined;
  routingNumber: string;
  accountType: "Personal Checking" | "High-Yield Savings" | "Private Wealth Trust" | "Advantage Checking";
  pin: string; // 4-digit security transfer PIN
  loginPassword?: string | undefined;
  balance: number;
  savingsBalance: number;
  status: "active" | "pending_verification" | "suspended" | "dormant";
  applicationStatus?: "pending" | "under_review" | "approved" | "declined" | undefined;
  idType?: string | undefined;
  idNumber?: string | undefined;
  verificationToken?: string | undefined;
  verificationLink?: string | undefined;
  verifiedAt?: string | undefined;
  createdAt: string;
  address: string;
  city: string;
  state?: string | undefined;
  country: string;
  monthlyDepositLimit: number;
  transactions: BankTransaction[];
  beneficiaries: Beneficiary[];
  cards: BankCard[];
  digitalAssets: DigitalAssetHolding[];
  irsRefunds: IrsRefundRecord[];
  btcBalance?: number;
  loginActivity?: { timestamp: string; ip: string; device: string; location: string }[];
}

const STORAGE_KEY = "svt_bank_users_v3";
const SESSION_KEY = "svt_current_session_v3";

const INITIAL_BENEFICIARIES: Beneficiary[] = [
  {
    id: "ben_01",
    name: "JPMorgan Chase Escrow Custody",
    accountNumber: "8841029411",
    bankName: "JPMorgan Chase Bank, N.A.",
    routingNumber: "021000021",
    country: "United States",
    currency: "USD",
    transferType: "domestic",
    createdAt: "2026-10-12",
  },
  {
    id: "ben_02",
    name: "Barclays Wealth Management UK",
    accountNumber: "GB29BARC20000087654321",
    bankName: "Barclays Bank PLC",
    swiftBic: "BARCGB22",
    country: "United Kingdom",
    currency: "GBP",
    transferType: "international",
    createdAt: "2026-10-20",
  },
];

const INITIAL_DEMO_USER: BankUser = {
  id: "usr_svt_234662",
  fullName: "jack ray affery",
  username: "jackaffery2024",
  email: "jackaffery2024@gmail.com",
  phone: "+1 2024692219",
  avatarUrl: "",
  accountNumber: "45643224892",
  savingsAccountNumber: "45643227810",
  routingNumber: "021000021",
  accountType: "Advantage Checking",
  pin: "2026",
  loginPassword: "password123",
  balance: 4564322.00,
  savingsBalance: 0.00,
  status: "active",
  applicationStatus: "approved",
  idType: "Driver's License / State ID",
  idNumber: "89764543556",
  verifiedAt: "2026-11-01T10:00:00Z",
  createdAt: "2026-11-01T09:30:00Z",
  address: "1600 Pennsylvania Ave NW",
  city: "Washington",
  state: "D.C.",
  country: "United States",
  monthlyDepositLimit: 10000000,
  btcBalance: 0.00,
  beneficiaries: INITIAL_BENEFICIARIES,
  cards: [
    {
      id: "crd_01",
      type: "debit",
      cardholderName: "JACK RAY AFFERY",
      cardNumber: "4532 •••• •••• 8841",
      expiryDate: "09/29",
      cvv: "392",
      pin: "2026",
      status: "active",
      dailySpendingLimit: 15000,
      dailyAtmLimit: 5000,
      currentDailySpend: 0,
      billingAddress: "1600 Pennsylvania Ave NW, Washington, D.C.",
      issuedDate: "2026-11-01",
    },
    {
      id: "crd_02",
      type: "credit",
      cardholderName: "JACK RAY AFFERY",
      cardNumber: "5421 •••• •••• 4209",
      expiryDate: "11/30",
      cvv: "812",
      pin: "2026",
      status: "active",
      dailySpendingLimit: 50000,
      dailyAtmLimit: 10000,
      currentDailySpend: 1250,
      billingAddress: "1600 Pennsylvania Ave NW, Washington, D.C.",
      issuedDate: "2026-11-02",
    },
  ],
  digitalAssets: [
    {
      symbol: "BTC",
      name: "Bitcoin Vault Custody",
      balance: 1.4852,
      fiatValueUsd: 138420.50,
      custodyVaultAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      status: "active",
      lastAuditTimestamp: "2026-11-07 08:30:00 UTC",
    },
    {
      symbol: "ETH",
      name: "Ethereum Smart Reserve",
      balance: 12.85,
      fiatValueUsd: 41250.00,
      custodyVaultAddress: "0x71C...B29F4a09",
      status: "active",
      lastAuditTimestamp: "2026-11-07 08:30:00 UTC",
    },
  ],
  irsRefunds: [
    {
      id: "irs_2026_01",
      ssnLast4: "4355",
      taxYear: "2025/2026",
      refundAmount: 8450.00,
      filingStatus: "Single",
      depositStatus: "deposited",
      treasuryTraceNumber: "US-IRS-TREAS-89410294",
      submissionDate: "2026-03-15",
      depositDate: "2026-04-02",
      notes: "Direct Treasury Deposit to Advantage Checking #45643224892",
    },
    {
      id: "irs_2026_02",
      ssnLast4: "4355",
      taxYear: "2026 Mid-Year Adjustment",
      refundAmount: 3200.00,
      filingStatus: "Single",
      depositStatus: "pending_review",
      treasuryTraceNumber: "US-IRS-TREAS-99214482",
      submissionDate: "2026-10-18",
      notes: "IRS 1040-ES Treasury verification in progress by Solo Admin.",
    },
  ],
  loginActivity: [
    { timestamp: "2026-11-07 10:14 AM", ip: "192.168.1.42", device: "Chrome 130 / Windows 11", location: "Washington, D.C." },
    { timestamp: "2026-11-06 08:30 PM", ip: "192.168.1.42", device: "Chrome 130 / Windows 11", location: "Washington, D.C." },
  ],
  transactions: [
    {
      id: "tx_01",
      type: "deposit",
      transferCategory: "domestic",
      description: "Direct Federal Wire Deposit — Escrow Settlement",
      amount: 4564322.00,
      fee: 0,
      totalDeduction: 0,
      currency: "USD",
      senderName: "Federal Reserve Settlement Services",
      senderAccount: "FED-00921448",
      recipientName: "jack ray affery",
      recipientAccount: "45643224892",
      recipientBank: "Stronghold Vault Trust Institution",
      date: "2026-11-05",
      status: "completed",
      reference: "SVT-US-234662",
      auditTrail: [
        { timestamp: "2026-11-05 09:12:00 UTC", action: "Settled via Fedwire", performedBy: "SYSTEM_CORE" },
      ],
    },
  ],
};

export function getBankUsers(): BankUser[] {
  if (typeof window === "undefined") return [INITIAL_DEMO_USER];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([INITIAL_DEMO_USER]));
      return [INITIAL_DEMO_USER];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([INITIAL_DEMO_USER]));
      return [INITIAL_DEMO_USER];
    }
    return parsed;
  } catch {
    return [INITIAL_DEMO_USER];
  }
}

export function saveBankUsers(users: BankUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function findUserByEmail(email: string): BankUser | undefined {
  const users = getBankUsers();
  const clean = email.toLowerCase().trim();
  return users.find((u) => u.email.toLowerCase().trim() === clean || (u.username && u.username.toLowerCase().trim() === clean));
}

export function findUserById(id: string): BankUser | undefined {
  const users = getBankUsers();
  return users.find((u) => u.id === id);
}

export function registerNewUser(data: {
  fullName: string;
  email: string;
  phone: string;
  pin: string;
  accountType: BankUser["accountType"];
  address: string;
  city: string;
  state?: string;
  country: string;
  idType?: string;
  idNumber?: string;
  initialDeposit?: number;
}): { user: BankUser; verificationLink: string } {
  const users = getBankUsers();

  const token = "svt_verify_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const verificationLink = `${origin}/verify-email?token=${token}&email=${encodeURIComponent(data.email)}`;

  const randomAcc = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  const randomSav = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  const initDep = Number(data.initialDeposit) || 0;
  const usernameGuess = data.email.split("@")[0] || "user" + Math.floor(Math.random() * 1000);

  const newUser: BankUser = {
    id: "usr_svt_" + Math.floor(100000 + Math.random() * 900000),
    fullName: data.fullName,
    username: usernameGuess,
    email: data.email,
    phone: data.phone,
    accountNumber: randomAcc,
    savingsAccountNumber: randomSav,
    routingNumber: "021000021",
    accountType: data.accountType,
    pin: data.pin,
    loginPassword: "password123",
    balance: initDep,
    savingsBalance: 0,
    status: "pending_verification",
    applicationStatus: "pending",
    idType: data.idType || "Driver's License / State ID",
    idNumber: data.idNumber || "DL-" + Math.floor(10000000 + Math.random() * 90000000),
    verificationToken: token,
    verificationLink,
    createdAt: new Date().toISOString(),
    address: data.address,
    city: data.city,
    state: data.state || "",
    country: data.country,
    monthlyDepositLimit: 500000,
    beneficiaries: [],
    cards: [],
    digitalAssets: [],
    irsRefunds: [],
    transactions: initDep > 0 ? [
      {
        id: "tx_" + Date.now(),
        type: "deposit",
        transferCategory: "domestic",
        description: "Initial Account Opening Deposit",
        amount: initDep,
        fee: 0,
        totalDeduction: 0,
        currency: "USD",
        senderName: "Institutional Intake",
        senderAccount: "SVT-INTAKE",
        recipientName: data.fullName,
        recipientAccount: randomAcc,
        recipientBank: "Stronghold Vault Trust Institution",
        date: new Date().toISOString().slice(0, 10),
        status: "completed",
        reference: `INIT-${randomAcc.slice(-6)}`,
        auditTrail: [{ timestamp: new Date().toISOString(), action: "Initial Deposit Credited", performedBy: "SYSTEM" }],
      },
    ] : [],
  };

  users.unshift(newUser);
  saveBankUsers(users);
  return { user: newUser, verificationLink };
}

export function updateUserDetails(userId: string, updates: Partial<BankUser>): BankUser | null {
  const users = getBankUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  const existing = users[idx];
  if (!existing) return null;
  const merged: BankUser = Object.assign({}, existing, updates);
  users[idx] = merged;
  saveBankUsers(users);

  const current = getCurrentSession();
  if (current && current.id === userId) {
    setCurrentSession(merged);
  }
  return merged;
}

export function verifyUserEmail(token: string, email: string): BankUser | null {
  const users = getBankUsers();
  const user = users.find(
    (u) =>
      u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
      u.verificationToken &&
      u.verificationToken === token
  );
  if (!user) return null;

  user.status = "active";
  user.applicationStatus = "approved";
  user.verifiedAt = new Date().toISOString();
  // Expire token so it functions strictly as a ONE-TIME verification link
  user.verificationToken = "";
  saveBankUsers(users);
  setCurrentSession(user);
  return user;
}

export function updateUserApplicationStatus(
  userId: string,
  applicationStatus: "pending" | "under_review" | "approved" | "declined",
  status?: BankUser["status"]
): void {
  const users = getBankUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.applicationStatus = applicationStatus;
    if (status) {
      user.status = status;
    } else if (applicationStatus === "approved") {
      user.status = "active";
    } else if (applicationStatus === "declined") {
      user.status = "suspended";
    }
    saveBankUsers(users);
    const curr = getCurrentSession();
    if (curr && curr.id === userId) setCurrentSession(user);
  }
}

export function updateUserStatus(userId: string, status: BankUser["status"]): void {
  const users = getBankUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.status = status;
    saveBankUsers(users);
    const curr = getCurrentSession();
    if (curr && curr.id === userId) setCurrentSession(user);
  }
}

export function updateUserBalance(userId: string, newBalance: number): void {
  const users = getBankUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.balance = newBalance;
    saveBankUsers(users);
    const curr = getCurrentSession();
    if (curr && curr.id === userId) setCurrentSession(user);
  }
}

/**
 * Execute Money Transfer (Internal, Domestic, or International)
 */
export function executeMoneyTransfer(params: {
  userId: string;
  sourceAccount: "checking" | "savings";
  transferCategory: "internal" | "domestic" | "international";
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
  routingNumber?: string;
  swiftBic?: string;
  recipientCountry?: string;
  recipientAddress?: string;
  recipientAccountType?: string;
  amount: number;
  fee: number;
  currency: string;
  exchangeRate?: number;
  description: string;
  saveBeneficiary?: boolean;
}): { success: boolean; transaction?: BankTransaction; error?: string } {
  const users = getBankUsers();
  const user = users.find((u) => u.id === params.userId);
  if (!user) return { success: false, error: "User record not found." };

  const totalDeduction = params.amount + params.fee;
  const currentFunds = params.sourceAccount === "checking" ? user.balance : user.savingsBalance;

  if (currentFunds < totalDeduction) {
    return { success: false, error: "Insufficient available balance including transfer fees." };
  }

  // Deduct from balance
  if (params.sourceAccount === "checking") {
    user.balance -= totalDeduction;
  } else {
    user.savingsBalance -= totalDeduction;
  }

  // Generate unique reference
  const prefix = params.transferCategory === "internal" ? "SVT-INT" : params.transferCategory === "domestic" ? "SVT-ACH" : "SVT-WIRE";
  const ref = `${prefix}-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;

  // Delivery estimate
  const estimatedDelivery =
    params.transferCategory === "internal"
      ? "Instant (Immediate Settlement)"
      : params.transferCategory === "domestic"
      ? "Same-Day Fedwire ACH"
      : "1-2 Business Days via SWIFT GPI";

  const newTx: BankTransaction = {
    id: "tx_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
    type: "wire",
    transferCategory: params.transferCategory,
    description: params.description || `Transfer to ${params.recipientName}`,
    amount: -params.amount,
    fee: params.fee,
    totalDeduction,
    currency: params.currency,
    exchangeRate: params.exchangeRate,
    senderName: user.fullName,
    senderAccount: params.sourceAccount === "checking" ? user.accountNumber : (user.savingsAccountNumber || user.accountNumber),
    recipientName: params.recipientName,
    recipientAccount: params.recipientAccount,
    recipientBank: params.recipientBank,
    routingNumber: params.routingNumber,
    swiftBic: params.swiftBic,
    recipientCountry: params.recipientCountry,
    recipientAddress: params.recipientAddress,
    estimatedDelivery,
    date: new Date().toISOString().slice(0, 10),
    status: "completed",
    reference: ref,
    auditTrail: [
      { timestamp: new Date().toISOString(), action: "Authorized by Client Security PIN", performedBy: user.email },
      { timestamp: new Date().toISOString(), action: "Settled via Core Institutional Gateway", performedBy: "SYSTEM_CORE" },
    ],
  };

  user.transactions.unshift(newTx);

  // If save beneficiary
  if (params.saveBeneficiary) {
    if (!user.beneficiaries) user.beneficiaries = [];
    const exists = user.beneficiaries.some((b) => b.accountNumber === params.recipientAccount);
    if (!exists) {
      user.beneficiaries.push({
        id: "ben_" + Date.now(),
        name: params.recipientName,
        accountNumber: params.recipientAccount,
        bankName: params.recipientBank,
        routingNumber: params.routingNumber,
        swiftBic: params.swiftBic,
        country: params.recipientCountry || "United States",
        currency: params.currency,
        transferType: params.transferCategory,
        createdAt: new Date().toISOString().slice(0, 10),
      });
    }
  }

  saveBankUsers(users);

  const curr = getCurrentSession();
  if (curr && curr.id === user.id) {
    setCurrentSession(user);
  }

  return { success: true, transaction: newTx };
}

/**
 * Append a transaction to a user's ledger and apply it to the checking balance.
 * Unspecified fields are filled with sensible defaults.
 */
export function addTransaction(
  userId: string,
  tx: Partial<BankTransaction> &
    Pick<BankTransaction, "type" | "description" | "amount" | "date" | "status" | "reference">
): BankTransaction | null {
  return addAdminGeneratedTransaction(userId, {
    type: tx.type,
    description: tx.description,
    amount: tx.amount,
    status: tx.status,
    reference: tx.reference,
  });
}

export function addAdminGeneratedTransaction(
  userId: string,
  txData: {
    type: "deposit" | "withdrawal" | "transfer" | "wire" | "fee";
    description: string;
    amount: number;
    transferCategory?: "internal" | "domestic" | "international";
    status?: "completed" | "pending" | "processing" | "failed" | "reversed";
    reference?: string;
  }
): BankTransaction | null {
  const users = getBankUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  const ref = txData.reference || `SVT-GEN-${Math.floor(100000 + Math.random() * 900000)}`;
  const newTx: BankTransaction = {
    id: "tx_gen_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    type: txData.type,
    transferCategory: txData.transferCategory || "domestic",
    description: txData.description,
    amount: txData.amount,
    fee: 0,
    totalDeduction: txData.amount < 0 ? Math.abs(txData.amount) : 0,
    currency: "USD",
    senderName: txData.amount >= 0 ? "Solo Admin Operations" : user.fullName,
    senderAccount: txData.amount >= 0 ? "SVT-CENTRAL-LEDGER" : user.accountNumber,
    recipientName: txData.amount >= 0 ? user.fullName : "Recipient Account",
    recipientAccount: txData.amount >= 0 ? user.accountNumber : "EXTERNAL-ROUTED",
    recipientBank: "Stronghold Vault Trust Institution",
    date: new Date().toISOString(),
    status: txData.status || "completed",
    reference: ref,
    auditTrail: [
      {
        timestamp: new Date().toISOString(),
        action: `Transaction Generated by Solo Admin (${txData.type}: $${txData.amount})`,
        performedBy: "support@svt.online",
      },
    ],
  };

  if (!user.transactions) user.transactions = [];
  user.transactions.unshift(newTx);
  if (newTx.status === "completed") {
    user.balance += newTx.amount;
    if (user.balance < 0) user.balance = 0;
  }

  saveBankUsers(users);
  const curr = getCurrentSession();
  if (curr && curr.id === user.id) setCurrentSession(user);

  return newTx;
}

/**
 * Admin action to update transaction status (approve, decline, reverse)
 */
export function adminUpdateTransactionStatus(
  userId: string,
  txId: string,
  status: BankTransaction["status"],
  adminEmail: string,
  reason?: string
): boolean {
  const users = getBankUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return false;

  const tx = user.transactions.find((t) => t.id === txId);
  if (!tx) return false;

  // Handle reversal refund
  if (status === "reversed" && tx.status !== "reversed") {
    user.balance += Math.abs(tx.totalDeduction || tx.amount);
  }

  tx.status = status;
  if (!tx.auditTrail) tx.auditTrail = [];
  tx.auditTrail.push({
    timestamp: new Date().toISOString(),
    action: `Transaction status changed to ${status.toUpperCase()}${reason ? ` (${reason})` : ""}`,
    performedBy: adminEmail,
  });

  saveBankUsers(users);

  const curr = getCurrentSession();
  if (curr && curr.id === user.id) {
    setCurrentSession(user);
  }
  return true;
}

export function saveUserBeneficiary(userId: string, ben: Omit<Beneficiary, "id" | "createdAt">): Beneficiary | null {
  const users = getBankUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) return null;

  if (!user.beneficiaries) user.beneficiaries = [];
  const newBen: Beneficiary = {
    ...ben,
    id: "ben_" + Date.now(),
    createdAt: new Date().toISOString().slice(0, 10),
  };
  user.beneficiaries.unshift(newBen);
  saveBankUsers(users);

  const curr = getCurrentSession();
  if (curr && curr.id === user.id) setCurrentSession(user);
  return newBen;
}

export function deleteUserBeneficiary(userId: string, benId: string): boolean {
  const users = getBankUsers();
  const user = users.find((u) => u.id === userId);
  if (!user || !user.beneficiaries) return false;

  user.beneficiaries = user.beneficiaries.filter((b) => b.id !== benId);
  saveBankUsers(users);

  const curr = getCurrentSession();
  if (curr && curr.id === user.id) setCurrentSession(user);
  return true;
}

export function updateUserCard(
  userId: string,
  cardId: string,
  updates: Partial<BankCard>
): BankCard | null {
  const users = getBankUsers();
  const user = users.find((u) => u.id === userId);
  if (!user || !user.cards) return null;

  const cardIdx = user.cards.findIndex((c) => c.id === cardId);
  if (cardIdx === -1) return null;

  const existingCard = user.cards[cardIdx];
  if (!existingCard) return null;
  const updatedCard: BankCard = { ...existingCard, ...updates } as BankCard;
  user.cards[cardIdx] = updatedCard;
  saveBankUsers(users);

  const curr = getCurrentSession();
  if (curr && curr.id === user.id) setCurrentSession(user);
  return updatedCard;
}

export function updateUserDigitalAssets(
  userId: string,
  symbol: "BTC" | "ETH",
  updates: Partial<DigitalAssetHolding>
): DigitalAssetHolding | null {
  const users = getBankUsers();
  const user = users.find((u) => u.id === userId);
  if (!user || !user.digitalAssets) return null;

  const assetIdx = user.digitalAssets.findIndex((a) => a.symbol === symbol);
  if (assetIdx === -1) return null;

  const existingAsset = user.digitalAssets[assetIdx];
  if (!existingAsset) return null;
  const updatedAsset: DigitalAssetHolding = { ...existingAsset, ...updates } as DigitalAssetHolding;
  user.digitalAssets[assetIdx] = updatedAsset;
  saveBankUsers(users);

  const curr = getCurrentSession();
  if (curr && curr.id === user.id) setCurrentSession(user);
  return updatedAsset;
}

export function adminUpdateIrsRefundStatus(
  userId: string,
  refundId: string,
  status: IrsRefundRecord["depositStatus"],
  notes?: string
): boolean {
  const users = getBankUsers();
  const user = users.find((u) => u.id === userId);
  if (!user || !user.irsRefunds) return false;

  const refund = user.irsRefunds.find((r) => r.id === refundId);
  if (!refund) return false;

  refund.depositStatus = status;
  if (notes) refund.notes = notes;
  if (status === "deposited" && !refund.depositDate) {
    refund.depositDate = new Date().toISOString().slice(0, 10);
    user.balance += refund.refundAmount; // Credit to checking
    user.transactions.unshift({
      id: "tx_irs_" + Date.now(),
      type: "deposit",
      transferCategory: "domestic",
      description: `IRS Federal Tax Refund Treasury Settlement (${refund.taxYear})`,
      amount: refund.refundAmount,
      fee: 0,
      totalDeduction: 0,
      currency: "USD",
      senderName: "United States Department of the Treasury",
      senderAccount: "TREAS-IRS-DIR-DEP",
      recipientName: user.fullName,
      recipientAccount: user.accountNumber,
      recipientBank: "Stronghold Vault Trust Institution",
      date: new Date().toISOString().slice(0, 10),
      status: "completed",
      reference: refund.treasuryTraceNumber,
    });
  }

  saveBankUsers(users);
  const curr = getCurrentSession();
  if (curr && curr.id === user.id) setCurrentSession(user);
  return true;
}

export function deleteBankUser(userId: string): void {
  const users = getBankUsers().filter((u) => u.id !== userId);
  saveBankUsers(users);
}

// Session Helpers
export function getCurrentSession(): BankUser | null {
  if (typeof window === "undefined") return INITIAL_DEMO_USER;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    if (!raw) return INITIAL_DEMO_USER;
    const parsed = JSON.parse(raw);
    const latest = getBankUsers().find((u) => u.id === parsed.id);
    return latest || parsed;
  } catch {
    return INITIAL_DEMO_USER;
  }
}

export function setCurrentSession(user: BankUser | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}
