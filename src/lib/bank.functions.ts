import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";

// JSON values that can cross the server-function RPC boundary.
type SerializableJson = string | number | boolean | null | SerializableJson[] | { [key: string]: SerializableJson };

// ---------- shared DTO types (plain objects only) ----------

export type ProfileDTO = {
  id: string;
  fullName: string;
  username: string | null;
  phone: string | null;
  address: string | null;
  accountNumber: string | null;
  status: string;
  emailVerified: boolean;
  createdAt: string;
};

export type AccountDTO = {
  id: string;
  userId: string;
  type: string;
  balance: number;
  currency: string;
};

export type TransactionDTO = {
  id: string;
  userId: string;
  accountId: string | null;
  type: string;
  description: string;
  amount: number;
  fee: number;
  currency: string;
  status: string;
  reference: string;
  sender: SerializableJson | null;
  recipient: SerializableJson | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewReason: string | null;
  createdAt: string;
};

export type BeneficiaryDTO = {
  id: string;
  userId: string;
  name: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  createdAt: string;
};

export type NotificationDTO = {
  id: string;
  userId: string | null;
  audience: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type ActivityDTO = {
  id: string;
  userId: string | null;
  event: string;
  description: string;
  reference: string | null;
  createdAt: string;
};

export type SupportRequestDTO = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
};

export type AuditDTO = {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  createdAt: string;
};

// ---------- row mappers ----------

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapProfile(r: any): ProfileDTO {
  return {
    id: r.id,
    fullName: r.full_name ?? "",
    username: r.username ?? null,
    phone: r.phone ?? null,
    address: r.address ?? null,
    accountNumber: r.account_number ?? null,
    status: r.status ?? "pending_approval",
    emailVerified: r.email_verified ?? false,
    createdAt: r.created_at,
  };
}

function mapAccount(r: any): AccountDTO {
  return { id: r.id, userId: r.user_id, type: r.type, balance: Number(r.balance), currency: r.currency };
}

function mapTransaction(r: any): TransactionDTO {
  return {
    id: r.id,
    userId: r.user_id,
    accountId: r.account_id ?? null,
    type: r.type,
    description: r.description ?? "",
    amount: Number(r.amount),
    fee: Number(r.fee ?? 0),
    currency: r.currency ?? "USD",
    status: r.status,
    reference: r.reference,
    sender: r.sender ?? null,
    recipient: r.recipient ?? null,
    reviewedBy: r.reviewed_by ?? null,
    reviewedAt: r.reviewed_at ?? null,
    reviewReason: r.review_reason ?? null,
    createdAt: r.created_at,
  };
}

function mapBeneficiary(r: any): BeneficiaryDTO {
  return {
    id: r.id,
    userId: r.user_id,
    name: r.name,
    bankName: r.bank_name ?? "",
    accountNumber: r.account_number ?? "",
    routingNumber: r.routing_number ?? "",
    createdAt: r.created_at,
  };
}

function mapNotification(r: any): NotificationDTO {
  return {
    id: r.id,
    userId: r.user_id ?? null,
    audience: r.audience,
    title: r.title,
    body: r.body ?? "",
    read: r.read ?? false,
    createdAt: r.created_at,
  };
}

function mapActivity(r: any): ActivityDTO {
  return {
    id: r.id,
    userId: r.user_id ?? null,
    event: r.event,
    description: r.description ?? "",
    reference: r.reference ?? null,
    createdAt: r.created_at,
  };
}

function mapSupport(r: any): SupportRequestDTO {
  return {
    id: r.id,
    userId: r.user_id ?? null,
    name: r.name ?? "",
    email: r.email ?? "",
    subject: r.subject ?? "",
    message: r.message ?? "",
    status: r.status ?? "open",
    createdAt: r.created_at,
  };
}

