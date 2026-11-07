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
  btcBalance?: number;
  loginActivity?: { timestamp: string; ip: string; device: string; location: string }[];
}

const STORAGE_KEY = "svt_bank_users_v2";
const SESSION_KEY = "svt_current_session_v2";

// Matching user's exact profile from uploaded screenshots: Jack ray Affery
const INITIAL_DEMO_USER: BankUser = {
  id: "usr_wsb_234662",
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
  loginActivity: [
    { timestamp: "2026-11-07 10:14 AM", ip: "192.168.1.42", device: "Chrome 130 / Windows 11", location: "Washington, D.C." },
    { timestamp: "2026-11-06 08:30 PM", ip: "192.168.1.42", device: "Chrome 130 / Windows 11", location: "Washington, D.C." },
  ],
  transactions: [
    {
      id: "tx_01",
      type: "deposit",
      description: "Direct Federal Wire Deposit — Escrow Settlement",
      amount: 4564322.00,
      date: "2026-11-05",
      status: "completed",
      reference: "WSB-US-234662",
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

export function updateUserDetails(userId: string, updates: Partial<BankUser>): BankUser | null {
  const users = getBankUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  users[idx] = { ...users[idx], ...updates };
  saveBankUsers(users);

  // If this is the current active session, sync it
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
    const curr = getCurrentSession();
    if (curr && curr.id === userId) setCurrentSession(user);
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
