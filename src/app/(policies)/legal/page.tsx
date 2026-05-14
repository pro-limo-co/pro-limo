import { PolicyPage, policyMetadata } from "../PolicyPage";

export const metadata = policyMetadata("legal");

export default function LegalPage() {
  return <PolicyPage slug="legal" />;
}