function mapAudit(r: any): AuditDTO {
  return {
    id: r.id,
    adminId: r.admin_id,
    action: r.action,
    targetType: r.target_type ?? "",
    targetId: r.target_id ?? "",
    reason: r.reason ?? "",
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------- helpers ----------

type AuthedContext = {
  supabase: any;
  userId: string;
};

async function requireAdmin(ctx: AuthedContext) {
  const { data: isAdmin } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("Forbidden: administrator access required");
}

async function audit(
  ctx: AuthedContext,
  action: string,
  targetType: string,
  targetId: string,
  reason: string,
  metadata?: Record<string, unknown>,
) {
  await ctx.supabase.from("admin_audit_log").insert({
    admin_id: ctx.userId,
    action,
    target_type: targetType,
    target_id: targetId,
    reason,
    metadata: metadata ?? null,
  });
}

async function logActivity(
  ctx: AuthedContext,
  userId: string,
  event: string,
  description: string,
  reference?: string,
  metadata?: Record<string, unknown>,
) {
  await ctx.supabase.from("activity_log").insert({
    user_id: userId,
    event,
    description,
    reference: reference ?? null,
    metadata: metadata ?? null,
  });
}

async function notifyAdmins(ctx: AuthedContext, title: string, body: string) {
  await ctx.supabase.from("notifications").insert({
    user_id: null,
    audience: "admin",
    title,
    body,
  });
}

async function notifyCustomer(ctx: AuthedContext, userId: string, title: string, body: string) {
  await ctx.supabase.from("notifications").insert({
    user_id: userId,
    audience: "customer",
    title,
    body,
  });
}

function makeReference(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

// ---------- customer functions ----------

export const getMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    const { data, error } = await ctx.supabase.from("profiles").select("*").eq("id", ctx.userId).single();
    if (error) throw new Error(error.message);
    return mapProfile(data);
  });

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { fullName?: string; username?: string; phone?: string; address?: string }) => input)
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    const updates: Record<string, unknown> = {};
    if (data.fullName !== undefined) updates["full_name"] = data.fullName;
    if (data.username !== undefined) updates["username"] = data.username;
    if (data.phone !== undefined) updates["phone"] = data.phone;
    if (data.address !== undefined) updates["address"] = data.address;
    const { data: row, error } = await ctx.supabase
      .from("profiles")
      .update(updates)
      .eq("id", ctx.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(ctx, ctx.userId, "profile_update", "Customer updated their profile");
    return mapProfile(row);
  });

export const getMyAccounts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    let { data, error } = await ctx.supabase.from("accounts").select("*").eq("user_id", ctx.userId);
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      // Lazily create the default checking account for new customers.
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error: insErr } = await supabaseAdmin
        .from("accounts")
        .insert({ user_id: ctx.userId, type: "checking", balance: 0, currency: "USD" });
      if (insErr) throw new Error(insErr.message);
      const retry = await ctx.supabase.from("accounts").select("*").eq("user_id", ctx.userId);
      data = retry.data ?? [];
    }
    return (data ?? []).map(mapAccount);
  });

export const getMyTransactions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    const { data, error } = await ctx.supabase
      .from("transactions")
      .select("*")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapTransaction);
  });

export const createTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      type: string;
      description: string;
      amount: number;
      fee?: number;
      accountId?: string;
      sender?: SerializableJson;
      recipient?: SerializableJson;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    if (!Number.isFinite(data.amount) || data.amount === 0) throw new Error("Amount must be a non-zero number");
    const reference = makeReference("TXN");
    const { data: row, error } = await ctx.supabase
      .from("transactions")
      .insert({
        user_id: ctx.userId,
        account_id: data.accountId ?? null,
        type: data.type,
        description: data.description,
        amount: data.amount,
        fee: data.fee ?? 0,
        status: "pending",
        reference,
        sender: data.sender ?? null,
        recipient: data.recipient ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(ctx, ctx.userId, "transaction_created", `${data.type} of ${data.amount} submitted for review`, reference);
    await notifyAdmins(ctx, "New transaction pending review", `${data.type} ${data.amount} (${reference}) awaits approval.`);
    return mapTransaction(row);
  });

export const getMyBeneficiaries = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    const { data, error } = await ctx.supabase
      .from("beneficiaries")
      .select("*")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapBeneficiary);
  });

export const addBeneficiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { name: string; bankName: string; accountNumber: string; routingNumber: string }) => input)
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    const { data: row, error } = await ctx.supabase
      .from("beneficiaries")
      .insert({
        user_id: ctx.userId,
        name: data.name,
        bank_name: data.bankName,
        account_number: data.accountNumber,
        routing_number: data.routingNumber,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(ctx, ctx.userId, "beneficiary_added", `Beneficiary ${data.name} added`);
    return mapBeneficiary(row);
  });

