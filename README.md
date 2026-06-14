# Graze — 7-day no-cook vegetarian week

A mobile-first, installable web app for a high-protein vegetarian meal plan.
No egg, no cheese, no tofu. **Weekdays are assembly-only** — the most you'll
do is toast bread or sear paneer for five minutes. **Weekends relax the
rules** with proper cooked recipes (with method steps).

Built for a 12pm–10pm workday: tiffin-friendly lunches, light late dinners,
and ~60–80g protein per day.

## Features

- **The week** — Mon–Sun chart (breakfast/lunch/dinner) with a per-day
  Office / WFH / Off toggle you set yourself (saved on-device), per-meal time,
  protein, and a per-day protein total. Opens straight on the plan, on today.
- **Weekend recipes** — Saturday & Sunday meals are cooked dishes with
  expandable step-by-step method; weekdays stay no-cook.
- **No-cook protein shelf** — the staples to keep stocked.
- **Build-your-own matrix** — tap a base × protein × veg × dressing to plate a
  combo with a live protein estimate.
- **Grocery list** — grouped by category, checkable, progress saved on-device.
- **Swap library** — alternates for every meal slot so weeks never repeat.
- **Quick techniques** — rice-paper rolling, 30-second peanut dip, 5-min sear.

## Tech

Plain HTML, CSS, and JavaScript — no framework, no build step. Installable PWA
with an offline service worker. All plan content lives in `js/data.js`.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Structure

```
index.html            App shell + sections
css/styles.css        Mobile-first styles
js/data.js            All plan content (edit meals here)
js/app.js             Rendering + interactions
manifest.webmanifest  PWA manifest
sw.js                 Offline service worker
icons/icon.svg        App icon
```
