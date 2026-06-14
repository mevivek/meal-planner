# Graze Planner Engine — design

Graze started as one person's fixed 7-day plan. This document describes the
generalised, preference-driven **planner engine** that asks a user about
themselves once, then generates a personalised week — and regenerates fresh
weeks on demand.

Everything runs client-side (no backend). Preferences and the generated plan
persist in `localStorage`. The engine is pure and deterministic given a seed,
so it is unit-testable and "Regenerate" simply changes the seed.

## Modules

| File | Responsibility |
|------|----------------|
| `js/data.js` | The **meal library** (richly tagged recipes), wellness definitions, cuisines, day-type/cook-level constants. Pure data. |
| `js/engine.js` | Pure functions: protein-target math, candidate filtering, scoring, weekly plan assembly, grocery aggregation, swap building. No DOM. |
| `js/onboarding.js` | Wizard step definitions + controller that collects preferences into the prefs object. |
| `js/app.js` | Orchestration: load prefs → run engine → render; settings, regenerate, day-type toggle, grocery check-off, persistence, service worker. |

## Preferences schema (`graze.prefs.v1`)

```js
{
  profile:  { age, gender, weightKg?, heightCm? },
  diet:     { base: 'vegetarian' | 'vegan',
              egg: false, dairy: true,          // dairy=true means cheese-free but paneer/curd ok
              dislikes: ['tofu', ...],          // ingredient flags to exclude
              allergens: ['nuts','peanut','gluten','soy', ...] },
  cooking:  { level: 'none' | 'sear' | 'cook',  // most effort the user will spend
              maxPrep: 15,                       // minutes on no-cook days
              cookDays: ['sat','sun'],           // days cooking is allowed
              lastMealBy: '20:00' },             // early-dinner cutoff
  schedule: { workStart:'12:00', workEnd:'22:00',
              dayTypes: { mon:'office', tue:'wfh', ... } },  // office | wfh | off
  goals:    { goal:'maintain'|'cut'|'bulk', proteinTarget:null, // null = auto
              mealsPerDay:3, cuisines:['indian','global',...], variety:'high' },
  wellness: ['skin','hair','energy','digestion','immunity','strength'],
  seed:     1234567   // changes on Regenerate
}
```

## Meal object

```js
{
  id, slot:'breakfast'|'lunch'|'dinner'|'snack', name, icon,
  protein,                 // grams
  prep,                    // minutes
  cook:'none'|'sear'|'cook',
  pack:true|false,         // survives a packed tiffin
  cuisine,                 // 'indian' | 'global' | 'mezze' | 'thai' | 'mexican' | ...
  contains:[...],          // 'dairy','paneer','curd','egg','tofu','nuts','peanut','seeds','gluten','soy'
  wellness:[...],          // benefit tags
  detail,                  // ingredient sentence shown on the card
  items:[{name,cat}],      // grocery lines + category for aggregation
  recipe:[...]             // optional method steps (cooked meals)
}
```

All meals are vegetarian. `contains` is the single source of truth for diet
filtering, so new cuisines/diets are added purely as data.

## Pipeline

1. **Protein target** — if weight is given: `g/kg × weight` (maintain 1.4,
   cut 1.6, bulk 1.8), clamped 50–120 g; otherwise a goal default
   (70 / 75 / 90 g). User can override.
2. **Per-day context** — from `schedule.dayTypes` + `cooking`:
   `cookAllowed = level≠'none' && day∈cookDays`; `maxLevel`/`maxPrep` relax on
   cook days; `office` days require `pack:true` for lunch & dinner.
3. **Filter** — drop meals that violate diet base, `egg`/`dairy`, `dislikes`,
   `allergens`, the day's cook level/prep, cuisine selection, or pack need.
4. **Score** — wellness-tag matches (+), preferred-cuisine (+), protein density
   toward the day's remaining need (+), variety penalty for meals used earlier
   in the week (−), plus a small seeded jitter so weeks differ.
5. **Select** — best-scoring unused candidate per slot per day; never repeat a
   meal within a day; minimise repeats across the week.
6. **Protein top-up** — if a day lands under target − 8 g, add one no-cook
   booster snack.
7. **Aggregate** — grocery list dedupes `items` across the week, grouped by
   category; swaps list the next-best filtered candidates per slot.

## Wellness mapping

Focuses bias selection toward meals tagged with that benefit:

- **skin** — hydration, vitamin C (citrus/tomato/pomegranate), healthy fats
  (avocado/seeds), antioxidants (berries)
- **hair** — protein, iron (spinach/sprouts), biotin (oats/peanuts/seeds),
  omega-3 (walnuts/chia)
- **energy** — complex carbs (oats/brown rice), iron, B-vitamins
- **digestion** — fibre (veg/beans/oats), probiotics (curd/yogurt)
- **immunity** — vitamin C, turmeric, ginger, zinc (seeds/nuts)
- **strength** — high protein + calcium (curd/sesame/greens)

## Extensibility

- Add a cuisine or diet → add tagged meals to `data.js`; the engine needs no
  changes.
- Support omnivore later → add meals whose `contains` includes meat flags and a
  diet base that permits them; the filter already keys off `contains`.
- New preference → extend the schema, add a wizard step, and (optionally) a
  filter/score rule.

## Determinism & testing

`engine.js` is pure. `generatePlan(prefs, MEALS)` with a fixed `seed` always
yields the same plan, so it can be checked headlessly (Node) by asserting:
every meal satisfies the prefs, daily protein is within tolerance, office-day
lunch/dinner are packable, and no day repeats a meal.
