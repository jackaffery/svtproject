import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  DollarSign,
  Search,
  CheckCircle,
  XCircle,
  Edit3,
  Trash2,
  Mail,
  UserCheck,
  Ban,
  RotateCcw,
  PlusCircle,
  ChevronRight,
  MoreVertical,
  Bell,
  ArrowRight,
  ShieldCheck,
  LogOut,
  CreditCard,
  FileText,
  BadgeAlert,
  Send,
  History,
  Settings,
  Menu,
  X,
  Globe,
  Radio,
  Sliders,
  Check,
} from "lucide-react";
import { meta } from "@/components/site";
import {
  getBankUsers,
  updateUserStatus,
  updateUserApplicationStatus,
  updateUserBalance,
  updateUserDetails,
  deleteBankUser,
  setCurrentSession,
  registerNewUser,
  adminUpdateIrsRefundStatus,
  updateUserCard,
  addAdminGeneratedTransaction,
  getSystemActivities,
  markAllActivitiesRead,
  getWebsiteContentConfig,
  updateWebsiteContentConfig,
  type BankUser,
  type BankCard,
  type BankTransaction,
  type IrsRefundRecord,
  type SystemActivityLog,
  type WebsiteContentConfig,
} from "@/lib/bank-store";

export const Route = createFileRoute("/admin")({
  staticData: { sitemap: "exclude-subtree" },
  head: () =>
    meta(
      "SOLO Master Administration — Stronghold Vault Trust",
      "Comprehensive Institutional Control Panel & User Management System."
    ),
  component: MasterSoloAdminPage,
});

