import { PiggyBank, Wallet, Briefcase, LineChart, UserCog, FileText, Headset, type LucideIcon } from "lucide-react";

export type Service = { icon: LucideIcon; title: string; desc: string; eligibility: string; terms: string };

export const services: Service[] = [
  { icon: PiggyBank, title: "Personal Savings Services", desc: "Set aside funds toward personal goals with clear, simple account tools and progress tracking.", eligibility: "Individuals aged 18+ who complete registration and identity checks.", terms: "No monthly maintenance fee. Terms are disclosed in full before account opening." },
  { icon: Wallet, title: "Checking Account Services", desc: "Everyday account management with transaction history, statements and activity alerts.", eligibility: "Individuals aged 18+ with a verified email and approved application.", terms: "Fee schedule provided at opening. No hidden charges." },
  { icon: Briefcase, title: "Business Financial Services", desc: "Account tools for sole traders and small businesses, with organized records and reporting.", eligibility: "Registered businesses with an authorized representative.", terms: "Subject to business verification and an individual review." },
  { icon: LineChart, title: "Financial Planning Resources", desc: "Guides, calculators and educational material to help you plan budgets and savings.", eligibility: "Available to all registered customers.", terms: "Educational content only — not personalized financial advice." },
  { icon: UserCog, title: "Account Management", desc: "Update personal details, manage preferences and review account status in one place.", eligibility: "All active account holders.", terms: "Some changes require re-verification for your protection." },
  { icon: FileText, title: "Electronic Statements", desc: "Paperless monthly statements available to view and download from your portal.", eligibility: "All active account holders.", terms: "Statements retained in the portal for at least 24 months." },
  { icon: Headset, title: "Secure Customer Support", desc: "Raise and track support requests through an authenticated ticket system.", eligibility: "Registered customers; general enquiries open to everyone.", terms: "We will never ask for your password by email or message." },
];
