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
} from "lucide-react";
import { meta } from "@/components/site";
import {
  getBankUsers,
  updateUserStatus,
  updateUserBalance,
  updateUserDetails,
  deleteBankUser,
  setCurrentSession,
  registerNewUser,
  type BankUser,
} from "@/lib/bank-store";

export const Route = createFileRoute("/admin")({
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
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPin, setNewPin] = useState("2026");
  const [newDeposit, setNewDeposit] = useState("5000");

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    setUsers([...getBankUsers()]);
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

  return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 rounded-xl bg-[#0a1b33] px-5 py-3 text-sm font-bold text-white shadow-2xl border border-gold/40">
          {toastMsg}
        </div>
      )}

      {/* Left Sidebar matching screenshot exactly */}
      <aside className="w-64 shrink-0 border-r border-gray-200 bg-white">
        {/* Administrator Tag Bar */}
        <div className="flex items-center gap-3 border-b border-gray-200 p-4">
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

        {/* Sidebar Navigation */}
        <nav className="p-3 space-y-1 text-xs font-semibold text-gray-700">
          <Link
            to="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-bold text-[#0a1b33] bg-gray-100"
          >
            <Users className="h-4 w-4 text-red-600" />
            <span>Manage Users</span>
          </Link>

          <Link
            to="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-100"
          >
            <DollarSign className="h-4 w-4" />
            <span>Users Deposits</span>
          </Link>

          <button
            onClick={() => showToast("Loan Applications module active — 0 outstanding requests.")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100"
          >
            <Building2 className="h-4 w-4" />
            <span>Loan Applications</span>
          </button>

          <button
            onClick={() => showToast("Virtual Cards module active — 2 cards provisioned.")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100"
          >
            <CreditCard className="h-4 w-4" />
            <span>Virtual Cards</span>
          </button>

          <button
            onClick={() => showToast("IRS Tax Refund module active.")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100"
          >
            <FileText className="h-4 w-4" />
            <span>IRS Refunds</span>
          </button>

          <button
            onClick={() => showToast("Automated Email Gateway: SMTP 256-bit Active.")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100"
          >
            <Mail className="h-4 w-4" />
            <span>Email Services</span>
          </button>

          <button
            onClick={() => setCreateUserModal(true)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-100 text-primary font-bold"
          >
            <PlusCircle className="h-4 w-4 text-emerald-600" />
            <span>Create New User</span>
          </button>

          <div className="pt-4 border-t border-gray-100">
            <Link
              to="/admin-login"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Administrative Workplace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex items-center gap-4">
            <span className="rounded bg-red-600 px-2 py-1 text-xs font-extrabold uppercase text-white tracking-wider">
              US
            </span>
            <span className="font-display text-lg font-bold text-[#0a1b33]">
              Stronghold Vault Trust Institution
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search user, ID, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-72 rounded-lg border border-gray-300 bg-gray-50 py-2 pl-9 pr-3 text-xs focus:border-[#0a1b33] focus:outline-none"
              />
            </div>
            <button
              onClick={() => showToast("No new security alerts.")}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            >
              <Bell className="h-5 w-5" />
            </button>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#0a1b33] text-xs font-bold text-white">
              A
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
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
                          <button
                            onClick={() => openEditModal(u)}
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
                              onClick={() => handleToggleDormant(u)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                            >
                              <RotateCcw className="h-4 w-4 text-blue-600" />
                              <span>{u.status === "dormant" ? "Turn Off Dormant" : "Turn On Dormant Account"}</span>
                            </button>

                            <button
                              onClick={() => handleClearAccount(u)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              <RotateCcw className="h-4 w-4 text-red-600" />
                              <span>Clear Account</span>
                            </button>

                            <button
                              onClick={() => handleClearBtcAccount(u)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50"
                            >
                              <DollarSign className="h-4 w-4 text-amber-600" />
                              <span>Clear BTC Account</span>
                            </button>

                            <button
                              onClick={() => openEditModal(u)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                            >
                              <Edit3 className="h-4 w-4 text-blue-600" />
                              <span>Edit Profile</span>
                            </button>

                            <button
                              onClick={() => showToast(`Automated message dispatched to ${u.email}`)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                            >
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span>Send Email</span>
                            </button>

                            <div className="border-t border-gray-100 my-1" />

                            <button
                              onClick={() => handleLoginAsUser(u)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                            >
                              <UserCheck className="h-4 w-4 text-emerald-600" />
                              <span>Login as {u.username || u.fullName.split(" ")[0]}</span>
                            </button>

                            <button
                              onClick={() => showToast(`Audit trail recorded for ${u.fullName}`)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                            >
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span>Login Activity</span>
                            </button>

                            <button
                              onClick={() => handleBlockUser(u)}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50"
                            >
                              <Ban className="h-4 w-4 text-amber-600" />
                              <span>{u.status === "suspended" ? "Unblock Account" : "Block Account"}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u)}
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
        </main>
      </div>

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
    </div>
  );
}
