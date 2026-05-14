import { PolicyPage, policyMetadata } from "../PolicyPage";

export const metadata = policyMetadata("terms");

export default function TermsPage() {
  return <PolicyPage slug="terms" />;
}
