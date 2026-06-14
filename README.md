# Meal Planner

A mobile-first, installable **PWA** that collects your preferences once, then
**generates a personalised vegetarian week** and regenerates fresh weeks on demand.
It runs entirely client-side — **no backend, no accounts, no build step** — and
persists everything in `localStorage`.

> The manifest display name is "Graze"; the name is incidental and not a focus. This
> README is the repository's documentation.

> **Revamp in progress.** A UI/UX overhaul is planned — migration to **React + Vite**,
> a **"Today"** home screen, and a neutral, app-style redesign. See
> [`docs/UI-REVAMP-PLAN.md`](docs/UI-REVAMP-PLAN.md). **The documentation below
> describes the current implementation** (vanilla HTML/CSS/JS) and is updated as each
> phase of the revamp lands.

Live: <https://mevivek.dev/meal-planner/>

## Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Repository layout](#repository-layout)
- [Module reference](#module-reference)
- [Data model](#data-model)
- [How the planner works](#how-the-planner-works)
- [State & persistence](#state--persistence)
- [PWA & offline](#pwa--offline)
- [Run locally](#run-locally)
- [Deployment](#deployment)
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

- **Static site, no framework, no build step.** `index.html` loads five scripts in
  order; they communicate through a small set of globals (no modules/bundler).
- **Layered, with a DOM-free core:**
  - *pure data* — `js/data.js`, `js/products.js`
  - *pure logic* — `js/engine.js` (no DOM; deterministic given a seed)
  - *UI / orchestration* — `js/onboarding.js`, `js/app.js`
- **Persistence** is `localStorage` only; nothing leaves the device.
- **Offline** via a hand-rolled service worker (`sw.js`) that precaches the app shell.

Script load order and the globals each file publishes:

| Order | File | Publishes (globals) |
|------:|------|---------------------|
| 1 | `js/data.js` | `MEALS`, `WELLNESS`, `CUISINES`, `DAY_KEYS`, `DAY_FULL`, `DAY_LABEL`, `COOK_RANK`, `CAT_LABEL`, `CAT_ORDER` |
| 2 | `js/products.js` | `PRODUCTS`, `PRODUCT_CATS` |
| 3 | `js/engine.js` | `Engine` |
| 4 | `js/onboarding.js` | `Onboarding` |
| 5 | `js/app.js` | — (IIFE; wires everything, registers the service worker) |

## Repository layout

```
.
├── index.html                # markup + script tags (the five modules below)
├── css/
│   └── styles.css            # all styles (design tokens + components)
├── js/
│   ├── data.js               # meal library + config (pure data)
│   ├── products.js           # branded product-nutrition database (pure data)
│   ├── engine.js             # pure planner: targets, filter, score, plan/grocery/swaps
│   ├── onboarding.js         # preference-collection wizard
│   └── app.js                # orchestration, rendering, persistence, service worker
├── sw.js                     # offline-first service worker (app-shell cache)
├── manifest.webmanifest      # PWA manifest
├── icons/icon.svg            # app icon (maskable)
├── .nojekyll                 # disable Jekyll on GitHub Pages
└── docs/
    ├── ENGINE.md             # engine design: schema, pipeline, scoring, extensibility
    └── UI-REVAMP-PLAN.md     # the planned React/Vite + redesign spec
```

## Module reference

### `js/data.js` — meal library & config (pure data)
The single source of meals and selection config. Each meal carries the tags the engine
needs (`contains` is the source of truth for diet/allergen filtering), so new cuisines
or diets are added **purely as data** — the engine needs no changes. Also defines
wellness focuses, cuisines, day-key/label constants, cook-effort ranking, and grocery
category labels/order.

### `js/products.js` — product-nutrition database (pure data)
Per-serving macros for packaged staples. Rows are either `source:"label"` (transcribed
from a real nutrition panel) or `source:"generic"` (typical reference values). The
`ingredient` field is a canonical token (e.g. `"paneer"`) that links a product to a
recipe ingredient, which powers the **brand picker** and the grocery-line brand badge.

### `js/engine.js` — the planner (pure, no DOM)
Public surface (all deterministic given `prefs.seed`):

| Function | Purpose |
|---|---|
| `Engine.generatePlan(prefs, MEALS)` | Build the 7-day plan + daily protein target |
| `Engine.alternatesFor(prefs, dayKey, slot, currentId, MEALS)` | Swap candidates that fit a given day/slot |
| `Engine.buildGrocery(plan)` | Aggregate + group the week's grocery lines |
| `Engine.buildSwaps(prefs, MEALS)` | Per-slot alternates for the swap views |
| `Engine.buildMatrix(prefs)` | Columns/options for the build-your-own tool |

### `js/onboarding.js` — preference wizard
`Onboarding.run({ container, prefs, onComplete })` renders a field-driven, multi-step
wizard into `container`, prefilled from existing `prefs` when editing, and calls
`onComplete(prefs)` with a fully-formed preferences object. Steps are declarative, so
adding a question is a data edit.

### `js/app.js` — orchestration & rendering
An IIFE that: loads prefs (or shows onboarding) → runs the engine → renders every
section; handles regenerate, the per-day type toggle, grocery check-off, the inline
per-meal **swap sheet**, meal **exclusion** and ingredient **avoidance**, the **brand
picker**, the pantry search, the bottom-nav scroll-spy, and **service-worker
registration**.

### `sw.js` — service worker
Offline-first: on install, precaches the app shell (`ASSETS`); on fetch, serves cache
first and updates it from the network in the background. **Bump the `CACHE` version
string when shipping changed assets** so clients pick them up.

## Data model

Full schema, the meal/product shapes, scoring, and the wellness mapping live in
[`docs/ENGINE.md`](docs/ENGINE.md). In brief:

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

All state is local to the device (`localStorage`); there is no server.

| Key | Contents |
|---|---|
| `graze.prefs.v1` | Preferences + `seed`, plus `overrides`, `excludedMeals`, `excludedItems` |
| `graze.grocery.v2` | Grocery check-off state (per item) |
| `graze.brands.v1` | Chosen product/brand per ingredient token |

## PWA & offline

Installable via `manifest.webmanifest` (`display: standalone`, portrait, maskable SVG
icon). `sw.js` precaches the shell on install and serves cache-first with background
revalidation, so the app works offline after the first load. Update the `CACHE` string
in `sw.js` whenever cached assets change.

## Run locally

No build step — serve the folder over HTTP (service workers and `fetch` need a real
origin, not `file://`):

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment

Hosted on **GitHub Pages**, served directly from the repository root at the
`/meal-planner/` subpath (the live custom domain is configured on the user-site repo).
`.nojekyll` disables Jekyll so files are served as-is. There is **no build today**; the
planned revamp introduces a Vite build and a Pages **Actions** workflow — see
[`docs/UI-REVAMP-PLAN.md` §8](docs/UI-REVAMP-PLAN.md).

## Roadmap

A UI/UX revamp is specced in **[`docs/UI-REVAMP-PLAN.md`](docs/UI-REVAMP-PLAN.md)**:
migrate to React + Vite, replace the single-scroll layout with true screen-switching
navigation, lead with a **"Today"** home, adopt a neutral modern look (incl. dark
mode), and add per-meal logging. The engine and saved data are preserved across the
migration.

## Further docs

- [`docs/ENGINE.md`](docs/ENGINE.md) — engine design: preferences schema, meal/product
  shapes, the selection pipeline, wellness mapping, extensibility, determinism/testing.
- [`docs/UI-REVAMP-PLAN.md`](docs/UI-REVAMP-PLAN.md) — the revamp spec (architecture,
  IA, screen-by-screen, design system, phased plan, deployment).
```
