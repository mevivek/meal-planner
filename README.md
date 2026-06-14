# Meal Planner

A mobile-first, installable **PWA** that collects your preferences once, then
**generates a personalised vegetarian week** and regenerates fresh weeks on demand.
It runs client-side — **no backend, no accounts** — and persists everything in
`localStorage`.

> The manifest display name has been "Graze"; the name is incidental and not a focus.
> This README is the repository's documentation.

> **Migration in progress (Phase 0 landed).** The app is being rebuilt as a
> **React + Vite + TypeScript** PWA — see [`docs/UI-REVAMP-PLAN.md`](docs/UI-REVAMP-PLAN.md).
> The new app lives at the repository root (`src/`); the original zero-build
> vanilla-JS app is **preserved as a reference under [`legacy/`](legacy/)** and still
> runs standalone. The planner **engine, meal data, and product data were ported
> unchanged** (globals → ES module exports). This README documents the current state
> and is updated as each phase lands.

Live: <https://mevivek.dev/meal-planner/>

## Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Module reference](#module-reference)
- [Data model](#data-model)
- [How the planner works](#how-the-planner-works)
- [State & persistence](#state--persistence)
- [Data source & Claude-hosted content](#data-source--claude-hosted-content)
- [Develop & build](#develop--build)
- [Deployment](#deployment)
- [PWA & offline](#pwa--offline)
- [Roadmap](#roadmap)
- [Further docs](#further-docs)

## Overview

The user answers a short onboarding wizard (diet, exclusions, allergens, cooking
effort and timing, a per-day office/WFH/off schedule, goal + protein target, cuisines,
and optional wellness focuses). A pure planner **engine** then filters a tagged meal
library to what fits, scores the candidates, and assembles a 7-day plan — topping up
protein with a no-cook booster when a day lands short. From that plan the app derives a
grocery list, per-slot swaps, and a build-your-own matrix. A branded product-nutrition
database (the Pantry) lets the user pick a preferred brand per ingredient.

The engine is **deterministic given a seed**, so "Regenerate" simply changes the seed,
and the planner can be unit-tested headlessly.

## Architecture

- **New app (root):** React 18 + Vite + TypeScript. ES modules + a build step (Vite),
  replacing the legacy script-tag/globals approach.
- **DOM-free core, ported unchanged:** `src/lib/engine.ts` (pure planner, deterministic
  given a seed), `src/lib/data.ts` (meal library + config), `src/lib/products.ts`
  (product DB). These are the legacy modules with `export`s added — logic is identical,
  which preserves the engine's determinism/test contract.
- **Data-source seam:** `src/lib/mealSource.ts` abstracts where meals come from
  (static today; Claude-generated later — see
  [Data source & Claude-hosted content](#data-source--claude-hosted-content)).
- **Persistence:** `localStorage` only (`src/lib/storage.ts`); nothing leaves the
  device. The legacy keys are reused so existing users keep their data.
- **Legacy app (`legacy/`):** the original zero-build PWA (HTML/CSS/JS + hand-rolled
  service worker). Kept as a working reference during the migration.

## Repository layout

```
.
├── index.html                # Vite entry (new app)
├── package.json              # scripts + deps
├── vite.config.ts            # base: '/meal-planner/'
├── tsconfig*.json
├── public/
│   ├── icons/icon.svg
│   └── manifest.webmanifest
├── src/
│   ├── main.tsx              # React entry
│   ├── App.tsx               # loads prefs → meals → engine → renders Today
│   ├── styles.css            # neutral light/dark baseline (full design system: Phase 1)
│   ├── lib/
│   │   ├── engine.ts         # PORTED: pure planner (targets, filter, score, plan…)
│   │   ├── data.ts           # PORTED: meal library + config
│   │   ├── products.ts       # PORTED: product-nutrition database
│   │   ├── types.ts          # shared TS types (Meal, Prefs, Plan, …)
│   │   ├── mealSource.ts     # data-source seam (static now; Claude-hosted later)
│   │   └── storage.ts        # localStorage keys + safe get/set
│   ├── state/
│   │   └── defaultPrefs.ts   # default prefs (until the React onboarding is ported)
│   └── screens/
│       └── Today.tsx         # minimal Today screen (full design: later phases)
├── .github/workflows/
│   └── deploy.yml            # build + deploy to GitHub Pages
├── docs/
│   ├── ENGINE.md             # engine design: schema, pipeline, scoring
│   └── UI-REVAMP-PLAN.md     # the revamp spec + phased plan
└── legacy/                   # preserved original vanilla-JS PWA (reference)
    ├── index.html  css/  js/  sw.js  manifest.webmanifest  icon.svg
```

## Module reference

### `src/lib/data.ts` — meal library & config (pure data, ported)
The single source of meals and selection config. Each meal carries the tags the engine
needs (`contains` is the source of truth for diet/allergen filtering), so new cuisines
or diets are added **purely as data**. Also defines wellness focuses, cuisines, day
constants, cook-effort ranking, grocery category labels/order, the build-your-own
matrix (`BUILD`), and techniques (`TIPS`).

### `src/lib/products.ts` — product-nutrition database (pure data, ported)
Per-serving macros for packaged staples. Rows are either `source:"label"` (transcribed
from a real nutrition panel) or `source:"generic"` (typical reference values). The
`ingredient` field links a product to a recipe ingredient, powering the brand picker.

### `src/lib/engine.ts` — the planner (pure, no DOM, ported)
Public surface (deterministic given `prefs.seed`):

| Function | Purpose |
|---|---|
| `Engine.generatePlan(prefs, MEALS)` | Build the 7-day plan + daily protein target |
| `Engine.alternatesFor(prefs, dayKey, slot, currentId, MEALS)` | Swap candidates for a day/slot |
| `Engine.buildGrocery(plan)` | Aggregate + group the week's grocery lines |
| `Engine.buildSwaps(prefs, MEALS)` | Per-slot alternates for the swap views |
| `Engine.buildMatrix(prefs)` | Columns/options for the build-your-own tool |

### `src/lib/types.ts`, `src/lib/storage.ts`, `src/lib/mealSource.ts`, `src/state/defaultPrefs.ts`
Shared types; centralised `localStorage` (keys preserved from legacy); the data-source
seam; and a default preferences object used to render a plan before the React
onboarding wizard is ported (Phase 3).

### `src/App.tsx`, `src/screens/Today.tsx`
`App` loads prefs (or defaults), pulls the catalogue through `mealSource`, runs the
engine, and renders the current day. `Today` renders that day's meals + a protein
summary. This is the Phase 0 baseline; the full Today design (protein ring, meal
logging, swap/exclude) lands in later phases.

### `legacy/`
The original app: `legacy/js/{data,products,engine,onboarding,app}.js`, `legacy/css/
styles.css`, `legacy/sw.js` (offline cache), `legacy/index.html`. Documented in detail
in [`docs/ENGINE.md`](docs/ENGINE.md) and the git history.

## Data model

Full schema, the meal/product shapes, scoring, and the wellness mapping live in
[`docs/ENGINE.md`](docs/ENGINE.md); TypeScript types are in `src/lib/types.ts`. In brief:

- **Preferences** (`localStorage: graze.prefs.v1`) — `profile`, `diet`, `cooking`,
  `schedule.dayTypes`, `goals`, `wellness`, and a `seed`.
- **Meal** — `{ id, slot, name, icon, protein, prep, cook, pack, cuisine, contains[],
  wellness[], detail, items[{n,c}], recipe?[] }`. `contains` drives diet/allergen
  filtering.
- **Product** — `{ id, brand, name, category, serving, ingredient, per:{kcal, protein,
  carbs, sugar, fat, fiber, calcium?}, tags[], source, note? }`.

## How the planner works

1. **Protein target** — from body-weight × goal factor (clamped), else a goal default;
   user can override.
2. **Per-day context** — derived from `schedule.dayTypes` + `cooking` (cook allowed
   only on chosen cook-days; office days require packable lunch + dinner).
3. **Filter** — drop meals that violate diet/egg/dairy, dislikes, allergens, the day's
   cook level/prep, cuisine selection, or the pack requirement.
4. **Score** — wellness matches, preferred cuisine, protein density toward the day's
   remaining need, a variety penalty for repeats, plus seeded jitter.
5. **Select** — best unused candidate per slot/day; no repeats within a day; minimise
   weekly repeats.
6. **Protein top-up** — add one no-cook booster if a day lands under target.
7. **Aggregate** — dedupe grocery lines across the week (grouped by category); build
   the per-slot swap lists.

See [`docs/ENGINE.md`](docs/ENGINE.md) for scoring detail and extensibility notes.

## State & persistence

All state is local to the device; there is no server.

| Key | Contents |
|---|---|
| `graze.prefs.v1` | Preferences + `seed`, plus `overrides`, `excludedMeals`, `excludedItems` |
| `graze.grocery.v2` | Grocery check-off state (per item) |
| `graze.brands.v1` | Chosen product/brand per ingredient token |
| `graze.log.v1` | *(new, reserved)* per-meal "eaten" state — drives the Today protein ring (Phase 4) |
| `graze.theme.v1` | *(new, reserved)* appearance: light / dark / system |

## Data source & Claude-hosted content

`src/lib/mealSource.ts` is a `MealSource` seam: today it returns the static `MEALS`
library; the engine and screens only ever see the interface. The catalogue may later be
**generated/served via Claude** without touching the engine.

Because this is a **keyless client-side PWA, the Anthropic API key can never ship in the
browser**. The two supported shapes (see [`docs/UI-REVAMP-PLAN.md` §8a](docs/UI-REVAMP-PLAN.md)):

- **Build-time generation (preferred):** a Node script (key in the environment) calls
  Claude to generate the catalogue as a **static JSON asset**; the app ships it. Keeps
  the offline-first, no-backend model.
- **Thin serverless proxy:** only if live/on-demand generation is needed — a minimal
  function holds the key; the PWA fetches it.

The implementation uses `@anthropic-ai/sdk` with `claude-opus-4-8` and **structured
output** (`messages.parse()` + a Zod schema mirroring `Meal`), keeping generated meals
in the exact shape the engine consumes.

## Develop & build

```bash
npm install
npm run dev        # Vite dev server
npm run build      # production build → dist/
npm run preview    # serve the production build locally
npm run typecheck  # tsc --noEmit (ported modules are loose for now)
```

> The build uses Vite/esbuild and does not block on TypeScript errors; the ported
> engine/data modules are loosely typed during the migration and tightened in a later
> phase.

To run the **legacy** vanilla app instead (no build step):

```bash
cd legacy && python3 -m http.server 8000   # open http://localhost:8000
```

## Deployment

GitHub Pages, served at the `/meal-planner/` subpath (`vite.config.ts` sets
`base: '/meal-planner/'`). `.github/workflows/deploy.yml` builds on push to `main` and
publishes the `dist/` artifact — this requires **Settings → Pages → Source = GitHub
Actions**. The custom domain `mevivek.dev` is configured on the user-site repo, so this
repo only needs the base path. Nothing deploys until the new pipeline lands on `main`,
so the live site is unaffected during the migration.

## PWA & offline

A web app manifest ships in `public/`. Offline support for the new app (precaching via
`vite-plugin-pwa`/Workbox) returns in Phase 5; the legacy app's hand-rolled service
worker remains in `legacy/sw.js` for reference.

## Roadmap

The UI/UX revamp is specced in **[`docs/UI-REVAMP-PLAN.md`](docs/UI-REVAMP-PLAN.md)**:
replace the single-scroll layout with true screen-switching navigation, lead with a
**"Today"** home, adopt a neutral modern look (incl. dark mode), add per-meal logging,
and (optionally) move recipes/items to a Claude-hosted source. The engine and saved
data are preserved across the migration.

## Further docs

- [`docs/ENGINE.md`](docs/ENGINE.md) — engine design: preferences schema, meal/product
  shapes, the selection pipeline, wellness mapping, extensibility, determinism/testing.
- [`docs/UI-REVAMP-PLAN.md`](docs/UI-REVAMP-PLAN.md) — the revamp spec (architecture,
  IA, screen-by-screen, design system, phased plan, deployment, Claude-hosted content).
```
