# UI Refresh 2026 — design exploration notes

> Decision-capture for the pro-limo UI refresh. Open `index.html` in this folder
> (the comparison board) to review all 9 variants side by side, then fill in the
> picks below. When directions are locked, this drives a separate implementation
> plan (mini-goal PRs, tracked in `docs/planning/goals.html`).

## What this is

Three variants per surface, bracketing one thesis: **keep the editorial-luxury
identity; borrow ASTC's interaction density, not its neutral aesthetic.**

| Variant | Stance |
|---|---|
| **A** | Editorial unchanged — conservative anchor, micro-polish only. |
| **B** | Editorial chrome + app density — the recommended bet. |
| **C** | App-mode product surfaces (bifurcation: marketing stays editorial). |

## How the mockups were made

The plan's original tool (`/design-shotgun`) generates AI **PNG** mockups via an
image-gen binary that needs an OpenAI key — none is configured on this machine, so
that path was blocked. Instead these are **hand-built HTML/CSS** reusing the live
design tokens from `src/app/globals.css`. Upside: they reflow for real, run at every
breakpoint, exercise actual hover/spring/sheet interactions, and double as a head
start on implementation. Files live in-repo (not `~/.gstack/`) so they're reviewable
and version-controlled.

## Files

```
docs/design/ui-refresh-2026/
  index.html          ← comparison board (start here)
  _shared.css         ← tokens ported from globals.css
  booking-flow/   variant-a.html  variant-b.html  variant-c.html
  dispatch-row/   variant-a.html  variant-b.html  variant-c.html
  marketing/      variant-a.html  variant-b.html  variant-c.html
  notes.md            ← this file
```

## Decision criteria

1. **Brand fidelity** — still pro-limo, or accidentally ASTC?
2. **Density vs. air** — dispatch wants density; marketing wants air; booking wants both.
3. **Mobile experience** — B's snap-point sheet is the biggest mobile bet; does it earn the complexity?
4. **Implementation cost** — A ~free, B medium, C expensive (replaces product-surface chrome).
5. **Cross-surface coherence** — if marketing and product diverge (C), does the brand still feel unified?

---

## Decisions  _(fill in after review)_

**Decision (2026-05-28): Variant B across all three surfaces.** Editorial chrome,
palette, and voice stay; ASTC's interaction density gets layered on top. One PR per
surface (salvage-sprint cadence); shared tokens/primitives land in the first PR.

### Booking flow — `BookingCard.tsx`
- **Picked variant:** **B — Editorial + app density**
- **Keep:** quick-time carousel, status-colored progress dots (replace plain numbers),
  two-line summary chips in the review/summary area, spring press feedback on CTAs.
- **Drop / change for now:** **snap-point bottom sheet is deferred** to a follow-up
  goal (it's the expensive/risky mobile bet — new gesture primitive + physics + a11y).
  Booking keeps its current mobile card stack until then.
- **Notes:** all additions sit inside the existing `Card` chrome; no chrome replacement.

### Dispatch row — `DispatchDashboard.tsx`
- **Picked variant:** **B — Editorial + app density**
- **Keep:** status-colored 3px left-accent bar, stat-box trio (Distance / Duration /
  Quote when present), icon-tinted info chips, denser collapsed preview line
  (`PDX → Pearl · 12.4 mi · $145`), spring press on action buttons.
- **Drop / change:** none. Row stays a `Card`; this is additive.
- **Notes:** stat-box trio only renders the values that exist (quote may be absent
  pre-quote; distance/duration absent until SM3 routes call lands).

### Marketing — `Hero/Services/Cities/Footer`
- **Picked variant:** **B — interaction polish**
- **Keep:** spring press on the Reserve CTA, status-colored availability chips on
  Service cards ("Available today" / "Limited evening slots"), card hover-lift +
  champagne underline accent (partly already present).
- **Drop / change:** copy for availability chips must be **real**, not invented —
  source from booking/service-area data or drop the chip rather than fake it.
- **Notes:** lightest-touch surface; mostly motion + small status affordances.

---

## Implementation sequencing (decided)

One PR per surface, in this order. **PR 1 carries the shared foundation.**

1. **Booking (PR 1, foundation):** add status-color tokens to `globals.css`; new
   primitives `src/components/booking/QuickTimeCarousel.tsx`, a `StatusDot`, and a
   spring-press button variant; wire the carousel + dots + chips into `BookingCard.tsx`.
2. **Dispatch (PR 2):** reuse the tokens + spring button; add the left-accent bar,
   stat-box trio, icon chips, and dense preview to the row in `DispatchDashboard.tsx`.
3. **Marketing (PR 3):** spring Reserve CTA, real availability chips on Services,
   hover-lift on Cities — `Hero.tsx`, `Services.tsx`, `Cities.tsx`.
4. **Snap-sheet (PR 4, follow-up / deferred):** `src/components/ui/snap-sheet.tsx`
   gesture primitive + mobile booking sheet. Separate goal once 1–3 land.

## Shipped (2026-05-28, branch `claude/eager-chandrasekhar-c2d4d3`)

- **PR 1 — booking** `ca94e80`: `press-tap` + status tokens in `globals.css`;
  `getStatusTone`/`statusToneColor` in `lib/status.ts`; status-colored progress dots,
  `QuickTimeCarousel` (Tonight / Tomorrow AM·PM / This weekend / Custom, fills
  date+time), two-line summary chips, spring CTAs in `BookingCard.tsx`. Verified live
  (carousel fills `2026-05-28` / `19:00`), dark + light themes.
- **PR 2 — dispatch** `7dc5c0f`: status-colored 3px left-accent bar, toned badge dot,
  stat-box trio (Distance/Duration/Quote, reusing existing formatting), dense collapsed
  preview line, `press-tap` on actions in `DispatchDashboard.tsx`. Verified via a
  throwaway dev page (deleted) since the real dashboard is staff-auth-gated — accent
  bars resolve to correct per-status colors.
- **PR 3 — marketing** `b303e63`: spring Reserve CTA (`Hero`), honest static service
  tags + hover-lift (`Services`), hover-lift (`Cities`). Verified live in dark theme;
  DOM confirms tag tone-dots (success green / info blue).
- **PR 4 — snap-sheet:** deferred to its own session (spawned as a follow-up task).

All three shipped PRs: clean `tsc --noEmit` + `eslint`, no console errors. Use
shadcn semantic tokens throughout so the dark editorial theme maps champagne
automatically. Not yet pushed / opened as GitHub PRs — local commits on the branch.
