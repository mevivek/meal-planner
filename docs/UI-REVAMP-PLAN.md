# Meal Planner — UI/UX Revamp Plan

> Status: **in progress.** Phase 0 (scaffold + deploy pipeline) has landed on the
> branch; the rest is the spec. Implementation is phased (see §9). The §11 questions
> are resolved.

## 1. Goal

Turn the app from a **single-scroll page that reads like a marketing site** into a
**multi-screen app** that opens to *what you eat now* and folds features into the
task flow instead of presenting them as shelves.

Locked decisions (from review):

| Decision | Choice |
|---|---|
| Foundation | **React + Vite** (build step; component model) |
| Home screen | **"Today"** — today's meals + the next action |
| Visual scope | **Fresh, neutral, modern-app** look (move off the warm/editorial style) |

**Branding is explicitly out of scope.** The name "Graze" is not a focus and is not
advertised — treat this as a *tool*, not a brand. No logo/name/identity work; the
visual pass is about app ergonomics, not brand expression.

Non-negotiables we keep:

- **Offline-first PWA, no backend, no accounts.** Everything stays client-side.
- **The planner engine is the crown jewel.** `engine.js` is pure and deterministic
  given a seed; we *port it unchanged*, only swapping globals for ES module exports.
- **Existing users keep their data.** We reuse the current `localStorage` keys.
- **`README.md` stays current** as the repo's detailed documentation (not a pitch),
  updated as each phase lands; this file tracks the plan.

## 2. Why it currently reads as a website (diagnosis)

The logic is solid; the **shell** is built like a one-page landing site.

1. **One long scroll.** All five sections live stacked in a single `<main>`
   (`index.html:39-115`). The bottom nav doesn't switch screens — it *smooth-scrolls*
   the page and uses an `IntersectionObserver` scroll-spy to light up tabs
   (`app.js:402-416`). You can scroll out of "Plan" straight into "Build". That's
   anchor-link behavior, not app navigation.
2. **Editorial headers + marketing taglines.** Each section opens with a giant
   Fraunces serif display heading (`clamp(28px,8vw,36px)`, `styles.css:91`) and a
   subtitle written like ad copy — *"Tap one from each row — endless combos within
   your diet."* (`index.html:55-81`).
3. **Alternating tinted section backgrounds** (`.section.alt`, `styles.css:89`) — a
   hallmark of scrolling landing pages.
4. **Features as shelves, not actions.** "Build your own", "Swap library", and
   "Pantry & more" answer *"what can this product do?"* instead of *"what do I do
   next?"* (Swapping already exists inline on meal cards, making the standalone
   "Swap library" pure presentation.)
5. **Leftover landing DNA in the CSS** — `.hero`, `.eyebrow`, `.hero-title`,
   `.hero-stats`, `.stat` (`styles.css:95-121`) are dead styles with no markup.

The fix is an **app shell**: real screen-switching navigation (one view at a time,
with transitions and per-screen top bars), a task-focused home, and features woven
into flows.

## 3. Target architecture

```
repo root
  index.html                 # minimal Vite entry
  package.json
  vite.config.ts             # base: '/meal-planner/'
  tsconfig.json
  public/
    icons/  manifest.webmanifest  robots/  (CNAME only if this repo owns the domain)
  src/
    main.tsx
    App.tsx                  # shell: tab bar + active screen + global overlays
    routes.ts               # screen registry / hash sync
    theme/
      tokens.css            # design tokens (light + dark)
      ThemeProvider.tsx
    lib/
      engine.ts             # PORTED from js/engine.js (logic identical)
      data.ts               # PORTED from js/data.js
      products.ts           # PORTED from js/products.js
      storage.ts            # localStorage keys + safe get/set
      time.ts               # "what's the next meal" helpers
    state/
      usePrefs.ts  usePlan.ts  useGrocery.ts  useBrands.ts  useLog.ts  useTheme.ts
    components/             # design-system primitives (see §6)
    screens/
      Today/  Week/  Grocery/  More/  Onboarding/
  .github/workflows/deploy.yml
  *.test.ts                 # Vitest
```

