import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Users,
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  DollarSign,
  Send,
  Trash2,
  ExternalLink,
  Copy,
  PlusCircle,
  TrendingUp,
} from "lucide-react";
import { meta, PageHero, Section } from "@/components/site";
import {
  getBankUsers,
  updateUserStatus,
  updateUserBalance,
  deleteBankUser,
  setCurrentSession,
  type BankUser,
} from "@/lib/bank-store";

export const Route = createFileRoute("/admin")({
  head: () =>
    meta(
      "SOLO Master Admin Console — Stronghold Vault Trust",
      "Executive control panel to manage all institutional client accounts, balances, and verification links."
    ),
  component: AdminPage,
});

function AdminPage() {
  const [users, setUsers] = useState<BankUser[]>([]);
  const [search, setSearch] = useState("");
  const [editingBalanceUser, setEditingBalanceUser] = useState<string | null>(null);
  const [newBalanceInput, setNewBalanceInput] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const loadData = () => {
    setUsers([...getBankUsers()]);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = (user: BankUser) => {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    updateUserStatus(user.id, nextStatus);
    loadData();
  };

  const handleSaveBalance = (userId: string) => {
    const val = parseFloat(newBalanceInput);
    if (!isNaN(val)) {
      updateUserBalance(userId, val);
      setEditingBalanceUser(null);
      setNewBalanceInput("");
      loadData();
    }
  };

  const handleDelete = (userId: string, name: string) => {
    if (confirm(`Are you sure you want to delete user ${name}? This cannot be undone.`)) {
      deleteBankUser(userId);
      loadData();
    }
  };

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  const handleImpersonateUser = (user: BankUser) => {
    setCurrentSession(user);
    window.location.href = "/dashboard";
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.accountNumber.includes(search)
  );

  const totalVaultLiquidity = users.reduce((acc, u) => acc + u.balance + u.savingsBalance, 0);

  return (
    <>
      <div className="border-b bg-primary-deep text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6">
          <div>
            <span className="rounded bg-gold/20 px-2.5 py-1 text-xs font-bold text-gold uppercase tracking-wider">
              SOLO Master Institution Control
            </span>
            <h1 className="mt-2 text-3xl font-bold text-white">Central Banking Administration</h1>
            <p className="mt-1 text-xs text-primary-foreground/70">
              Manage registered bank customers, override balances, audit 4-digit PINs, and issue one-time verification tokens.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/open-account"
              className="cta-glow flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-xs font-bold text-primary-deep transition-all hover:bg-gold-deep"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Enroll New Client</span>
            </Link>
          </div>
        </div>
      </div>

      <Section muted>
        {/* Metric Cards */}
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Enrolled Accounts
              </span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{users.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {users.filter((u) => u.status === "active").length} active, {users.filter((u) => u.status !== "active").length} pending/suspended
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Vault Balance Held
              </span>
              <DollarSign className="h-4 w-4 text-gold" />
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">
              ${totalVaultLiquidity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Combined checking & yield reserves</p>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Security Policy
              </span>
              <ShieldAlert className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-emerald-600">Enforced</p>
            <p className="mt-1 text-xs text-muted-foreground">4-digit PIN + One-time token activation</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="mt-8 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b pb-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-foreground">All Registered Bank Users</h2>
              <p className="text-xs text-muted-foreground">Direct controls over credentials, balance, and activation</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search user, email, account..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-xs focus:border-primary focus:outline-none sm:w-64"
              />
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 font-semibold">User / Email</th>
                  <th className="pb-3 font-semibold">Account / PIN</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Checking Balance</th>
                  <th className="pb-3 font-semibold">One-Time Verify Token</th>
                  <th className="pb-3 text-right font-semibold">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="py-3.5">
                      <p className="font-bold text-foreground">{u.fullName}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      <p className="text-[11px] text-muted-foreground">{u.phone}</p>
                    </td>

                    <td className="py-3.5">
                      <p className="font-mono text-xs font-bold text-foreground">#{u.accountNumber}</p>
                      <p className="text-xs text-muted-foreground">{u.accountType}</p>
                      <span className="mt-1 inline-block rounded bg-secondary px-1.5 py-0.5 font-mono text-[11px] font-semibold text-primary">
                        PIN: {u.pin}
                      </span>
                    </td>

                    <td className="py-3.5">
                      {u.status === "active" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      ) : u.status === "pending_verification" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600">
                          Pending Link
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                          <XCircle className="h-3 w-3" /> Suspended
                        </span>
                      )}
                    </td>

                    <td className="py-3.5">
                      {editingBalanceUser === u.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={newBalanceInput}
                            onChange={(e) => setNewBalanceInput(e.target.value)}
                            className="w-24 rounded border px-2 py-1 text-xs"
                            placeholder={u.balance.toString()}
                          />
                          <button
                            onClick={() => handleSaveBalance(u.id)}
                            className="rounded bg-primary px-2 py-1 text-xs font-bold text-primary-foreground"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            ${u.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                          <button
                            onClick={() => {
                              setEditingBalanceUser(u.id);
                              setNewBalanceInput(u.balance.toString());
                            }}
                            className="text-[11px] text-primary underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5">
                      {u.verificationLink ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyLink(u.verificationLink!, u.id)}
                            className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-secondary"
                          >
                            <Copy className="h-3 w-3 text-gold-ink" />
                            <span>{copiedLink === u.id ? "Copied!" : "Copy Link"}</span>
                          </button>
                          <a
                            href={u.verificationLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:text-gold"
                            title="Open verification link in new tab"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Already Verified</span>
                      )}
                    </td>

                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleImpersonateUser(u)}
                          className="rounded-md bg-gold/20 px-2.5 py-1 text-xs font-bold text-primary-deep hover:bg-gold/30"
                          title="Open user dashboard as this client"
                        >
                          Observe Dashboard
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`rounded px-2 py-1 text-xs font-medium ${
                            u.status === "active"
                              ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                              : "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                          }`}
                        >
                          {u.status === "active" ? "Suspend" : "Activate"}
                        </button>

                        <button
                          onClick={() => handleDelete(u.id, u.fullName)}
                          className="text-muted-foreground hover:text-destructive"
                          title="Delete Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </>
  );
}
