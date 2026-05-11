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
- **Convex**: Production env wiring for `outstanding-crab-950`

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

- All marketing pages are React Server Components. Only interactive widgets (Nav, BookingCard, Reveal) are `"use client"`.
- The hero booking form is intentionally inert — the dispatch backend is out of scope for this repo.
- The Reveal component uses IntersectionObserver to fade-in sections as they scroll into view.
- The "rise" CSS animation (in `globals.css`) handles the on-load hero stagger without JS.

## License

© Professional Limousine Driver. All rights reserved.
