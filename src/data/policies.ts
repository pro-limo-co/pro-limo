export const policyUpdatedAt = "May 14, 2026";

export const policies = {
  legal: {
    title: "Legal",
    description:
      "Business and customer support information for Professional Limousine Driver.",
    sections: [
      {
        heading: "Business contact",
        body: [
          "Professional Limousine Driver operates a private chauffeur booking and dispatch experience for customers and travel teams.",
          "Legal, billing, accessibility, and account questions can be sent to concierge@prolimodriver.com.",
        ],
      },
      {
        heading: "Booking records",
        body: [
          "Ride requests, dispatch notes, passenger contact information, and driver status updates are kept so staff can coordinate service and support customers.",
          "Confirmed corporate agreements, invoices, refunds, and signed service terms take priority over general site copy.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy",
    description:
      "How Professional Limousine Driver handles booking, dispatch, and support information.",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "Booking forms collect passenger contact details, pickup and drop-off information, ride timing, party size, luggage count, service preference, and optional notes.",
          "Staff and driver workflows may add assignment, status, vehicle, dispatch, and completion details needed to operate the ride.",
        ],
      },
      {
        heading: "How we use information",
        body: [
          "Information is used to quote, confirm, dispatch, update, support, and audit chauffeur service.",
          "Operational diagnostics may be collected to detect runtime errors and keep booking, staff, and driver workflows reliable.",
        ],
      },
      {
        heading: "Choices",
        body: [
          "Customers can request booking support, contact updates, or account questions by emailing concierge@prolimodriver.com.",
          "Monthly marketing messages should include an unsubscribe path when campaign messaging is enabled.",
        ],
      },
    ],
  },
  terms: {
    title: "Terms",
    description:
      "Customer-facing terms for booking requests and chauffeur service coordination.",
    sections: [
      {
        heading: "Booking requests",
        body: [
          "Submitting a ride request sends details to dispatch. A ride is confirmed when dispatch accepts the request and confirms availability, timing, and price.",
          "Airport, hourly, city-to-city, business, and event requests may require additional details before confirmation.",
        ],
      },
      {
        heading: "Ride changes",
        body: [
          "Dispatch may update vehicle assignment, driver assignment, pickup notes, timing, or trip status as the ride moves through the queue.",
          "Customers and drivers should use the active ride link and direct support channel for day-of changes.",
        ],
      },
      {
        heading: "Payments",
        body: [
          "Payments are scaffolded in the product and can be enabled through the configured payment provider when the business is ready.",
          "Until payment capture is enabled, dispatch confirmation and direct billing determine the final payment flow.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookies",
    description:
      "Cookie and browser storage notes for Professional Limousine Driver.",
    sections: [
      {
        heading: "Essential storage",
        body: [
          "The site may use essential cookies or browser storage for authentication, staff access, booking continuity, and security.",
          "These records support sign-in, protected dispatch pages, and active ride workflows.",
        ],
      },
      {
        heading: "Diagnostics",
        body: [
          "Runtime diagnostics may record technical events so the team can investigate errors in booking, staff, and driver workflows.",
          "Customers can clear browser cookies through their browser settings, but staff sign-in and protected pages may require signing in again.",
        ],
      },
    ],
  },
} as const;

export type PolicySlug = keyof typeof policies;

export function getPolicy(slug: PolicySlug) {
  return policies[slug];
}
