export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  routingNumber?: string;
  swiftBic?: string;
  country: string;
  currency: string;
  transferType: "internal" | "domestic" | "international";
  createdAt: string;
}

export interface BankTransaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer" | "wire" | "fee";
  transferCategory?: "internal" | "domestic" | "international";
  description: string;
  amount: number; // negative for deductions
  fee: number;
  totalDeduction: number;
  currency: string;
  exchangeRate?: number;
  senderName: string;
  senderAccount: string;
  recipientName: string;
  recipientAccount: string;
  recipientBank: string;
  routingNumber?: string;
  swiftBic?: string;
  recipientCountry?: string;
  recipientAddress?: string;
  estimatedDelivery?: string;
  date: string;
  status: "pending" | "processing" | "completed" | "failed" | "reversed";
  reference: string;
  auditTrail?: { timestamp: string; action: string; performedBy: string }[];
}

export interface BankUser {
  id: string;
  fullName: string;
  username?: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  accountNumber: string;
  savingsAccountNumber?: string;
  routingNumber: string;
  accountType: "Personal Checking" | "High-Yield Savings" | "Private Wealth Trust" | "Advantage Checking";
  pin: string; // 4-digit security transfer PIN
  loginPassword?: string;
  balance: number;
  savingsBalance: number;
  status: "active" | "pending_verification" | "suspended" | "dormant";
  applicationStatus?: "pending" | "under_review" | "approved" | "declined";
  idType?: string;
  idNumber?: string;
  verificationToken?: string;
  verificationLink?: string;
  verifiedAt?: string;
  createdAt: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  monthlyDepositLimit: number;
  transactions: BankTransaction[];
  beneficiaries: Beneficiary[];
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
  const initDep = Number(data.initialDeposit) || 1000;
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
    status: "active",
    applicationStatus: "approved",
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
    transactions: [
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
    ],
  };

  users.unshift(newUser);
  saveBankUsers(users);
  return { user: newUser, verificationLink };
}

export function updateUserDetails(userId: string, updates: Partial<BankUser>): BankUser | null {
  const users = getBankUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  users[idx] = { ...users[idx], ...updates };
  saveBankUsers(users);

  const current = getCurrentSession();
  if (current && current.id === userId) {
    setCurrentSession(users[idx]);
  }
  return users[idx];
}

export function verifyUserEmail(token: string, email: string): BankUser | null {
  const users = getBankUsers();
  const user = users.find(
    (u) =>
      u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
      u.verificationToken === token
  );
  if (!user) return null;

  user.status = "active";
  user.verifiedAt = new Date().toISOString();
  saveBankUsers(users);
  setCurrentSession(user);
  return user;
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
