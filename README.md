# Pro Limo

Private chauffeur service for travelers and businesses — in 500+ cities, with flat rates, professional drivers, and a flawless arrival every time.

A Corvus Inc. service. Built with Next.js 16, React 19, Tailwind CSS v4.

## Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) (CSS-first config)
- **Type**: Cormorant Garamond (display) + Geist (sans) + Geist Mono
- **Images**: SVG illustrations + dynamic Open Graph via `next/og`
- **SEO**: JSON-LD structured data, sitemap, robots, programmatic city × service pages

## Getting started

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

Output is fully static for the marketing surface (~85 prerendered pages: home, cities index, 12 city pages, services index, 5 service pages, 60 city × service combos, business, plus sitemap/robots).

## Programmatic SEO routes

| Path | Pages | Notes |
|---|---|---|
| `/` | 1 | Home (Hero, Services, Fleet, Experience, Cities, Standards, Testimonial, App, CTA) |
| `/cities` | 1 | All-cities index with regional grouping |
| `/cities/[city]` | 12 | One per city in `src/data/cities.ts` |
| `/cities/[city]/[service]` | 60 | City × service combo (e.g. `/cities/london/airport-transfer`) |
| `/services` | 1 | All-services index |
| `/services/[service]` | 5 | One per service in `src/data/services.ts` |
| `/business` | 1 | Pro Limo for Business |
| `/api/og` | dynamic | Edge-rendered Open Graph images, themed per page |
| `/sitemap.xml` | 1 | Auto-generated from data |
| `/robots.txt` | 1 | Auto-generated |

## Adding a city

1. Add an entry to `src/data/cities.ts`.
2. The city is automatically added to the sitemap, the cities index, and all city × service combos.

## Adding a service

1. Add an entry to `src/data/services.ts`.
2. The service is automatically added to the sitemap, the services index, and all city × service combos.

## Architecture notes

- All marketing pages are React Server Components. Only interactive widgets (Nav, BookingCard, Reveal) are `"use client"`.
- The hero booking form is intentionally inert — the dispatch backend is out of scope for this repo.
- The Reveal component uses IntersectionObserver to fade-in sections as they scroll into view.
- The "rise" CSS animation (in `globals.css`) handles the on-load hero stagger without JS.

## License

© Corvus Inc. All rights reserved.