function MasterSoloAdminPage() {
  const [users, setUsers] = useState<BankUser[]>([]);
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"All" | "Pending" | "Under Review" | "Approved" | "Declined">("All");
  const [activeMenuUserId, setActiveMenuUserId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active Spot Section in Admin (matching sidebar items from screenshot)
  const [activeAdminSection, setActiveAdminSection] = useState<
    "users" | "history" | "deposits" | "loans" | "cards" | "irs" | "email" | "administrators" | "settings" | "cms" | "activity"
  >("users");

  // Centralized System Activity Monitoring & Notifications
  const [activities, setActivities] = useState<SystemActivityLog[]>([]);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // Centralized Website Content Management
  const [siteConfig, setSiteConfig] = useState<WebsiteContentConfig>(getWebsiteContentConfig());

  // Selected User for Card Limit Adjustment
  const [selectedUserForCard, setSelectedUserForCard] = useState<BankUser | null>(null);
  const [cardDailyLimit, setCardDailyLimit] = useState("5000");

  // Email composer modal
  const [emailUser, setEmailUser] = useState<BankUser | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  // Generate Transaction Modal
  const [generateTxUser, setGenerateTxUser] = useState<BankUser | null>(null);
  const [genTxType, setGenTxType] = useState<"deposit" | "withdrawal" | "transfer" | "wire" | "fee">("deposit");
  const [genTxCategory, setGenTxCategory] = useState<"internal" | "domestic" | "international">("domestic");
  const [genTxAmount, setGenTxAmount] = useState("5000");
  const [genTxDescription, setGenTxDescription] = useState("Treasury Commercial Deposit");
  const [genTxStatus, setGenTxStatus] = useState<"completed" | "pending" | "processing">("completed");

  // View Receipt Modal
  const [viewingReceiptTx, setViewingReceiptTx] = useState<(BankTransaction & { clientName: string; clientAccount: string }) | null>(null);

  // View Login Activity Modal
  const [loginActivityUser, setLoginActivityUser] = useState<BankUser | null>(null);

  // IRS Sub-tab state
  const [irsSubTab, setIrsSubTab] = useState<"all" | "pending" | "settings">("all");
  const [irsDirectDepositThreshold, setIrsDirectDepositThreshold] = useState("25000");
  const [irsAutoDirectCredit, setIrsAutoDirectCredit] = useState(true);

  // Display-only controls; no operational policy or email service is configured here.
  const [wireApprovalThreshold, setWireApprovalThreshold] = useState("");
  const [twoFactorEnforcement, setTwoFactorEnforcement] = useState(true);
  const smtpStatus = "Not configured";

  // Sign out confirmation modal / option
  const [showSignOutPrompt, setShowSignOutPrompt] = useState(false);

  // Modal states
  const [editingUser, setEditingUser] = useState<BankUser | null>(null);
  const [editBalanceInput, setEditBalanceInput] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPin, setEditPin] = useState("");

  // Create User Modal
  const [createUserModal, setCreateUserModal] = useState(false);
  const [showIrsModal, setShowIrsModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPin, setNewPin] = useState("2026");
  const [newDeposit, setNewDeposit] = useState("5000");

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    setUsers([...getBankUsers()]);
    setActivities([...getSystemActivities()]);
    setSiteConfig(getWebsiteContentConfig());
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleActionClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setActiveMenuUserId(activeMenuUserId === userId ? null : userId);
  };

  // Close popup menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuUserId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Application Approval / Rejection Handlers
  const handleApproveApplication = (u: BankUser) => {
    updateUserApplicationStatus(u.id, "approved", "active");
    loadData();
    showToast(`Application APPROVED: Account ${u.accountNumber} activated for ${u.fullName}`);
  };

  const handleDeclineApplication = (u: BankUser) => {
    if (confirm(`Decline / Reject application for ${u.fullName}?`)) {
      updateUserApplicationStatus(u.id, "declined", "suspended");
      loadData();
      showToast(`Application DECLINED: ${u.fullName} rejected.`);
    }
  };

  // Generate Transaction submit
  const handleExecuteGenerateTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateTxUser) return;
    const numAmt = parseFloat(genTxAmount) || 0;
    const finalAmt = genTxType === "withdrawal" || genTxType === "fee" ? -Math.abs(numAmt) : Math.abs(numAmt);

    const createdTx = addAdminGeneratedTransaction(generateTxUser.id, {
      type: genTxType,
      transferCategory: genTxCategory,
      description: genTxDescription,
      amount: finalAmt,
      status: genTxStatus,
    });

    if (createdTx) {
      loadData();
      showToast(`Transaction ${createdTx.reference} generated successfully for ${generateTxUser.fullName}!`);
      setGenerateTxUser(null);
    }
  };

  // Admin Actions
  const handleToggleDormant = (u: BankUser) => {
    const nextStatus = u.status === "dormant" ? "active" : "dormant";
    updateUserStatus(u.id, nextStatus);
    loadData();
    showToast(`Account status updated to ${nextStatus.toUpperCase()} for ${u.fullName}`);
  };

  const handleClearAccount = (u: BankUser) => {
    if (confirm(`Clear all funds (Checking & Savings) for ${u.fullName}?`)) {
      updateUserBalance(u.id, 0);
      updateUserDetails(u.id, { savingsBalance: 0 });
      loadData();
      showToast(`Account balance cleared to $0.00 for ${u.fullName}`);
    }
  };

  const handleClearBtcAccount = (u: BankUser) => {
    updateUserDetails(u.id, { btcBalance: 0 });
    loadData();
    showToast(`BTC Balance cleared for ${u.fullName}`);
  };

  const handleBlockUser = (u: BankUser) => {
    const next = u.status === "suspended" ? "active" : "suspended";
    updateUserStatus(u.id, next);
    loadData();
    showToast(`Account ${next === "suspended" ? "BLOCKED" : "UNBLOCKED"} for ${u.fullName}`);
  };

  const handleDeleteUser = (u: BankUser) => {
    if (confirm(`Permanently delete client ${u.fullName}?`)) {
      deleteBankUser(u.id);
      loadData();
      showToast(`Deleted ${u.fullName} from institution records`);
    }
  };

  const handleLoginAsUser = (u: BankUser) => {
    setCurrentSession(u);
    window.location.href = "/dashboard";
  };

  const openEditModal = (u: BankUser) => {
    setEditingUser(u);
    setEditBalanceInput(u.balance.toString());
    setEditFullName(u.fullName);
    setEditEmail(u.email);
    setEditPhone(u.phone);
    setEditAddress(u.address);
    setEditPin(u.pin);
  };

  const handleSaveEditModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const numBal = parseFloat(editBalanceInput) || 0;
    updateUserDetails(editingUser.id, {
      fullName: editFullName,
      email: editEmail,
      phone: editPhone,
      address: editAddress,
      pin: editPin,
      balance: numBal,
    });
    setEditingUser(null);
    loadData();
    showToast(`Updated profile for ${editFullName}`);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const { user } = registerNewUser({
      fullName: newName,
      email: newEmail,
      phone: newPhone,
      pin: newPin,
      accountType: "Advantage Checking",
      address: "100 Financial Way",
      city: "New York",
      country: "United States",
      initialDeposit: parseFloat(newDeposit) || 1000,
    });
    setCreateUserModal(false);
    setNewName("");
    setNewEmail("");
    setNewPhone("");
    loadData();
    showToast(`New client ${user.fullName} enrolled successfully.`);
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.accountNumber.includes(search);

    if (!matchesSearch) return false;
    if (filterTab === "All") return true;
    if (filterTab === "Approved" && (u.applicationStatus === "approved" || u.status === "active")) return true;
    if (filterTab === "Pending" && u.status === "pending_verification") return true;
    if (filterTab === "Declined" && (u.applicationStatus === "declined" || u.status === "suspended")) return true;
    return true;
  });

  const totalApplications = users.length;
  const approvedCount = users.filter((u) => u.status === "active" || u.applicationStatus === "approved").length;
  const pendingCount = users.filter((u) => u.status === "pending_verification").length;
  const declinedCount = users.filter((u) => u.status === "suspended" || u.applicationStatus === "declined").length;
  const totalInstitutionDeposits = users.reduce((acc, u) => acc + (u.balance || 0) + (u.savingsBalance || 0), 0);

  // All transactions flattened for Transaction History spot
  const allTransactions = users.flatMap((u) =>
    (u.transactions || []).map((t) => ({ ...t, clientName: u.fullName, clientAccount: u.accountNumber }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 rounded-xl bg-[#0a1b33] px-5 py-3 text-sm font-bold text-white shadow-2xl border border-gold/40">
          {toastMsg}
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Left Sidebar matching screenshot exactly with mobile responsive drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 border-r border-gray-200 bg-white transition-transform duration-200 md:static md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Administrator Tag Bar */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#0a1b33] text-gold font-bold">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-gray-900">Master Solo Administrator</h2>
              <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                Admin
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-lg p-1 text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-3 space-y-1 text-xs font-semibold text-gray-700 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {/* Manage Users */}
          <button
            onClick={() => {
              setActiveAdminSection("users");
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 font-bold transition-colors ${
              activeAdminSection === "users" ? "text-[#0a1b33] bg-gray-100" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-red-600" />
              <span>Manage Users</span>
            </div>
            <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform ${activeAdminSection === "users" ? "rotate-90" : ""}`} />
          </button>

          {/* Wire & Transfer Operations */}
          <Link
            to="/transfer"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center justify-between rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
          >
            <div className="flex items-center gap-3">
              <Send className="h-4 w-4 text-gold" />
              <span>Wire & Transfer Operations</span>
            </div>
            <ChevronRight className="h-3 w-3 text-gray-400" />
          </Link>

          {/* Transaction History (New Spot from screenshot) */}
          <button
            onClick={() => {
              setActiveAdminSection("history");
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors font-bold ${
              activeAdminSection === "history" ? "text-[#0a1b33] bg-gray-100" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <History className="h-4 w-4 text-indigo-600" />
              <span>Transaction History</span>
            </div>
            <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform ${activeAdminSection === "history" ? "rotate-90" : ""}`} />
          </button>

          {/* Users Deposits */}
          <button
            onClick={() => {
              setActiveAdminSection("deposits");
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors font-bold ${
              activeAdminSection === "deposits" ? "text-[#0a1b33] bg-gray-100" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span>Users Deposits</span>
            </div>
            <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform ${activeAdminSection === "deposits" ? "rotate-90" : ""}`} />
          </button>

          {/* Loan Applications */}
          <button
            onClick={() => {
              setActiveAdminSection("loans");
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors font-bold ${
              activeAdminSection === "loans" ? "text-[#0a1b33] bg-gray-100" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>Loan Applications</span>
            </div>
            <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform ${activeAdminSection === "loans" ? "rotate-90" : ""}`} />
          </button>

          {/* Virtual Cards */}
          <button
            onClick={() => {
              setActiveAdminSection("cards");
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors font-bold ${
              activeAdminSection === "cards" ? "text-[#0a1b33] bg-gray-100" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-purple-600" />
              <span>Virtual Cards</span>
            </div>
            <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform ${activeAdminSection === "cards" ? "rotate-90" : ""}`} />
          </button>

          {/* IRS Refunds Spot */}
          <button
            onClick={() => {
              setActiveAdminSection("irs");
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors font-bold ${
              activeAdminSection === "irs" ? "text-[#0a1b33] bg-gray-100" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-emerald-600" />
              <span>IRS Refunds</span>
            </div>
            <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform ${activeAdminSection === "irs" ? "rotate-90" : ""}`} />
          </button>

          {/* Email Services */}
          <button
            onClick={() => {
              setActiveAdminSection("email");
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors font-bold ${
              activeAdminSection === "email" ? "text-[#0a1b33] bg-gray-100" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-amber-600" />
              <span>Email Services</span>
            </div>
            <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform ${activeAdminSection === "email" ? "rotate-90" : ""}`} />
          </button>

          {/* Administrator(s) (New Spot from screenshot) */}
          <button
            onClick={() => {
              setActiveAdminSection("administrators");
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors font-bold ${
              activeAdminSection === "administrators" ? "text-[#0a1b33] bg-gray-100" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-[#0a1b33]" />
              <span>Administrator(s)</span>
            </div>
            <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform ${activeAdminSection === "administrators" ? "rotate-90" : ""}`} />
          </button>

          {/* Real-Time Activity Monitoring */}
          <button
            onClick={() => {
              setActiveAdminSection("activity");
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors font-bold ${
              activeAdminSection === "activity" ? "text-[#0a1b33] bg-gray-100" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
              <span>Real-Time Activity</span>
            </div>
            <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform ${activeAdminSection === "activity" ? "rotate-90" : ""}`} />
          </button>

          {/* Website Content Management (CMS) */}
          <button
            onClick={() => {
              setActiveAdminSection("cms");
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors font-bold ${
              activeAdminSection === "cms" ? "text-[#0a1b33] bg-gray-100" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-blue-600" />
              <span>Website Content</span>
            </div>
            <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform ${activeAdminSection === "cms" ? "rotate-90" : ""}`} />
          </button>

          {/* Settings (New Spot from screenshot) */}
          <button
            onClick={() => {
              setActiveAdminSection("settings");
              setIsMobileMenuOpen(false);
            }}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors font-bold ${
              activeAdminSection === "settings" ? "text-[#0a1b33] bg-gray-100" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4 text-gray-600" />
              <span>Settings</span>
            </div>
            <ChevronRight className={`h-3 w-3 text-gray-400 transition-transform ${activeAdminSection === "settings" ? "rotate-90" : ""}`} />
          </button>

          {/* Create New User */}
          <button
            onClick={() => {
              setCreateUserModal(true);
              setIsMobileMenuOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100 text-primary font-bold pt-3"
          >
            <PlusCircle className="h-4 w-4 text-emerald-600" />
            <span>Create New User</span>
          </button>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={() => {
                setShowSignOutPrompt(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 hover:bg-red-50 text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Administrative Workplace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
              aria-label="Toggle navigation"
            >
              <Menu className="h-6 w-6" />
            </button>
            <button
              onClick={() => setActiveAdminSection("users")}
              className="flex items-center gap-2 md:gap-3 text-left focus:outline-none"
            >
              <div className="grid h-9 w-9 md:h-10 md:w-10 place-items-center rounded-xl bg-primary text-gold shadow-xs hover:opacity-90">
                <Building2 className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0">
                <span className="truncate font-display text-sm md:text-lg font-bold text-[#0a1b33] hover:underline block leading-tight">
                  Stronghold Vault Trust Institution
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-gold uppercase tracking-wider block">
                  Admin Dashboard Access
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setActiveAdminSection("users")}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors"
            >
              <Building2 className="h-3.5 w-3.5 text-gold" />
              <span>Admin Dashboard</span>
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search user, ID, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 md:w-72 rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-3 text-xs focus:border-[#0a1b33] focus:outline-none"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
                className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Admin Notifications"
              >
                <Bell className="h-5 w-5" />
                {activities.filter((a) => !a.read).length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
                    {activities.filter((a) => !a.read).length}
                  </span>
                )}
              </button>

              {/* Notification Center Popup */}
              {showNotificationDrawer && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl space-y-3"
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-emerald-600 animate-pulse" />
                      <span className="font-bold text-sm text-[#0a1b33]">Live Admin Notification Center</span>
                    </div>
                    <button
                      onClick={() => {
                        markAllActivitiesRead();
                        loadData();
                        showToast("All activities marked as reviewed.");
                      }}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {activities.length === 0 ? (
                      <p className="py-6 text-center text-xs text-gray-400">No recent alerts or activity.</p>
                    ) : (
                      activities.slice(0, 10).map((act) => (
                        <div
                          key={act.id}
                          className={`rounded-lg border p-2.5 text-xs transition-colors ${
                            act.read ? "border-gray-100 bg-gray-50/50" : "border-amber-200 bg-amber-50/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#0a1b33]">{act.title}</span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {new Date(act.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] text-gray-600">{act.description}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="border-t pt-2 text-center">
                    <button
                      onClick={() => {
                        setActiveAdminSection("activity");
                        setShowNotificationDrawer(false);
                      }}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Open Full Real-Time Audit Log →
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#0a1b33] text-xs font-bold text-white">
              A
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* ============================================================== */}
          {/* SECTION 1: MANAGE USERS SPOT (DEFAULT) */}
          {/* ============================================================== */}
          {activeAdminSection === "users" && (
            <div>
              {/* Section Title */}
              <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-2xl font-bold text-[#0a1b33]">New User Application(s)</h1>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-extrabold text-amber-800">
                  {pendingCount} Pending Review
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Review onboarding submissions from the public bank portal, inspect verification documents, and approve or decline accounts with recorded regulatory justification.
              </p>
            </div>

            <button
              onClick={loadData}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <RotateCcw className="h-3.5 w-3.5 text-red-600" />
              <span>Refresh Queue</span>
            </button>
          </div>

          {/* Metric KPI Cards from screenshot */}
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Total Applications
              </span>
              <p className="mt-2 text-3xl font-extrabold text-[#0a1b33]">{totalApplications}</p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Pending Review
              </span>
              <p className="mt-2 text-3xl font-extrabold text-amber-700">{pendingCount}</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Approved
              </span>
              <p className="mt-2 text-3xl font-extrabold text-emerald-700">{approvedCount}</p>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-800">
                Declined / Rejected
              </span>
              <p className="mt-2 text-3xl font-extrabold text-red-700">{declinedCount}</p>
            </div>
          </div>

          {/* Applications Table Card */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-xs">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 px-6 py-4 text-xs font-bold">
              {(["All", "Pending", "Under Review", "Approved", "Declined"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`rounded-md px-3 py-1.5 transition-colors ${
                    filterTab === tab
                      ? "bg-[#0a1b33] text-white"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-visible">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 uppercase tracking-wider text-gray-500 font-bold">
                    <th className="py-3 px-6">Ref ID & Date</th>
                    <th className="py-3 px-4">Applicant Details</th>
                    <th className="py-3 px-4">Country & Account</th>
                    <th className="py-3 px-4">ID Verification</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Balance Held</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-[#0a1b33]">SVT-US-{u.accountNumber.slice(-6)}</p>
                        <p className="text-[11px] text-gray-400">Today, Just now</p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-base text-gray-900 capitalize">{u.fullName}</p>
                        <p className="text-gray-500">{u.email}</p>
                        <p className="text-[11px] text-gray-400">{u.phone}</p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-bold text-gray-800">{u.country}</p>
                        <p className="text-gray-500">{u.accountType} (USD)</p>
                        <p className="text-[11px] text-gray-400">{u.city}</p>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-semibold text-gray-700">{u.idType || "Driver's License / State ID"}</p>
                        <p className="font-mono text-gray-400">{u.idNumber || "89764543556"}</p>
                      </td>

                      <td className="py-4 px-4">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            <CheckCircle className="h-3 w-3" /> Approved
                          </span>
                        ) : u.status === "dormant" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                            Dormant
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
                            <XCircle className="h-3 w-3" /> Suspended
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-bold text-[#0a1b33]">
                        ${u.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-6 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                          {u.status === "pending_verification" || u.applicationStatus === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApproveApplication(u)}
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDeclineApplication(u)}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 shadow-xs"
                              >
                                Reject
                              </button>
                            </>
                          ) : null}

                          <button
                            onClick={(e) => handleActionClick(e, u.id)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50"
                          >
                            Review
                          </button>

                          <button
                            onClick={(e) => handleActionClick(e, u.id)}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-100"
                          >
                            Review Status →
                          </button>
                        </div>

                        {/* Dropdown Menu matching screenshot exactly */}
                        {activeMenuUserId === u.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-6 top-12 z-50 w-64 rounded-xl border border-gray-200 bg-white p-2 text-left shadow-2xl space-y-1"
                          >
                            <button
                              onClick={() => {
                                handleToggleDormant(u);
                                setActiveMenuUserId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                            >
                              <RotateCcw className="h-4 w-4 text-blue-600" />
                              <span>{u.status === "dormant" ? "Turn Off Dormant" : "Turn On Dormant Account"}</span>
                            </button>

                            <button
                              onClick={() => {
                                handleClearAccount(u);
                                setActiveMenuUserId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              <RotateCcw className="h-4 w-4 text-red-600" />
                              <span>Clear Account</span>
                            </button>

                            <button
                              onClick={() => {
                                handleClearBtcAccount(u);
                                setActiveMenuUserId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50"
                            >
                              <DollarSign className="h-4 w-4 text-amber-600" />
                              <span>Clear BTC Account</span>
                            </button>

                            <button
                              onClick={() => {
                                openEditModal(u);
                                setActiveMenuUserId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                            >
                              <Edit3 className="h-4 w-4 text-blue-600" />
                              <span>Edit Profile</span>
                            </button>

                            <button
                              onClick={() => {
                                setEmailUser(u);
                                setEmailSubject("Important Institutional Account Notice");
                                setEmailBody(`Hello ${u.fullName},\n\nWe are writing to provide an institutional update on your Stronghold Vault Trust account.\n\nBest regards,\nMaster Administration`);
                                setActiveMenuUserId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                            >
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span>Send Email</span>
                            </button>

                            <div className="border-t border-gray-100 my-1" />

                            <button
                              onClick={() => {
                                handleLoginAsUser(u);
                                setActiveMenuUserId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                            >
                              <UserCheck className="h-4 w-4 text-emerald-600" />
                              <span>Login as {u.username || u.fullName.split(" ")[0]}</span>
                            </button>

                            <button
                              onClick={() => {
                                setLoginActivityUser(u);
                                setActiveMenuUserId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                            >
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span>Login Activity</span>
                            </button>

                            <button
                              onClick={() => {
                                setGenerateTxUser(u);
                                setGenTxDescription(`Administrative Credit Adjustment for ${u.fullName}`);
                                setActiveMenuUserId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
                            >
                              <PlusCircle className="h-4 w-4 text-indigo-600" />
                              <span>Generate Transaction</span>
                            </button>

                            <button
                              onClick={() => {
                                handleBlockUser(u);
                                setActiveMenuUserId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50"
                            >
                              <Ban className="h-4 w-4 text-amber-600" />
                              <span>{u.status === "suspended" ? "Unblock Account" : "Block Account"}</span>
                            </button>

                            <button
                              onClick={() => {
                                handleDeleteUser(u);
                                setActiveMenuUserId(null);
                              }}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                              <span>Delete {u.username || u.fullName.split(" ")[0]}</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 2: TRANSACTION HISTORY SPOT */}
        {/* ============================================================== */}
        {activeAdminSection === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#0a1b33]">Institutional Transaction History</h1>
                <p className="mt-1 text-xs text-gray-500">
                  Audit ledger of all domestic wires, internal transfers, crypto conversions, and deposits across all bank accounts.
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 font-mono text-xs font-bold text-indigo-700">
                {allTransactions.length} Total Records
              </span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
              {allTransactions.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-xs">
                  No transactions recorded in institution ledger yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      <tr>
                        <th className="p-3">Reference & Date</th>
                        <th className="p-3">Client</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Amount</th>
                        <th className="p-3 text-right">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono">
                      {allTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50/60">
                          <td className="p-3">
                            <p className="font-bold text-gray-800">{tx.reference}</p>
                            <p className="text-[10px] text-gray-400 font-sans">{new Date(tx.date).toLocaleString()}</p>
                          </td>
                          <td className="p-3 font-sans">
                            <p className="font-bold text-[#0a1b33]">{tx.clientName}</p>
                            <p className="text-[11px] text-gray-400 font-mono">{tx.clientAccount}</p>
                          </td>
                          <td className="p-3 font-sans max-w-xs truncate text-gray-700">{tx.description}</td>
                          <td className="p-3 font-sans">
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-700">
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-3 font-sans">
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                                tx.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : tx.status === "pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td
                            className={`p-3 text-right font-bold text-sm ${
                              tx.amount >= 0 ? "text-emerald-600" : "text-gray-900"
                            }`}
                          >
                            {tx.amount >= 0 ? "+" : ""}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right font-sans">
                            <button
                              onClick={() => setViewingReceiptTx(tx)}
                              className="rounded-lg border border-gold/40 bg-gold/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-gold/20 shadow-xs"
                            >
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 3: USERS DEPOSITS SPOT */}
        {/* ============================================================== */}
        {activeAdminSection === "deposits" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#0a1b33]">Users Deposits & Liquidity Control</h1>
                <p className="mt-1 text-xs text-gray-500">
                  Direct administration of checking, savings, and reserve liquidity for all accounts.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 font-mono">
                <span className="text-[10px] font-bold uppercase text-emerald-700 block">Total Liquidity</span>
                <span className="text-lg font-extrabold text-emerald-800">
                  ${totalInstitutionDeposits.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              {users.map((u) => (
                <div key={u.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-base text-[#0a1b33] capitalize">{u.fullName}</span>
                      <span className="font-mono text-xs rounded bg-gray-100 px-2 py-0.5 text-gray-600">
                        Acct #{u.accountNumber}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        {u.accountType}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{u.email} • {u.phone}</p>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Advantage Checking</span>
                      <span className="font-mono text-base font-bold text-[#0a1b33]">
                        ${u.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">High-Yield Savings</span>
                      <span className="font-mono text-base font-bold text-emerald-600">
                        ${u.savingsBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <button
                      onClick={() => openEditModal(u)}
                      className="rounded-lg bg-[#0a1b33] px-4 py-2 text-xs font-bold text-white hover:bg-[#122b52] shadow-xs"
                    >
                      Adjust Balance
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 4: LOAN APPLICATIONS SPOT */}
        {/* ============================================================== */}
        {activeAdminSection === "loans" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#0a1b33]">Commercial & Personal Loan Applications</h1>
              <p className="mt-1 text-xs text-gray-500">
                Manage institutional credit facilities, commercial real estate financing, and line of credit underwriting.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs text-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-bold text-[#0a1b33] text-sm">Underwriting Queue</h3>
                  <p className="text-gray-500">Current loan requests submitted through online portals.</p>
                </div>
                <span className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 font-bold">0 Pending Filings</span>
              </div>

              <div className="py-8 text-center text-gray-400">
                <Building2 className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p className="font-semibold text-gray-600">All institutional loan requests are fully adjudicated.</p>
                <p className="text-[11px] text-gray-400 mt-1">To issue a private loan credit, adjust the client's balance directly under Users Deposits.</p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 5: VIRTUAL CARDS SPOT */}
        {/* ============================================================== */}
        {activeAdminSection === "cards" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#0a1b33]">Virtual & Physical Cards Management</h1>
                <p className="mt-1 text-xs text-gray-500">
                  Inspect provisioned Visa/Mastercard debit and credit cards, adjust daily spending limits, freeze, or issue new cards.
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {users.map((u) => (
                <div key={u.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-[#0a1b33] capitalize">{u.fullName}</h3>
                      <p className="text-xs text-gray-400">Cardholder Profile • {u.email}</p>
                    </div>
                    <span className="rounded-full bg-purple-100 text-purple-800 px-2.5 py-0.5 text-xs font-bold">
                      {(u.cards || []).length} Provisioned
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(u.cards || []).map((card) => (
                      <div key={card.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs uppercase tracking-wide text-gray-700">
                            {card.type} Card
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                              card.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {card.status}
                          </span>
                        </div>

                        <p className="font-mono text-base font-extrabold text-[#0a1b33] tracking-widest">{card.cardNumber}</p>
                        <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                          <span>EXP: {card.expiryDate}</span>
                          <span>CVV: {card.cvv}</span>
                          <span>PIN: {card.pin}</span>
                        </div>

                        <div className="border-t pt-2 flex items-center justify-between text-xs">
                          <span className="text-gray-500 font-medium">Daily Limit:</span>
                          <span className="font-bold font-mono text-[#0a1b33]">${card.dailySpendingLimit.toLocaleString()}</span>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => {
                              const next = card.status === "active" ? "frozen" : "active";
                              updateUserCard(u.id, card.id, { status: next });
                              loadData();
                              showToast(`Card ${card.cardNumber} status set to ${next.toUpperCase()}`);
                            }}
                            className="flex-1 rounded border border-gray-300 bg-white py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50"
                          >
                            {card.status === "active" ? "Freeze Card" : "Unfreeze Card"}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUserForCard(u);
                              setCardDailyLimit(card.dailySpendingLimit.toString());
                            }}
                            className="rounded bg-[#0a1b33] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#122b52]"
                          >
                            Set Limit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 6: IRS REFUNDS SPOT */}
        {/* ============================================================== */}
        {activeAdminSection === "irs" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold text-[#0a1b33]">IRS Federal Tax Refund Treasury Spot</h1>
                <p className="mt-1 text-xs text-gray-500">
                  Verify Treasury trace numbers, approve direct deposits, and audit federal returns directly to customer accounts.
                </p>
              </div>
              <button
                onClick={() => setShowIrsModal(true)}
                className="rounded-lg bg-[#0a1b33] px-4 py-2 font-bold text-xs text-white hover:bg-[#122b52]"
              >
                Open Full Treasury Desk
              </button>
            </div>

            {/* IRS Sub-Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
              <button
                onClick={() => setIrsSubTab("all")}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                  irsSubTab === "all"
                    ? "bg-[#0a1b33] text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                All Refunds ({users.reduce((acc, u) => acc + (u.irsRefunds?.length || 0), 0)})
              </button>
              <button
                onClick={() => setIrsSubTab("pending")}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                  irsSubTab === "pending"
                    ? "bg-[#0a1b33] text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Pending Refunds ({users.reduce((acc, u) => acc + (u.irsRefunds?.filter(r => r.depositStatus !== "deposited").length || 0), 0)})
              </button>
              <button
                onClick={() => setIrsSubTab("settings")}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
                  irsSubTab === "settings"
                    ? "bg-[#0a1b33] text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Refund Settings
              </button>
            </div>

            {/* Sub-tab 1 & 2: All Refunds / Pending Refunds */}
            {(irsSubTab === "all" || irsSubTab === "pending") && (
              <div className="space-y-4">
                {users.map((u) => {
                  const filteredRefunds = (u.irsRefunds || []).filter((r) =>
                    irsSubTab === "pending" ? r.depositStatus !== "deposited" : true
                  );
                  if (irsSubTab === "pending" && filteredRefunds.length === 0) return null;

                  return (
                    <div key={u.id} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
                      <div className="flex items-center justify-between border-b pb-3">
                        <div>
                          <span className="font-bold text-base text-[#0a1b33] capitalize">{u.fullName}</span>
                          <span className="ml-3 font-mono text-xs text-gray-500">Acct #{u.accountNumber}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700">Checking: ${u.balance.toLocaleString()}</span>
                      </div>

                      <div className="mt-4 space-y-3">
                        {filteredRefunds.map((refund) => (
                          <div key={refund.id} className="flex items-center justify-between rounded-xl border p-4 bg-gray-50/50">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#0a1b33]">{refund.taxYear}</span>
                                <span
                                  className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                    refund.depositStatus === "deposited"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {refund.depositStatus}
                                </span>
                              </div>
                              <p className="font-mono text-xs text-gray-500 mt-1">Trace #{refund.treasuryTraceNumber}</p>
                              {refund.notes && <p className="text-xs text-gray-600 mt-1">{refund.notes}</p>}
                            </div>

                            <div className="flex items-center gap-4">
                              <span className="font-mono text-base font-bold text-emerald-600">
                                +${refund.refundAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </span>
                              {refund.depositStatus !== "deposited" && (
                                <button
                                  onClick={() => {
                                    adminUpdateIrsRefundStatus(
                                      u.id,
                                      refund.id,
                                      "deposited",
                                      "Treasury electronic deposit confirmed by Solo Admin."
                                    );
                                    loadData();
                                    showToast(`Credited IRS refund of $${refund.refundAmount.toLocaleString()} to ${u.fullName}`);
                                  }}
                                  className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700 text-xs shadow-xs"
                                >
                                  Approve & Deposit
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {filteredRefunds.length === 0 && (
                          <p className="text-xs text-gray-400">No refunds in this category.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sub-tab 3: Refund Settings */}
            {irsSubTab === "settings" && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-6 text-xs text-gray-700">
                <div className="border-b pb-4">
                  <h3 className="font-bold text-sm text-[#0a1b33] mb-1">IRS Direct Deposit Clearance Limit</h3>
                  <p className="text-gray-500 mb-3">Treasury ACH tax refunds exceeding this amount require manual admin sign-off.</p>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-600">$</span>
                    <input
                      type="number"
                      value={irsDirectDepositThreshold}
                      onChange={(e) => setIrsDirectDepositThreshold(e.target.value)}
                      className="rounded-lg border border-gray-300 p-2 font-mono font-bold text-sm text-[#0a1b33] w-48"
                    />
                    <button
                      onClick={() => showToast(`IRS clearance threshold saved at $${Number(irsDirectDepositThreshold).toLocaleString()}`)}
                      className="rounded-lg bg-[#0a1b33] px-4 py-2 font-bold text-white hover:bg-[#122b52]"
                    >
                      Save Limit
                    </button>
                  </div>
                </div>

                <div className="border-b pb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#0a1b33] mb-1">Automated Treasury Electronic Credit</h3>
                    <p className="text-gray-500">Automatically post verified IRS deposits below the threshold to Advantage Checking.</p>
                  </div>
                  <button
                    onClick={() => {
                      setIrsAutoDirectCredit(!irsAutoDirectCredit);
                      showToast(`Automatic IRS direct credit: ${!irsAutoDirectCredit ? "ENABLED" : "DISABLED"}`);
                    }}
                    className={`rounded-full px-4 py-1.5 font-bold ${
                      irsAutoDirectCredit ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {irsAutoDirectCredit ? "Auto-Deposit Enabled" : "Manual Queue Enforced"}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#0a1b33] mb-1">Internal Revenue Service Direct Link</h3>
                    <p className="text-gray-500">Treasury Financial Management Services (FMS) Batch Automated Feed.</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
                    IRS Treasury Gateway Synchronized (Active)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 7: EMAIL SERVICES SPOT */}
        {/* ============================================================== */}
        {activeAdminSection === "email" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#0a1b33]">Automated Institutional Email Gateway</h1>
              <p className="mt-1 text-xs text-gray-500">
                SMTP 256-bit automated email notifications, statement dispatch, and client correspondence.
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-xs text-xs">
              <h3 className="font-bold text-[#0a1b33] mb-4 text-sm">Quick Client Email Dispatch</h3>
              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl border p-3 bg-gray-50">
                    <div>
                      <p className="font-bold text-[#0a1b33] capitalize">{u.fullName}</p>
                      <p className="text-gray-500">{u.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEmailUser(u);
                        setEmailSubject("Institutional Statement Notification");
                        setEmailBody(`Hello ${u.fullName},\n\nYour monthly Stronghold Vault Trust statement is ready for review in your customer portal.\n\nBest regards,\nStronghold Administration`);
                      }}
                      className="rounded-lg bg-[#0a1b33] px-3.5 py-1.5 font-bold text-white hover:bg-[#122b52]"
                    >
                      Compose Message
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 8: ADMINISTRATOR(S) SPOT */}
        {/* ============================================================== */}
        {activeAdminSection === "administrators" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#0a1b33]">Administrator(s) Management</h1>
              <p className="mt-1 text-xs text-gray-500">
                Manage master administrative accounts, solo portal credentials, security keys, and privileged session tokens.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-[#0a1b33] text-gold font-bold text-lg">
                    A
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#0a1b33]">Master Solo Administrator</h3>
                    <p className="text-xs text-gray-500">Primary System Controller</p>
                  </div>
                  <span className="ml-auto rounded bg-red-100 text-red-800 font-extrabold text-[10px] px-2 py-0.5 uppercase">
                    Active
                  </span>
                </div>

                <div className="border-t pt-3 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-sans">Authorized Username:</span>
                    <span className="font-bold text-[#0a1b33]">Admin123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-sans">Backup Direct ID:</span>
                    <span className="font-bold text-[#0a1b33]">support@svt.online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-sans">Security Credential:</span>
                    <span className="font-bold text-emerald-700">SHA-256 Provisioned</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-sans">Role Level:</span>
                    <span className="font-bold text-gray-800">Root Superuser</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => showToast("Master Administrator credentials verified and secured.")}
                    className="w-full rounded-lg bg-[#0a1b33] py-2 text-xs font-bold text-white hover:bg-[#122b52]"
                  >
                    Audit Session Security
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-6 flex flex-col items-center justify-center text-center space-y-3">
                <ShieldCheck className="h-10 w-10 text-gray-400" />
                <div>
                  <h4 className="font-bold text-sm text-gray-700">Add Additional Administrator</h4>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">
                    Solo Admin configuration enforces single-custody security. Additional officer keys require board sign-off.
                  </p>
                </div>
                <button
                  onClick={() => showToast("Single-Officer Custody mode is enforced by Institution Protocol.")}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Request Dual-Custody Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 9: SETTINGS SPOT */}
        {/* ============================================================== */}
        {activeAdminSection === "settings" && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#0a1b33]">Institutional Control & Policy Settings</h1>
              <p className="mt-1 text-xs text-gray-500">
                Global limits, wire clearance protocols, SMTP gateways, and FDIC security settings for Stronghold Vault Trust Institution.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-6 text-xs text-gray-700">
              <div className="border-b pb-4">
                <h3 className="font-bold text-sm text-[#0a1b33] mb-1">Wire & Transfer Thresholds</h3>
                <p className="text-gray-500 mb-3">Outgoing wires exceeding this limit trigger automated administrator review.</p>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-600">$</span>
                  <input
                    type="number"
                    value={wireApprovalThreshold}
                    onChange={(e) => setWireApprovalThreshold(e.target.value)}
                    className="rounded-lg border border-gray-300 p-2 font-mono font-bold text-sm text-[#0a1b33] w-48"
                  />
                  <button
                    onClick={() => showToast(`Wire approval threshold set to $${Number(wireApprovalThreshold).toLocaleString()}`)}
                    className="rounded-lg bg-[#0a1b33] px-4 py-2 font-bold text-white hover:bg-[#122b52]"
                  >
                    Save Threshold
                  </button>
                </div>
              </div>

              <div className="border-b pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0a1b33] mb-1">Two-Factor Authentication Enforcement</h3>
                  <p className="text-gray-500">Mandate 4-digit PIN verification on customer external wire dispatch.</p>
                </div>
                <button
                  onClick={() => {
                    setTwoFactorEnforcement(!twoFactorEnforcement);
                    showToast(`Two-factor enforcement: ${!twoFactorEnforcement ? "ENABLED" : "DISABLED"}`);
                  }}
                  className={`rounded-full px-4 py-1.5 font-bold ${
                    twoFactorEnforcement ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {twoFactorEnforcement ? "Enforced (Active)" : "Optional"}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-[#0a1b33] mb-1">Automated SMTP Gateway</h3>
                  <p className="text-gray-500">TLS 256-bit automated email correspondence dispatch server status.</p>
                </div>
                <span className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
                  {smtpStatus}
                </span>
              </div>
            </div>
          </div>
        )}
        {/* ============================================================== */}
        {/* SECTION 10: REAL-TIME ACTIVITY AUDIT LOG */}
        {/* ============================================================== */}
        {activeAdminSection === "activity" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-emerald-600 animate-pulse" />
                  <h1 className="font-display text-2xl font-bold text-[#0a1b33]">Real-Time Activity Stream</h1>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Comprehensive institutional event log: user registrations, email activations, wire submissions, KYC reviews, and security actions.
                </p>
              </div>
              <button
                onClick={() => {
                  markAllActivitiesRead();
                  loadData();
                  showToast("All activities marked as acknowledged.");
                }}
                className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                Mark All Acknowledged
              </button>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
              <div className="space-y-3">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className={`flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border p-4 gap-3 transition-colors ${
                      act.severity === "critical"
                        ? "border-red-200 bg-red-50/50"
                        : act.severity === "warning"
                        ? "border-amber-200 bg-amber-50/40"
                        : act.severity === "success"
                        ? "border-emerald-200 bg-emerald-50/40"
                        : "border-gray-100 bg-gray-50/60"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                            act.severity === "critical"
                              ? "bg-red-200 text-red-900"
                              : act.severity === "warning"
                              ? "bg-amber-200 text-amber-900"
                              : act.severity === "success"
                              ? "bg-emerald-200 text-emerald-900"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {act.category}
                        </span>
                        <h4 className="font-bold text-sm text-[#0a1b33]">{act.title}</h4>
                      </div>
                      <p className="text-xs text-gray-600">{act.description}</p>
                      {act.userName && (
                        <p className="text-[11px] text-gray-400 font-mono">
                          Client: <strong>{act.userName}</strong> {act.reference ? `• Ref: ${act.reference}` : ""}
                        </p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-[11px] text-gray-400">
                        {new Date(act.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECTION 11: WEBSITE CONTENT MANAGEMENT (CMS) */}
        {/* ============================================================== */}
        {activeAdminSection === "cms" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  <h1 className="font-display text-2xl font-bold text-[#0a1b33]">Central Website Content Management</h1>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Update public website announcements, notice banners, contact lines, APY rates, and operational disclosures in real time.
                </p>
              </div>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                Live Public Synchronization Active
              </span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs space-y-6 text-xs text-gray-700">
              {/* Notice Banner */}
              <div className="border-b pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#0a1b33]">Global Public Top Notice Banner</h3>
                    <p className="text-gray-500">Display institution-wide alert across all public pages.</p>
                  </div>
                  <button
                    onClick={() => {
                      const updated = updateWebsiteContentConfig({ noticeBannerActive: !siteConfig.noticeBannerActive });
                      setSiteConfig(updated);
                      showToast(`Notice banner ${updated.noticeBannerActive ? "ENABLED" : "DISABLED"}`);
                    }}
                    className={`rounded-full px-4 py-1.5 font-bold ${
                      siteConfig.noticeBannerActive ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {siteConfig.noticeBannerActive ? "Published (Live)" : "Hidden"}
                  </button>
                </div>
                <input
                  type="text"
                  value={siteConfig.noticeBanner}
                  onChange={(e) => setSiteConfig({ ...siteConfig, noticeBanner: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-xs focus:border-[#0a1b33] focus:outline-none"
                />
              </div>

              {/* Announcements */}
              <div className="border-b pb-4 space-y-3">
                <h3 className="font-bold text-sm text-[#0a1b33]">Homepage Featured Institutional Announcement</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="font-bold uppercase text-gray-500">Announcement Headline</label>
                    <input
                      type="text"
                      value={siteConfig.announcementTitle}
                      onChange={(e) => setSiteConfig({ ...siteConfig, announcementTitle: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-[#0a1b33] focus:outline-none font-bold text-[#0a1b33]"
                    />
                  </div>
                  <div>
                    <label className="font-bold uppercase text-gray-500">High-Yield Savings Rate</label>
                    <input
                      type="text"
                      value={siteConfig.savingsApy}
                      onChange={(e) => setSiteConfig({ ...siteConfig, savingsApy: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold uppercase text-gray-500">Announcement Body</label>
                  <textarea
                    rows={3}
                    value={siteConfig.announcementBody}
                    onChange={(e) => setSiteConfig({ ...siteConfig, announcementBody: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-[#0a1b33] focus:outline-none"
                  />
                </div>
              </div>

              {/* Support Contact Lines */}
              <div className="border-b pb-4 space-y-3">
                <h3 className="font-bold text-sm text-[#0a1b33]">Customer Care & Escalation Contact Info</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="font-bold uppercase text-gray-500">Support Telephone</label>
                    <input
                      type="text"
                      value={siteConfig.supportPhone}
                      onChange={(e) => setSiteConfig({ ...siteConfig, supportPhone: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-[#0a1b33] focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold uppercase text-gray-500">Support Desk Email</label>
                    <input
                      type="email"
                      value={siteConfig.supportEmail}
                      onChange={(e) => setSiteConfig({ ...siteConfig, supportEmail: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-xs focus:border-[#0a1b33] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    updateWebsiteContentConfig(siteConfig);
                    showToast("Website content and public notices published live across institution portal!");
                  }}
                  className="rounded-lg bg-[#0a1b33] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#122b52] transition-colors shadow-sm"
                >
                  Save & Publish Live to Website
                </button>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      {/* Set Card Limit Modal */}
      {selectedUserForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-xs space-y-4 text-gray-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0a1b33]">Set Daily Spending Limit</h3>
              <button onClick={() => setSelectedUserForCard(null)} className="text-gray-400 hover:text-gray-700 font-bold text-base">✕</button>
            </div>

            <p className="text-gray-500">Client: <strong className="text-[#0a1b33]">{selectedUserForCard.fullName}</strong></p>

            <div>
              <label className="font-bold uppercase text-gray-500">Daily Spending Limit ($ USD)</label>
              <input
                type="number"
                value={cardDailyLimit}
                onChange={(e) => setCardDailyLimit(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-base font-mono font-bold text-[#0a1b33]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setSelectedUserForCard(null)} className="rounded border px-4 py-2 font-bold text-gray-600">Cancel</button>
              <button
                onClick={() => {
                  const lim = parseFloat(cardDailyLimit) || 5000;
                  if (selectedUserForCard.cards && selectedUserForCard.cards[0]) {
                    updateUserCard(selectedUserForCard.id, selectedUserForCard.cards[0].id, {
                      dailySpendingLimit: lim,
                    });
                    loadData();
                    showToast(`Updated daily card limit to $${lim.toLocaleString()} for ${selectedUserForCard.fullName}`);
                  }
                  setSelectedUserForCard(null);
                }}
                className="rounded bg-[#0a1b33] px-5 py-2 font-bold text-white hover:bg-[#122b52]"
              >
                Save Limit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Composer Modal */}
      {emailUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl text-xs space-y-4 text-gray-800">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0a1b33]">Send Email to {emailUser.fullName}</h3>
              <button onClick={() => setEmailUser(null)} className="text-gray-400 hover:text-gray-700 text-base font-bold">✕</button>
            </div>

            <div>
              <label className="font-bold uppercase text-gray-500">Recipient Email</label>
              <input type="text" disabled value={emailUser.email} className="mt-1 w-full rounded border bg-gray-100 p-2 text-gray-600 font-mono" />
            </div>

            <div>
              <label className="font-bold uppercase text-gray-500">Subject</label>
              <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} className="mt-1 w-full rounded border p-2" />
            </div>

            <div>
              <label className="font-bold uppercase text-gray-500">Message Body</label>
              <textarea rows={5} value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="mt-1 w-full rounded border p-2" />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button onClick={() => setEmailUser(null)} className="rounded border px-4 py-2 font-bold text-gray-600">Cancel</button>
              <button
                onClick={() => {
                  showToast(`Email dispatched to ${emailUser.email} via SMTP Gateway!`);
                  setEmailUser(null);
                }}
                className="rounded bg-[#0a1b33] px-5 py-2 font-bold text-white hover:bg-[#122b52]"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleSaveEditModal}
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl text-xs space-y-4 text-gray-800"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0a1b33]">Edit User Account: {editingUser.fullName}</h3>
              <button type="button" onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div>
              <label className="font-bold uppercase text-gray-500">Checking Balance ($ USD)</label>
              <input
                type="number"
                step="any"
                value={editBalanceInput}
                onChange={(e) => setEditBalanceInput(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-base font-bold text-[#0a1b33]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold uppercase text-gray-500">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-500">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold uppercase text-gray-500">Phone</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-500">4-Digit Security PIN</label>
                <input
                  type="text"
                  maxLength={4}
                  value={editPin}
                  onChange={(e) => setEditPin(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2 font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-lg border px-4 py-2 font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#0a1b33] px-5 py-2 font-bold text-white hover:bg-[#122b52]"
              >
                Save All Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create New User Modal */}
      {createUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleCreateUser}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-xs space-y-4 text-gray-800"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-[#0a1b33]">Create New Bank Client</h3>
              <button type="button" onClick={() => setCreateUserModal(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div>
              <label className="font-bold uppercase text-gray-500">Client Full Legal Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Jack Ray Affery"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-gray-500">Email Address</label>
              <input
                type="email"
                required
                placeholder="jackaffery2024@gmail.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold uppercase text-gray-500">Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="+1 2024692219"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="font-bold uppercase text-gray-500">Initial Balance ($)</label>
                <input
                  type="number"
                  value={newDeposit}
                  onChange={(e) => setNewDeposit(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setCreateUserModal(false)}
                className="rounded-lg border px-4 py-2 font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-5 py-2 font-bold text-white hover:bg-red-700"
              >
                Enroll Client
              </button>
            </div>
          </form>
        </div>
      )}

      {/* IRS Refunds Spot Management Modal */}
      {showIrsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl text-xs space-y-4 text-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="text-base font-bold text-[#0a1b33]">IRS Federal Tax Refund Treasury Spot</h3>
                  <p className="text-[11px] text-gray-500">Verify Treasury trace numbers, approve direct deposits, and audit federal returns</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIrsModal(false)}
                className="text-gray-400 hover:text-gray-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {users.map((u) => (
                <div key={u.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <span className="font-bold text-sm text-[#0a1b33] capitalize">{u.fullName}</span>
                      <span className="ml-2 font-mono text-[11px] text-gray-500">Acct #{u.accountNumber}</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700">Checking Balance: ${u.balance.toLocaleString()}</span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {(u.irsRefunds || []).map((refund) => (
                      <div
                        key={refund.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-lg border border-gray-200 bg-white p-3 gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0a1b33]">{refund.taxYear}</span>
                            <span
                              className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                refund.depositStatus === "deposited"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : refund.depositStatus === "approved"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {refund.depositStatus.replace("_", " ")}
                            </span>
                          </div>
                          <p className="font-mono text-[11px] text-gray-500 mt-0.5">Trace #{refund.treasuryTraceNumber}</p>
                          {refund.notes && <p className="text-[11px] text-gray-600 mt-0.5">{refund.notes}</p>}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-base font-bold text-emerald-600">
                            +${refund.refundAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>

                          {refund.depositStatus !== "deposited" && (
                            <button
                              onClick={() => {
                                adminUpdateIrsRefundStatus(
                                  u.id,
                                  refund.id,
                                  "deposited",
                                  "Treasury automated electronic deposit confirmed by Solo Administrator."
                                );
                                loadData();
                                showToast(`Approved & credited IRS refund of $${refund.refundAmount.toLocaleString()} to ${u.fullName}`);
                              }}
                              className="rounded bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 text-xs shadow-xs"
                            >
                              Approve & Deposit
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!u.irsRefunds || u.irsRefunds.length === 0) && (
                      <p className="text-[11px] text-gray-400">No IRS refund filings registered for this client.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowIrsModal(false)}
                className="rounded-lg border px-4 py-2 font-bold text-gray-600 hover:bg-gray-100"
              >
                Close IRS Spot
              </button>
            </div>
          </div>
        </div>
      )}
      {/* View Transaction Receipt Modal */}
      {viewingReceiptTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl text-xs space-y-4 text-gray-800">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gold" />
                <div>
                  <h3 className="text-base font-bold text-[#0a1b33]">STRONGHOLD VAULT TRUST</h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Official Transaction Receipt</p>
                </div>
              </div>
              <button onClick={() => setViewingReceiptTx(null)} className="text-gray-400 hover:text-gray-700 text-base font-bold">✕</button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500 font-sans">Reference:</span>
                <span className="font-bold text-[#0a1b33]">{viewingReceiptTx.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-sans">Date & Time:</span>
                <span className="text-gray-700">{new Date(viewingReceiptTx.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-sans">Status:</span>
                <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 font-sans font-bold uppercase text-[10px]">
                  {viewingReceiptTx.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-sans">Category / Type:</span>
                <span className="text-gray-700 uppercase">{viewingReceiptTx.transferCategory || viewingReceiptTx.type}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-sans">
                <span className="text-gray-500">Account Holder:</span>
                <span className="font-bold text-[#0a1b33]">{viewingReceiptTx.clientName} ({viewingReceiptTx.clientAccount})</span>
              </div>
              <div className="flex justify-between font-sans">
                <span className="text-gray-500">Description:</span>
                <span className="text-gray-800 text-right max-w-xs">{viewingReceiptTx.description}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-sm">
                <span className="font-sans font-bold text-[#0a1b33]">Amount Transacted:</span>
                <span className={`font-bold ${viewingReceiptTx.amount >= 0 ? "text-emerald-600" : "text-gray-900"}`}>
                  {viewingReceiptTx.amount >= 0 ? "+" : ""}${viewingReceiptTx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => {
                  window.print();
                }}
                className="rounded-lg border px-4 py-2 font-bold text-gray-700 hover:bg-gray-100"
              >
                Print Receipt
              </button>
              <button
                onClick={() => setViewingReceiptTx(null)}
                className="rounded-lg bg-[#0a1b33] px-5 py-2 font-bold text-white hover:bg-[#122b52]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Transaction Modal */}
      {generateTxUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={handleExecuteGenerateTx}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-xs space-y-4 text-gray-800"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0a1b33]">Generate Transaction</h3>
                <p className="text-[11px] text-gray-500">Client: <strong>{generateTxUser.fullName}</strong> ({generateTxUser.accountNumber})</p>
              </div>
              <button type="button" onClick={() => setGenerateTxUser(null)} className="text-gray-400 hover:text-gray-700 text-base font-bold">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold uppercase text-gray-500">Transaction Type</label>
                <select
                  value={genTxType}
                  onChange={(e) => setGenTxType(e.target.value as any)}
                  className="mt-1 w-full rounded border border-gray-300 p-2"
                >
                  <option value="deposit">Deposit (+ Credit)</option>
                  <option value="withdrawal">Withdrawal (- Debit)</option>
                  <option value="transfer">Transfer</option>
                  <option value="wire">Wire Payment</option>
                  <option value="fee">Institutional Fee</option>
                </select>
              </div>

              <div>
                <label className="font-bold uppercase text-gray-500">Transfer Category</label>
                <select
                  value={genTxCategory}
                  onChange={(e) => setGenTxCategory(e.target.value as any)}
                  className="mt-1 w-full rounded border border-gray-300 p-2"
                >
                  <option value="domestic">Domestic Transfer</option>
                  <option value="internal">Internal SVT Transfer</option>
                  <option value="international">International Wire</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold uppercase text-gray-500">Amount ($ USD)</label>
              <input
                type="number"
                step="any"
                required
                value={genTxAmount}
                onChange={(e) => setGenTxAmount(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2 font-mono font-bold text-base text-[#0a1b33]"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-gray-500">Description / Memo</label>
              <input
                type="text"
                required
                value={genTxDescription}
                onChange={(e) => setGenTxDescription(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 p-2"
              />
            </div>

            <div>
              <label className="font-bold uppercase text-gray-500">Execution Status</label>
              <select
                value={genTxStatus}
                onChange={(e) => setGenTxStatus(e.target.value as any)}
                className="mt-1 w-full rounded border border-gray-300 p-2"
              >
                <option value="completed">Completed (Immediately Posts & Updates Balance)</option>
                <option value="pending">Pending (Awaiting Verification)</option>
                <option value="processing">Processing</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setGenerateTxUser(null)}
                className="rounded border px-4 py-2 font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-[#0a1b33] px-5 py-2 font-bold text-white hover:bg-[#122b52]"
              >
                Post Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Login Activity Modal */}
      {loginActivityUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl text-xs space-y-4 text-gray-800">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0a1b33]">Login Activity & Security Logs</h3>
                <p className="text-[11px] text-gray-500">{loginActivityUser.fullName} • {loginActivityUser.email}</p>
              </div>
              <button onClick={() => setLoginActivityUser(null)} className="text-gray-400 hover:text-gray-700 text-base font-bold">✕</button>
            </div>

            <div className="space-y-3 font-mono">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-1">
                <div className="flex justify-between font-sans">
                  <span className="font-bold text-emerald-700">Recent Portal Session</span>
                  <span className="text-[10px] text-gray-400">Authorized</span>
                </div>
                <p className="text-[11px] text-gray-600">IP: 198.51.100.44 (Washington, D.C.)</p>
                <p className="text-[11px] text-gray-600">Device: Chrome on Windows 11 (256-bit TLS encrypted)</p>
                <p className="text-[10px] text-gray-400 font-sans">Timestamp: {new Date().toLocaleString()}</p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-1">
                <div className="flex justify-between font-sans">
                  <span className="font-bold text-gray-700">Prior Account Session</span>
                  <span className="text-[10px] text-gray-400">Authorized</span>
                </div>
                <p className="text-[11px] text-gray-600">IP: 198.51.100.12 (New York, NY)</p>
                <p className="text-[11px] text-gray-600">Device: Safari Mobile (iOS 18.1)</p>
                <p className="text-[10px] text-gray-400 font-sans">Timestamp: {new Date(Date.now() - 86400000 * 2).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setLoginActivityUser(null)}
                className="rounded-lg bg-[#0a1b33] px-5 py-2 font-bold text-white hover:bg-[#122b52]"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Sign-Out Prompt Modal */}
      {showSignOutPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-xs space-y-4 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600">
              <LogOut className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-[#0a1b33]">Sign Out of Solo Admin</h3>
            <p className="text-gray-500 text-[11px]">
              Where would you like to navigate after signing out of the administration console?
            </p>

            <div className="space-y-2 pt-2">
              <Link
                to="/"
                onClick={() => {
                  if (typeof window !== "undefined") sessionStorage.removeItem("svt_admin_authenticated");
                  setShowSignOutPrompt(false);
                }}
                className="cta-glow flex w-full items-center justify-center gap-2 rounded-lg bg-gold py-2.5 text-xs font-bold text-primary-deep transition-all hover:bg-gold-deep"
              >
                <span>Return to Bank Homepage (Home)</span>
              </Link>

              <Link
                to="/admin-login"
                onClick={() => {
                  if (typeof window !== "undefined") sessionStorage.removeItem("svt_admin_authenticated");
                  setShowSignOutPrompt(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100"
              >
                <span>Admin Login Portal</span>
              </Link>

              <button
                onClick={() => setShowSignOutPrompt(false)}
                className="w-full text-center text-gray-400 hover:text-gray-600 font-semibold py-1 text-[11px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
