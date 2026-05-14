# Professional Limousine Driver

Private chauffeur and airport car service for travelers and businesses around Portland and the current regional service area, with flat rates, professional drivers, and a polished arrival every time.

Domain: [ProLimoDriver.com](https://prolimodriver.com). Built with Next.js 16, React 19, Tailwind CSS v4.

## Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (CSS-first config)
- **Type**: Cormorant Garamond (display) + Geist (sans) + Geist Mono
- **Images**: SVG illustrations + dynamic Open Graph via `next/og`
- **SEO**: JSON-LD structured data, sitemap, robots, programmatic location x service pages
- **Convex**: Booking persistence, dispatch workflow data, Better Auth-backed staff access
- **Payments**: Stripe Checkout scaffold with webhook sync
- **Observability**: Sentry runtime error reporting for client, server, and edge runtimes

## Getting started

```bash
bun install
bun run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Build

```bash
bun run build
bun run start
```

Output is static for the marketing surface: home, locations index, 28 location pages, services index, 5 service pages, 140 location x service combos, business, sitemap, robots, and a dynamic Open Graph route.

## Production environment

Vercel production is wired to the ProLimo Convex deployment:

| Variable | Purpose |
|---|---|
| `CONVEX_DEPLOYMENT` | Convex production deployment name |
| `CONVEX_DEPLOY_KEY` | Secret deploy key for Convex production deploys |
| `NEXT_PUBLIC_CONVEX_URL` | Browser-safe Convex cloud URL |
| `CONVEX_HTTP_ACTIONS_URL` | Server-side Convex HTTP Actions URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Convex HTTP Actions URL for Better Auth |
| `SITE_URL` / `NEXT_PUBLIC_SITE_URL` | Canonical app URL for auth and checkout redirects |
| `BETTER_AUTH_SECRET` | Better Auth secret |
| `DISPATCH_ADMIN_EMAILS` | Comma-separated staff emails allowed to claim admin access |
| `STRIPE_SECRET_KEY` | Stripe secret key for Checkout |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_WEBHOOK_SYNC_SECRET` | Shared secret used by the webhook route when syncing Convex |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | Sentry DSN for runtime error reporting |
| `SENTRY_AUTH_TOKEN` | Secret token for source-map uploads in CI |

Use `.env.example` as the non-secret template. Do not commit `.env.local` or the deploy key.

## Programmatic SEO routes

| Path | Pages | Notes |
|---|---|---|
| `/` | 1 | Home (Hero, Services, Fleet, Experience, Cities, Standards, Testimonial, App, CTA) |
| `/cities` | 1 | All-locations index with regional grouping |
| `/cities/[city]` | 28 | One per location in `src/data/cities.ts` |
| `/cities/[city]/[service]` | 140 | Location x service combo (e.g. `/cities/portland/airport-transfer`) |
| `/services` | 1 | All-services index |
| `/services/[service]` | 5 | One per service in `src/data/services.ts` |
| `/business` | 1 | Professional Limousine Driver for Business |
| `/admin/dispatch` | dynamic | Staff-only dispatch workflow |
| `/admin/rates` | dynamic | Staff rate profiles for distance, hourly, airport, stop, gratuity, tax, and peak pricing |
| `/admin/rides` | dynamic | Staff ride ledger and handoff workflow |
| `/auth/sign-in` | dynamic | Better Auth staff sign-in |
| `/booking/[reference]` | dynamic | Public booking status page |
| `/rides/[token]` | dynamic | Tokenized driver or partner ride handoff page |
| `/api/auth/[...all]` | dynamic | Better Auth proxy route |
| `/api/bookings` | dynamic | Booking submission API |
| `/api/health` | dynamic | Runtime health check |
| `/api/stripe/webhook` | dynamic | Stripe webhook sync route |
| `/sentry-test?throw=server-component` | dynamic | Noindex server-component Sentry test route |
| `/api/og` | dynamic | Edge-rendered Open Graph images, themed per page |
| `/sitemap.xml` | 1 | Auto-generated from data |
| `/robots.txt` | 1 | Auto-generated |

## Adding a location

1. Add an entry to `src/data/cities.ts`.
2. The location is automatically added to the sitemap, the locations index, and all location x service combos.

## Adding a service

1. Add an entry to `src/data/services.ts`.
2. The service is automatically added to the sitemap, the services index, and all city × service combos.

## Architecture notes

- All marketing pages are React Server Components. Interactive widgets (Nav, BookingCard, Reveal, auth, dispatch) are `"use client"`.
- Booking submissions persist to Convex through `api.bookings.create`, then staff manage quote, assignment, ride handoff links, notes, and payment links in `/admin/dispatch` or `/admin/rides`.
- Staff can manage rate profiles in `/admin/rates`. Dispatch uses those profiles to estimate quotes from vehicle type, distance, billable hours, airport fee, meet-and-greet, extra stops, gratuity, tax, and peak surcharge inputs.
- Rate profiles intentionally mirror the useful parts of legacy limo software rate management: vehicle-level distance/hourly rules, minimum fares, airport add-ons, and operator-controlled fee percentages. Account-specific matrices, zones, and live map distance lookup are the next deeper layers.
- The Reveal component uses IntersectionObserver to fade-in sections as they scroll into view.
- The "rise" CSS animation (in `globals.css`) handles the on-load hero stagger without JS.

## Verification

```bash
npm run lint
npm run doctor:react
npm run build
npm run smoke:prod
```

`npm run smoke:prod` checks the production health endpoint, robots/sitemap canonical host, and representative public pages without creating bookings.

## License

© Professional Limousine Driver. All rights reserved.
