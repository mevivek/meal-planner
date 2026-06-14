# Meal Planner — UI/UX Revamp Plan

> Status: **proposal / for review.** No app code has changed yet — this document is
> the spec. Implementation is phased (see §9) and gated on the open questions in §11.

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

## 9. Phased implementation

Each phase is independently reviewable; the live site is untouched until merge.

- **Phase 0 — Scaffold & prove the pipeline.** Vite+React+TS; port `engine/data/
  products` to ES modules; render today's plan from the real engine; stand up the
  Pages Action and confirm it deploys to `/meal-planner/`. *Exit: a deployed page that
  generates a real plan.*
- **Phase 1 — App shell & design system.** Tokens (light/dark), primitives, tab bar,
  top bars, hash-synced screen switching + transitions.
- **Phase 2 — Core screens.** Today (incl. progress ring), Week, Grocery, More — port
  the rendering logic out of `app.js` into components at parity.
- **Phase 3 — Onboarding.** Port the wizard to React with the unchanged schema.
- **Phase 4 — App-feel features.** Meal logging → live ring, dark-mode toggle, refined
  motion, empty/edge states, the (+) "Build a plate" sheet.
- **Phase 5 — PWA, a11y, cleanup.** `vite-plugin-pwa`; delete dead files/CSS; keyboard
  + screen-reader pass; update README/`docs`.
- **Phase 6 — QA.** iOS Safari (nav drift, safe areas), Lighthouse PWA/perf, install +
  offline test, data-migration test from an existing `graze.prefs.v1`.

## 10. Testing

- **Engine:** port the existing headless engine checks to **Vitest** — the engine logic
  must stay byte-for-byte equivalent (determinism contract).
- **Components:** React Testing Library for the core loop (generate → swap → check
  grocery → mark eaten → ring updates).
- **Migration test:** seed old `localStorage`, load the new app, assert the plan and
  grocery state survive.

## 11. Open questions to confirm before Phase 0

1. **TypeScript** — adopt it (recommended), or keep plain JS?
2. **Meal logging / "mark eaten"** (§5.1) — include this new feature? It's what most
   makes Today feel like an app.
3. **Brand identity — resolved.** Out of scope: we move to a neutral system with a
   single functional accent + dark mode. No name/logo work; "Graze" is not advertised.
4. **Deploy/domain** — confirm `mevivek.dev/meal-planner/` is a project page (CNAME on
   the user-site repo) so we only set `base`; and that adding a Pages **Action** is OK.
5. **Scope of first PR** — ship **Phase 0** (scaffold + deploy proof) on its own for
   review, then iterate? (Recommended.)
```
