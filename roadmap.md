# Roadmap — Admin Backend Integration

Goal: one centralized, secure Admin Dashboard controlling the whole SVT website, backed by a real database (Lovable Cloud). No mock data, no localStorage-only features.

Defaults (user skipped questions): email+password auth, empty DB (no demo seed), full customer profiles (account no., balances, phone/address, verification status), first admin via hidden admin portal.

## Tasks

1. [in progress] Enable Lovable Cloud (database + auth + server functions)
2. [ ] Database schema migration: profiles, user_roles (+ has_role), accounts, transactions, beneficiaries, notifications, activity_log, admin_audit_log, support_requests, website_content — with GRANTs, RLS, triggers (auto-profile on signup)
3. [ ] Auth: customer signup/login (email+password, email confirm), /reset-password page, _authenticated gate for dashboard subtree, sign-in affordance reflects session, sign-out hygiene
4. [ ] Admin auth: /admin-login separate portal, first-admin bootstrap, role-based access via user_roles
5. [ ] Server functions: customer management (approve/reject/suspend/reactivate/close), transaction review (approve/reject, no silent balance edits — reason + immutable audit), notifications, activity feed, website content publishing
6. [ ] Rewire customer pages (dashboard, transfer, cards, digital-assets, account-profile, open-account, verify-email) from bank-store localStorage to server functions
7. [ ] Rewire admin.tsx to real data: customers, applications, transactions, activity, notifications, content management
8. [ ] Audit trail: every admin action + customer activity recorded with timestamp/reference
9. [ ] Tests for money/permission rules (approve/reject flows, balance immutability, RLS)
10. [ ] End-to-end verification: customer flow + admin flow in browser

## Standing open items (from earlier)
- Real support email address (support@strongholdvaulttrust.com is a placeholder)
- Pamela Del Rey's real role/quote (current section copy is placeholder)