export const deleteBeneficiary = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    const { error } = await ctx.supabase.from("beneficiaries").delete().eq("id", data.id).eq("user_id", ctx.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    const { data, error } = await ctx.supabase
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${ctx.userId},and(user_id.is.null,audience.eq.customer)`)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapNotification);
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    const { error } = await ctx.supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", data.id)
      .eq("user_id", ctx.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const submitSupportRequest = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; email: string; subject: string; message: string; userId?: string }) => input)
  .handler(async ({ data }) => {
    // Public endpoint for the contact form: only inserts a support request, returns nothing private.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("support_requests").insert({
      user_id: data.userId ?? null,
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("notifications").insert({
      user_id: null,
      audience: "admin",
      title: "New support request",
      body: `${data.name} (${data.email}): ${data.subject}`,
    });
    return { ok: true };
  });

// ---------- admin functions ----------

export const bootstrapFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    const { data, error } = await ctx.supabase.rpc("bootstrap_first_admin");
    if (error) throw new Error(error.message);
    return { granted: Boolean(data) };
  });

export const getMyRoles = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    const { data, error } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: { role: string }) => r.role);
  });

export const adminListCustomers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    await requireAdmin(ctx);
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapProfile);
  });

export const adminSetCustomerStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; status: string; reason: string }) => input)
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    await requireAdmin(ctx);
    const allowed = ["active", "pending_approval", "suspended", "rejected", "closed"];
    if (!allowed.includes(data.status)) throw new Error("Invalid status");
    if (!data.reason?.trim()) throw new Error("A documented reason is required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("profiles")
      .update({ status: data.status })
      .eq("id", data.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await audit(ctx, `customer_status_${data.status}`, "profile", data.userId, data.reason);
    await logActivity(ctx, data.userId, "account_status", `Account status changed to ${data.status}`, undefined, {
      by: ctx.userId,
    });
    await notifyCustomer(
      ctx,
      data.userId,
      "Account status update",
      data.status === "active"
        ? "Your account has been approved and is now fully active."
        : `Your account status is now: ${data.status}. Reason: ${data.reason}`,
    );
    return mapProfile(row);
  });

export const adminListTransactions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { status?: string } | undefined) => input ?? {})
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    await requireAdmin(ctx);
    let q = ctx.supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(500);
    if (data?.status) q = q.eq("status", data.status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []).map(mapTransaction);
  });

export const adminReviewTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { transactionId: string; decision: "approved" | "rejected"; reason: string }) => input)
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    await requireAdmin(ctx);
    if (!data.reason?.trim()) throw new Error("A documented reason is required");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: tx, error: txErr } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("id", data.transactionId)
      .single();
    if (txErr || !tx) throw new Error("Transaction not found");
    if (tx.status !== "pending") throw new Error("Only pending transactions can be reviewed");

    if (data.decision === "approved") {
      // Apply the balance movement exactly once, at approval time.
      let accountId = tx.account_id as string | null;
      if (!accountId) {
        const { data: acct } = await supabaseAdmin
          .from("accounts")
          .select("id")
          .eq("user_id", tx.user_id)
          .eq("type", "checking")
          .maybeSingle();
        accountId = acct?.id ?? null;
      }
      if (accountId) {
        const { data: acct, error: acctErr } = await supabaseAdmin
          .from("accounts")
          .select("balance")
          .eq("id", accountId)
          .single();
        if (acctErr || !acct) throw new Error("Account not found");
        const delta = Number(tx.amount) - Number(tx.fee ?? 0);
        const next = Number(acct.balance) + delta;
        if (next < 0) throw new Error("Insufficient funds to approve this transaction");
        const { error: upErr } = await supabaseAdmin
          .from("accounts")
          .update({ balance: next })
          .eq("id", accountId);
        if (upErr) throw new Error(upErr.message);
      }
    }

    const { data: row, error } = await supabaseAdmin
      .from("transactions")
      .update({
        status: data.decision,
        reviewed_by: ctx.userId,
        reviewed_at: new Date().toISOString(),
        review_reason: data.reason,
      })
      .eq("id", data.transactionId)
      .eq("status", "pending")
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    await audit(ctx, `transaction_${data.decision}`, "transaction", data.transactionId, data.reason, {
      reference: tx.reference,
      amount: tx.amount,
    });
    await logActivity(
      ctx,
      tx.user_id,
      `transaction_${data.decision}`,
      `Transaction ${tx.reference} ${data.decision}`,
      tx.reference,
    );
    await notifyCustomer(
      ctx,
      tx.user_id,
      `Transaction ${data.decision}`,
      `Your ${tx.type} of ${tx.amount} ${tx.currency} (${tx.reference}) was ${data.decision}. Reason: ${data.reason}`,
    );
    return mapTransaction(row);
  });

export const adminAdjustBalance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId: string; accountType: string; delta: number; reason: string }) => input)
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    await requireAdmin(ctx);
    if (!data.reason?.trim()) throw new Error("A documented reason is required for every balance adjustment");
    if (!Number.isFinite(data.delta) || data.delta === 0) throw new Error("Adjustment must be a non-zero number");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let { data: acct } = await supabaseAdmin
      .from("accounts")
      .select("*")
      .eq("user_id", data.userId)
      .eq("type", data.accountType)
      .maybeSingle();
    if (!acct) {
      const { data: created, error: cErr } = await supabaseAdmin
        .from("accounts")
        .insert({ user_id: data.userId, type: data.accountType, balance: 0, currency: "USD" })
        .select("*")
        .single();
      if (cErr) throw new Error(cErr.message);
      acct = created;
    }
    const next = Number(acct!.balance) + data.delta;
    if (next < 0) throw new Error("Adjustment would make the balance negative");
    const { error: upErr } = await supabaseAdmin
      .from("accounts")
      .update({ balance: next })
      .eq("id", acct!.id);
    if (upErr) throw new Error(upErr.message);

    const reference = makeReference("ADJ");
    await supabaseAdmin.from("transactions").insert({
      user_id: data.userId,
      account_id: acct!.id,
      type: "admin_adjustment",
      description: `Administrative adjustment: ${data.reason}`,
      amount: data.delta,
      fee: 0,
      status: "approved",
      reference,
      reviewed_by: ctx.userId,
      reviewed_at: new Date().toISOString(),
      review_reason: data.reason,
    });
    await audit(ctx, "balance_adjustment", "account", acct!.id, data.reason, {
      userId: data.userId,
      delta: data.delta,
      reference,
    });
    await logActivity(ctx, data.userId, "balance_adjustment", `Balance adjusted by ${data.delta}`, reference);
    await notifyCustomer(ctx, data.userId, "Account adjustment", `An adjustment of ${data.delta} USD was applied to your ${data.accountType} account. Reference ${reference}.`);
    return { ok: true, reference, newBalance: next };
  });

export const adminListActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    await requireAdmin(ctx);
    const { data, error } = await ctx.supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapActivity);
  });

export const adminListNotifications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    await requireAdmin(ctx);
    const { data, error } = await ctx.supabase
      .from("notifications")
      .select("*")
      .eq("audience", "admin")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapNotification);
  });

export const adminSendNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { userId?: string; title: string; body: string }) => input)
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    await requireAdmin(ctx);
    if (!data.title.trim()) throw new Error("Title is required");
    const { error } = await ctx.supabase.from("notifications").insert({
      user_id: data.userId ?? null,
      audience: "customer",
      title: data.title,
      body: data.body,
    });
    if (error) throw new Error(error.message);
    await audit(ctx, "send_notification", data.userId ? "profile" : "broadcast", data.userId ?? "all", data.title);
    return { ok: true };
  });

export const adminListAuditLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    await requireAdmin(ctx);
    const { data, error } = await ctx.supabase
      .from("admin_audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapAudit);
  });

export const adminListSupportRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    await requireAdmin(ctx);
    const { data, error } = await ctx.supabase
      .from("support_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapSupport);
  });

export const adminUpdateSupportRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; status: string }) => input)
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    await requireAdmin(ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("support_requests").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    await audit(ctx, "support_request_status", "support_request", data.id, data.status);
    return { ok: true };
  });

export const getWebsiteContent = createServerFn({ method: "GET" }).handler(async () => {
  // Public read-only: website_content has a public SELECT policy and holds only public copy.
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabasePublic = createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data, error } = await supabasePublic.from("website_content").select("key, value");
  if (error) throw new Error(error.message);
  const out: Record<string, SerializableJson> = {};
  for (const row of data ?? []) out[row.key as string] = row.value as SerializableJson;
  return out;
});

export const adminUpdateWebsiteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { key: string; value: unknown; reason: string }) => input)
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    await requireAdmin(ctx);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("website_content").upsert({
      key: data.key,
      value: data.value as Json,
      updated_by: ctx.userId,
      updated_at: new Date().toISOString(),
    });
    if (error) throw new Error(error.message);
    await audit(ctx, "website_content_update", "website_content", data.key, data.reason || "Content update");
    return { ok: true };
  });

// ---------- cards & digital assets ----------

export type CardDTO = {
  id: string;
  userId: string;
  type: string;
  cardNumber: string;
  expiryDate: string;
  cardholderName: string;
  dailySpendingLimit: number;
  dailyAtmLimit: number;
  status: string;
};

export type DigitalAssetDTO = {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  balance: number;
  fiatValueUsd: number;
  custodyAddress: string;
  status: string;
  lastAudit: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapCard(r: any): CardDTO {
  return {
    id: r.id,
    userId: r.user_id,
    type: r.type,
    cardNumber: r.card_number ?? "",
    expiryDate: r.expiry_date ?? "",
    cardholderName: r.cardholder_name ?? "",
    dailySpendingLimit: Number(r.daily_spending_limit ?? 0),
    dailyAtmLimit: Number(r.daily_atm_limit ?? 0),
    status: r.status ?? "active",
  };
}

function mapDigitalAsset(r: any): DigitalAssetDTO {
  return {
    id: r.id,
    userId: r.user_id,
    symbol: r.symbol,
    name: r.name ?? "",
    balance: Number(r.balance ?? 0),
    fiatValueUsd: Number(r.fiat_value_usd ?? 0),
    custodyAddress: r.custody_address ?? "",
    status: r.status ?? "secured",
    lastAudit: r.last_audit ?? "",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const getMyCards = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    let { data, error } = await ctx.supabase
      .from("cards")
      .select("*")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) {
      // Issue a default debit card for new customers.
      const { data: profile } = await ctx.supabase
        .from("profiles")
        .select("full_name")
        .eq("id", ctx.userId)
        .single();
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const last4 = String(Math.floor(1000 + Math.random() * 9000));
      const { error: insErr } = await supabaseAdmin.from("cards").insert({
        user_id: ctx.userId,
        type: "debit",
        card_number: `•••• •••• •••• ${last4}`,
        expiry_date: "12/29",
        cardholder_name: (profile?.full_name ?? "SVT CUSTOMER").toUpperCase(),
        daily_spending_limit: 2500,
        daily_atm_limit: 1000,
        status: "active",
      });
      if (insErr) throw new Error(insErr.message);
      const retry = await ctx.supabase.from("cards").select("*").eq("user_id", ctx.userId);
      data = retry.data ?? [];
    }
    return (data ?? []).map(mapCard);
  });

export const updateMyCard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { cardId: string; dailySpendingLimit?: number; dailyAtmLimit?: number; status?: string }) => input,
  )
  .handler(async ({ data, context }) => {
    const ctx = context as unknown as AuthedContext;
    const updates: Record<string, unknown> = {};
    if (data.dailySpendingLimit !== undefined) {
      if (!Number.isFinite(data.dailySpendingLimit) || data.dailySpendingLimit < 100)
        throw new Error("Daily spending limit must be at least $100");
      updates["daily_spending_limit"] = data.dailySpendingLimit;
    }
    if (data.dailyAtmLimit !== undefined) {
      if (!Number.isFinite(data.dailyAtmLimit) || data.dailyAtmLimit < 100)
        throw new Error("Daily ATM limit must be at least $100");
      updates["daily_atm_limit"] = data.dailyAtmLimit;
    }
    if (data.status !== undefined) {
      if (!["active", "frozen"].includes(data.status)) throw new Error("Invalid card status");
      updates["status"] = data.status;
    }
    const { data: row, error } = await ctx.supabase
      .from("cards")
      .update(updates)
      .eq("id", data.cardId)
      .eq("user_id", ctx.userId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await logActivity(ctx, ctx.userId, "card_update", `Card settings updated`, undefined, updates);
    return mapCard(row);
  });

export const getMyDigitalAssets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as unknown as AuthedContext;
    const { data, error } = await ctx.supabase
      .from("digital_assets")
      .select("*")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapDigitalAsset);
  });
