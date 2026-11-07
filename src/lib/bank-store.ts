export interface BankTransaction {
  id: string;
  type: "deposit" | "withdrawal" | "transfer" | "wire" | "fee";
  description: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "declined";
  reference: string;
}

export interface BankUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  accountNumber: string;
  routingNumber: string;
  accountType: "Personal Checking" | "High-Yield Savings" | "Private Wealth Trust";
  pin: string; // 4-digit security PIN
  balance: number;
  savingsBalance: number;
  status: "active" | "pending_verification" | "suspended";
  verificationToken?: string;
  verificationLink?: string;
  verifiedAt?: string;
  createdAt: string;
  address: string;
  city: string;
  country: string;
  monthlyDepositLimit: number;
  transactions: BankTransaction[];
}

const STORAGE_KEY = "svt_bank_users_v1";
const SESSION_KEY = "svt_current_session_v1";

// Demo initial user so the user can immediately observe the dashboard!
const INITIAL_DEMO_USER: BankUser = {
  id: "usr_svt_001",
  fullName: "Alexander Sterling",
  email: "alexander.sterling@example.com",
  phone: "+1 (555) 234-8900",
  accountNumber: "9482014892",
  routingNumber: "021000089",
  accountType: "Private Wealth Trust",
  pin: "2026",
  balance: 148500.50,
  savingsBalance: 420000.00,
  status: "active",
  verifiedAt: "2026-10-15T10:00:00Z",
  createdAt: "2026-10-15T09:30:00Z",
  address: "742 Evergreen Terrace, Suite 400",
  city: "New York",
  country: "United States",
  monthlyDepositLimit: 500000,
  transactions: [
    {
      id: "tx_01",
      type: "deposit",
      description: "Direct Deposit — Sterling Capital Global LLC",
      amount: 45000.00,
      date: "2026-11-05",
      status: "completed",
      reference: "DEP-948201",
    },
    {
      id: "tx_02",
      type: "wire",
      description: "Institutional Wire — Geneva Custody Transfer",
      amount: -12500.00,
      date: "2026-11-03",
      status: "completed",
      reference: "WIRE-481920",
    },
    {
      id: "tx_03",
      type: "deposit",
      description: "Quarterly Treasury Yield Distribution",
      amount: 3420.50,
      date: "2026-10-28",
      status: "completed",
      reference: "INT-883912",
    },
    {
      id: "tx_04",
      type: "transfer",
      description: "Internal Reserve Allocation to Vault Savings",
      amount: -25000.00,
      date: "2026-10-20",
      status: "completed",
      reference: "TRF-300184",
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
  return users.find((u) => u.email.toLowerCase().trim() === email.toLowerCase().trim());
}

export function registerNewUser(data: {
  fullName: string;
  email: string;
  phone: string;
  pin: string;
  accountType: BankUser["accountType"];
  address: string;
  city: string;
  country: string;
  initialDeposit?: number;
}): { user: BankUser; verificationLink: string } {
  const users = getBankUsers();

  const token = "svt_verify_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const verificationLink = `${origin}/verify-email?token=${token}&email=${encodeURIComponent(data.email)}`;

  const randomAcc = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  const initDep = Number(data.initialDeposit) || 1000;

  const newUser: BankUser = {
    id: "usr_" + Math.random().toString(36).substring(2, 9),
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    accountNumber: randomAcc,
    routingNumber: "021000089",
    accountType: data.accountType,
    pin: data.pin,
    balance: initDep,
    savingsBalance: 0,
    status: "pending_verification",
    verificationToken: token,
    verificationLink,
    createdAt: new Date().toISOString(),
    address: data.address,
    city: data.city,
    country: data.country,
    monthlyDepositLimit: 100000,
    transactions: [
      {
        id: "tx_" + Date.now(),
        type: "deposit",
        description: "Initial Account Opening Deposit",
        amount: initDep,
        date: new Date().toISOString().slice(0, 10),
        status: "completed",
        reference: `INIT-${randomAcc.slice(-6)}`,
      },
    ],
  };

  users.unshift(newUser);
  saveBankUsers(users);
  return { user: newUser, verificationLink };
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
  }
}

export function updateUserBalance(userId: string, newBalance: number): void {
  const users = getBankUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    user.balance = newBalance;
    saveBankUsers(users);
  }
}

export function addTransaction(userId: string, tx: Omit<BankTransaction, "id">): void {
  const users = getBankUsers();
  const user = users.find((u) => u.id === userId);
  if (user) {
    const fullTx: BankTransaction = {
      ...tx,
      id: "tx_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
    };
    user.transactions.unshift(fullTx);
    user.balance += tx.amount;
    saveBankUsers(users);
  }
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
    if (!raw) return INITIAL_DEMO_USER; // Default to demo user for immediate observation
    const parsed = JSON.parse(raw);
    // Refresh with latest data from storage
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
