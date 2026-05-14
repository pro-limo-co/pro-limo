import { PolicyPage, policyMetadata } from "../PolicyPage";

export const metadata = policyMetadata("cookies");

export default function CookiesPage() {
  return <PolicyPage slug="cookies" />;
}
