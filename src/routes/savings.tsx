import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/components/site";
import { ProductPage } from "@/components/product-page";

export const Route = createFileRoute("/savings")({
  staticData: { sitemap: true },
  head: () => meta("Savings — Stronghold Vault Trust", "Personal savings services with goal tracking, statements and transparent terms."),
  component: () => (
    <ProductPage eyebrow="Savings" title="Save with purpose and clarity"
      intro="Organize your savings toward the goals that matter, with simple tools and transparent terms."
      features={["Goal-based savings tracking", "No monthly maintenance fee", "Monthly electronic statements", "Real-time activity notifications", "Clear available vs pending balances", "Secure online access"]}
      faqs={[["Who can open a savings account?", "Individuals aged 18 or over who complete registration, email verification and our review process."], ["Are there fees?", "There is no monthly maintenance fee. Any applicable charges are disclosed before you open an account."], ["How do I view my statements?", "Statements are available to download from your customer portal each month."]]} />
  ),
});
