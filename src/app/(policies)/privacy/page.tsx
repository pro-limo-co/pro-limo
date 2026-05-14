import { PolicyPage, policyMetadata } from "../PolicyPage";

export const metadata = policyMetadata("privacy");

export default function PrivacyPage() {
  return <PolicyPage slug="privacy" />;
}