### Stack choices

- **React 18 + Vite + TypeScript.** TS is worth it here: the prefs/meal/plan shapes
  are non-trivial and a typed `engine.ts` prevents regressions during the port.
  (If you'd rather keep it plain JS, the plan is unchanged minus the `.ts` types.)
- **Navigation:** state-driven screens (`activeTab`) with **framer-motion**
  `AnimatePresence` transitions, wired to **hash history** (`#/today`, `#/week`, …)
  so the Android/PWA hardware back button and deep links work. Hash avoids GitHub
  Pages SPA-refresh 404s. (Heavier alternative: React Router — not needed for ~5
  screens.)
- **Icons:** `lucide-react` (tree-shaken) for one consistent line-icon set —
  replaces the mix of emoji + inline SVGs.
- **PWA:** `vite-plugin-pwa` (Workbox) replaces the hand-rolled `sw.js`; it precaches
  hashed build assets automatically and keeps offline working.
- **Bundle budget:** React+ReactDOM (~45 kB gz) + framer-motion (~50 kB) + lucide
  (tree-shaken). Acceptable for a PWA; **Preact/compat** is a drop-in option later if
  we want to shave ~40 kB.

### What we delete

- `js/app.js`, `js/onboarding.js` (logic re-homed into React).
- The hand-rolled `sw.js`, the dead hero/landing CSS, the editorial section chrome.
- Google Fonts (Fraunces/Inter via CDN) → bundle a single sans (system stack or a
  self-hosted variable font) for speed + true offline.

## 4. Information architecture

From **5 scrolly sections** → **4 task screens + folded tools**.

| Now (sections) | Becomes |
|---|---|
| Plan (whole week) | **Today** (home) + **Week** (overview/detail) |
| Build your own | A tool: **"+" action** on Today/Week, or under More |
| Grocery list | **Grocery** screen (kept, restyled) |
| Swap library | **Removed as a tab** — swapping is already inline per meal |
| More (pantry/tips/manage) | **More/Profile** screen (preferences, pantry, techniques, build, manage) |

**Bottom tab bar (true screen switching, 4 tabs + center action):**

```
[ Today ]   [ Week ]   ( + )   [ Grocery ]   [ More ]
```

- The center **(+)** opens "Build a plate" (the build-your-own matrix) as a sheet —
  it's the one playful, creative tool, given a first-class action without eating a tab.
- **Swap library** disappears: it duplicated the inline per-meal swap sheet
  (`app.js:105-127`). Removing it is the single biggest "stop presenting features" win.
- **Techniques (tips)** and **Pantry (product nutrition)** move into **More**, and
  become *contextual* where relevant (a recipe links to its technique; the brand
  picker links to the product's nutrition).

## 5. Screen-by-screen spec

### 5.1 Today (the new heart)

The answer to "what do I eat right now."

- **Top bar:** date + greeting ("Saturday · Jun 14"), an inline editable
  **day-type chip** (Office / WFH / Off) that re-plans the day, and a regenerate icon.
- **Protein progress ring** (new hero element): a circular gauge of
  **eaten / target**, filling as you mark meals done. Replaces the static number in
  the current targets banner (`app.js:165-175`).
- **Meal timeline:** Breakfast → Lunch → Early dinner in time order, with a
  **"next up"** highlight chosen from the clock (`lib/time.ts`). Each meal card:
  - tap to expand the recipe (steps),
  - **Mark eaten** (new — drives the ring),
  - **Swap** (reuses the existing alternates sheet),
  - **Exclude** / **avoid ingredient**.
- **Booster row** when a day lands short on protein (engine already adds this).
- **Edge states:** late evening → a "Tomorrow" preview; a cook-day badge when the day
  includes a cooked dish.

> **New feature — meal logging.** Today is interactive instead of a static plan: a
> per-meal **eaten** toggle (new key `graze.log.v1`, keyed by `date:slot`) powers the
> ring and a lightweight streak. This is the main UX addition that makes it feel like
> an app you *use*, not a page you *read*. (Confirm in §11.)

### 5.2 Week

- **Overview:** 7 compact day rows — day name, day-type dot, total protein, the three
  meal names. Tap a row → **day detail** (the Today layout for that day).
- Horizontal day selector kept, but as app navigation with slide transitions (not the
  current scroll-snap tab strip).
- **Regenerate** in the top bar with a subtle reshuffle animation; it still drops
  manual overrides for a truly fresh week (`app.js:69-75`).

### 5.3 Grocery

- Keep the aggregation + check-off + on-device persistence (`app.js:306-335`), restyle
  into clean list rows with section groups, a progress bar, brand badges, and a "got
  everything 🎉" completion state. Section collapse for long lists.

### 5.4 More / Profile

- **Preferences** → relaunch the onboarding wizard (now a routed full-screen flow).
- **Pantry** → searchable product-nutrition list (port `renderPantry`, `app.js:352`).
- **Techniques** → tips cards (port `renderTips`).
- **Build a plate** → also reachable here (same component as the (+) sheet).
- **Manage** → regenerate, start over, excluded meals, avoid-ingredients
  (port `renderExclusions`, `app.js:129`).
- **Appearance** → light / dark / system toggle (new).
- **About** → offline note, version.

### 5.5 Onboarding

Port the existing field-driven wizard (`onboarding.js`) to React **keeping the exact
prefs schema** (so the engine and saved data are untouched). Improvements: full-screen
steps with slide transitions, a sticky progress bar + footer, 44px tap targets, inline
validation. It already does the right things — this is mostly restyle + motion.

## 6. Design system (fresh / neutral / modern-app)

Move off the warm paper + serif identity toward a clean, neutral product look.

### Tokens (`theme/tokens.css`, light + dark)

- **Surfaces:** near-white in light mode, true-dark in dark mode; cards via subtle
  borders + soft shadows (not tinted backgrounds).
- **Text:** a neutral gray ramp (ink / muted / faint) — drop the warm `--ink`/`--paper`.
- **Accent:** a single functional accent (a calm green reads well for food and holds
  up in light/dark) plus one semantic set (success/warn/danger). Retire the three-way
  clay + amber + green editorial combo. This is ergonomics, not branding.
- **Dark mode:** new. `prefers-color-scheme` default + manual override (very app-like;
  the app is currently `color-scheme: light` only).
- **Radii / spacing:** consistent 4/8 px scale; tighter than today's 32 px section
  padding so it reads as a tool, not an article.
- **Type:** **one modern sans** (system stack or a self-hosted variable font) for
  everything; hierarchy via size/weight, not a serif. Drops the Fraunces CDN
  dependency (faster, fully offline).

### Component primitives (`src/components/`)

`AppShell` · `TabBar` · `TopBar` · `Card` · `ListRow` · `Button`
(primary/secondary/ghost/danger) · `Chip`/`Tag` · `Segmented` · `Sheet` (slide-up,
ports the existing swap sheet) · `Modal` · `ProgressRing` · `ProgressBar` ·
`EmptyState` · `Toast`/`Snackbar` · `Icon` (lucide wrapper).

### Motion & native feel

- Screen transitions (slide/fade via `AnimatePresence`); sheet slide-up (kept);
  press-scale (kept); ring fill + check animations; list stagger (kept, `@keyframes
  rise`).
- **Respect `prefers-reduced-motion`** (already handled — preserve, `styles.css:529`).
- Safe-area insets (kept), `100dvh`, no tap-highlight, 44 px targets, theme-color meta
  synced to dark mode, and **keep the solid (non-blurred) fixed nav** — the iOS-drift
  fix is intentional (`styles.css:329-334`); don't reintroduce `backdrop-filter` there.

## 7. State & data

- **Reuse keys** so current users migrate seamlessly:
  `graze.prefs.v1`, `graze.grocery.v2`, `graze.brands.v1`.
- **New:** `graze.log.v1` (eaten state), `graze.theme.v1` (appearance).
- Hooks wrap the engine: `usePlan` memoizes `Engine.generatePlan` and recomputes on the
  same triggers as today — prefs, overrides, day-type, exclusions, avoided items
  (`app.js:63-103`). Seed-based determinism is preserved.
- `storage.ts` centralizes safe JSON get/set (today's `try/catch` pattern).

## 8. Deployment (this is the real change)

GitHub Pages currently serves the static repo directly. With Vite there's a build:

- `vite.config.ts` → `base: '/meal-planner/'` (matches the current subpath).
- **`.github/workflows/deploy.yml`** builds on push to `main` and publishes via the
  **Pages Actions artifact** (set Pages "Source = GitHub Actions").
- **Hash routing** means no SPA 404 on refresh (otherwise we'd add a `404.html`
  fallback).
- **Custom domain:** `mevivek.dev/meal-planner/` looks like a *project page* under the
  user site, so the `CNAME` lives on the user-site repo and this repo only needs the
  base path — **to verify** (§11). If this repo does own the domain, add `public/CNAME`.
- The live site keeps working through the migration: nothing deploys until the new
  pipeline lands on `main`.

## 8a. Claude-hosted recipes/items (future data source)

The meal/recipe catalogue may later be **generated/served via Claude** instead of the
static `data.ts` library. The app is built for this now via a seam — `src/lib/
mealSource.ts` exposes a `MealSource` interface; today's implementation returns the
static `MEALS`, and the engine/screens only ever see `MealSource`. Swapping the source
touches nothing downstream.

**Hard constraint — this is a keyless client-side PWA.** The Anthropic API key must
**never** ship in the browser bundle. That rules out calling the API from the app.
Two viable shapes:

1. **Build-time generation (recommended, preserves the no-backend model).** A Node
   script (run locally / in CI, with the key in the environment) calls Claude to
   generate or expand the catalogue, writes it as a **static JSON asset**, and the app
   ships/fetches that. Fully offline-first; zero runtime key exposure; deterministic
   builds. The `MealSource` reads the generated JSON.
2. **Thin serverless proxy (only if runtime/on-demand generation is needed).** A
   minimal function (Cloudflare Worker / Vercel / Netlify) holds the key and calls
   Claude; the PWA `fetch`es it. This adds a backend surface — use only if users need
   to generate recipes live (e.g. "make me a recipe for X now").

**Implementation pattern (TypeScript).** Use the official **`@anthropic-ai/sdk`** with
**`claude-opus-4-8`** and **structured output** so recipes come back as schema-valid
JSON: `client.messages.parse()` with a Zod schema (via `zodOutputFormat`) that mirrors
the `Meal` shape in `src/lib/types.ts` (`id, slot, name, protein, prep, cook, pack,
cuisine, contains[], wellness[], detail, items[], recipe[]`). Notes:

- Structured-output JSON Schema doesn't enforce numeric/length bounds — **validate
  ranges (protein/prep, allowed enums) in the generation script**, not via the schema.
- For bulk catalogue generation, the **Batch API** runs at 50% cost.
- Keep generated meals in the **same shape** the engine already consumes, so the engine
  and its determinism contract are unaffected — Claude becomes a *content* source, not
  part of the runtime planner.

## 9. Phased implementation

Each phase is independently reviewable; the live site is untouched until merge.

- **Phase 0 — Scaffold & prove the pipeline. ✅ DONE (on branch).** Vite + React + TS
  scaffolded; `engine/data/products` ported to ES modules (`src/lib/*.ts`); the legacy
  vanilla app preserved under `legacy/`; a `MealSource` seam added (§8a); a minimal
  **Today** screen renders a live plan from the real engine; build verified (54 kB gz)
  and the engine smoke-tested headlessly (deterministic per seed). Pages Action added
  (`.github/workflows/deploy.yml`) — deploys on merge to `main` (needs Settings → Pages
  → Source = GitHub Actions). TypeScript is loose on the ported modules for now
  (type-tightened in Phase 5; `npm run build` uses esbuild and does not block on types).
- **Phase 1 — App shell & design system. ✅ DONE (on branch).** Design tokens
  (light/dark + a Light/Dark/System toggle, `graze.theme.v1`); a **bottom tab bar**
  with hash-routed screen switching (`#/today`, `#/week`, `#/grocery`, `#/more`) and a
  per-navigation entrance animation (reduced-motion respected); per-screen **top bars**;
  shared app state (`AppContext` — prefs, plan, regenerate); and real **Today / Week /
  Grocery / More** screens wired to the engine (Week accordion, Grocery check-off with
  progress, More appearance/regenerate/reset). No new deps; ~57 kB gz. (Inline SVG icon
  set for now; `framer-motion`/`lucide` can be added if richer motion/icons are wanted.)
- **Phase 2 — Core screens + interactions. 🟡 MOSTLY DONE.** Today/Week/Grocery/More
  built (Phase 1); per-meal **Swap** (alternates bottom sheet → override + re-plan) and
  **Exclude**, plus an **avoid-ingredients** manager in More (excluded-meal chips +
  searchable ingredient toggle) are wired to the engine. **Per-day day-type toggle**
  (Office/WFH/Off on Today + Week → re-plans) is in, and **Pantry** (searchable product
  nutrition) + **Quick techniques** open as sheets from More → Tools. *Remaining:* the
  brand picker.
- **Phase 3 — Onboarding. ✅ DONE.** Full-screen multi-step wizard ported to React with
  the **unchanged prefs schema** (same `buildPrefs` mapping) — about you, diet, allergens,
  cooking, per-day schedule, goal + protein, cuisines, wellness. Shown on first run and
  re-openable via **More → Edit preferences** (prefilled).
- **Phase 4 — App-feel features. 🟡 MOSTLY DONE.** **Meal logging** ("mark eaten") →
  **live protein ring** on Today, the **dark-mode toggle**, and the center **(+)
  "Build a plate"** sheet are in. *Remaining:* richer motion and more empty/edge states.
- **Phase 5 — PWA, a11y, cleanup. 🟡 PWA DONE.** `vite-plugin-pwa` (Workbox) generates
  a precaching service worker + manifest → installable & offline-first (catalogue is
  bundled, so it works with no network after first load; `autoUpdate`). *Remaining:*
  accessibility pass, tighten TypeScript on the ported modules, remove dead code.
- **Phase 6 — QA.** iOS Safari (nav drift, safe areas), Lighthouse PWA/perf, install +
  offline test, data-migration test from an existing `graze.prefs.v1`.

## 10. Testing

- **Engine:** port the existing headless engine checks to **Vitest** — the engine logic
  must stay byte-for-byte equivalent (determinism contract).
- **Components:** React Testing Library for the core loop (generate → swap → check
  grocery → mark eaten → ring updates).
- **Migration test:** seed old `localStorage`, load the new app, assert the plan and
  grocery state survive.

## 11. Decisions (resolved)

1. **TypeScript — yes.** Adopted (new code is typed; ported engine/data are loose for
   now, tightened in Phase 5).
2. **Meal logging / "mark eaten" — yes** (§5.1). Storage key `graze.log.v1` reserved;
   the Today ring is wired to it in Phase 4.
3. **Branding — out of scope.** Neutral system + single functional accent + dark mode;
   no name/logo work; "Graze" is not advertised.
4. **First PR = Phase 0 only** — landed on the branch; iterate from there.

**Still to confirm (deployment):** that `mevivek.dev/meal-planner/` is a *project page*
(CNAME on the user-site repo), so this repo only needs `base: '/meal-planner/'`; and
that flipping **Settings → Pages → Source = GitHub Actions** is OK. Until then the live
site is unaffected — nothing deploys until this lands on `main`.
```
