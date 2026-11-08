import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/components/site";
import { ProductPage } from "@/components/product-page";

export const Route = createFileRoute("/checking")({
  staticData: { sitemap: true },
  head: () => meta("Checking — Stronghold Vault Trust", "Everyday checking account services with full transaction history and alerts."),
  component: () => (
    <ProductPage eyebrow="Checking" title="Everyday account management, simplified"
      intro="Keep track of deposits, withdrawals and transfers with a clear, organized record of your activity."
      features={["Full transaction history", "Deposit, withdrawal and transfer records", "Downloadable statements", "Activity alerts", "Profile and security settings", "Authenticated support tickets"]}
      faqs={[["What do I need to apply?", "Your full legal name, contact details, residential address and date of birth. Applications are reviewed before activation."], ["What's the difference between available and pending?", "Available balance reflects completed activity. Pending items are still being processed and are shown separately."], ["Can I close my account?", "Yes — raise a request from your portal and our team will guide you through it."]]} />
  ),
});
