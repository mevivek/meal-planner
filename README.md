# Graze — personalised vegetarian meal-planner engine

A mobile-first, installable web app that asks about you once, then **generates
a personalised vegetarian week** and regenerates fresh weeks on demand. No
backend — everything runs client-side and persists on your device.

The plan adapts to your diet and exclusions, allergens, cooking effort and
timing (including an early-dinner cutoff), your office/WFH/off schedule, your
goal and protein target, preferred cuisines, and **wellness focuses** (skin,
hair, energy, digestion, immunity, strength).

## How it works

1. **Onboarding** collects your preferences (see the wizard).
2. The **engine** (`js/engine.js`) filters the meal library to what fits your
   diet and each day's constraints, scores candidates by wellness focus,
   cuisine, protein need and variety, and assembles a 7-day plan — topping up
   protein with a no-cook booster when a day lands short.
3. You get a generated week, a grocery list aggregated from it, diet-aware
   swaps, a build-your-own matrix, branded **product nutrition** (Pantry), and
   techniques. **Regenerate** reshuffles; **Edit preferences** re-tunes.

See [`docs/ENGINE.md`](docs/ENGINE.md) for the full architecture, data model,
scoring and extensibility notes.

## Modules

| File | Responsibility |
|------|----------------|
| `js/data.js` | Meal library (richly tagged), wellness/cuisine config, build matrix, tips. |
| `js/products.js` | Branded product nutrition database (per-serving macros). |
| `js/engine.js` | Pure planner: target math, filtering, scoring, plan/grocery/swaps. |
| `js/onboarding.js` | Preference-collection wizard. |
| `js/app.js` | Orchestration, rendering, settings, persistence, service worker. |

## Tech

Plain HTML/CSS/JS, no framework or build step. Installable PWA with an offline
service worker. The engine is deterministic given a seed, so it is unit-tested
headlessly (see the engine + jsdom checks used during development).

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
