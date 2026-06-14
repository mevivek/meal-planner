# Hosting the data catalogue on Claude — plan

> **Status: planning only.** This document evaluates how to involve Claude
> (Anthropic) in producing and/or hosting this project's "database" — the meal/recipe
> catalogue and the product-nutrition catalogue. It proposes no application-code change.
> The single artifact it recommends adding (later, in implementation) is a committed,
> generated JSON dataset plus an offline generator script; the runtime app stays a
> keyless, offline-first PWA.

## Scope and cross-references

- The "database" is two pure-data modules:
  - [`src/lib/data.ts`](../src/lib/data.ts) — `MEALS` (richly tagged vegetarian
    meals/recipes) plus selection config (`WELLNESS`, `CUISINES`, `DAY_*`, the
    build-your-own matrix `BUILD`, techniques `TIPS`). As of this writing it holds ~40
    meals (breakfast/lunch/dinner/snack) plus 6 booster snacks.
  - [`src/lib/products.ts`](../src/lib/products.ts) — `PRODUCTS` (per-serving branded
    nutrition; rows are `source:"label"` transcribed from real packs, or
    `source:"generic"` reference values) plus `PRODUCT_CATS`.
- The exact shapes the engine consumes are in [`src/lib/types.ts`](../src/lib/types.ts)
  (`Meal`, `MealItem`, `Prefs`, `Plan`). The data model and the deterministic selection
  pipeline are documented in [`docs/ENGINE.md`](./ENGINE.md).
- The swap seam already exists: [`src/lib/mealSource.ts`](../src/lib/mealSource.ts)
  defines `MealSource { getMeals(): Promise<Meal[]> }`, static today and swappable later.
- This doc **goes deeper than** [`docs/UI-REVAMP-PLAN.md` §8a](./UI-REVAMP-PLAN.md#8a-claude-hosted-recipesitems-future-data-source),
  which sketches build-time generation vs. a serverless proxy, `claude-opus-4-8`,
  structured output via `messages.parse()` + Zod, and the Batch API. Read §8a first;
  this document is the detailed design, validation, cost, and rollout plan that sits
  under it. The [README](../README.md#data-source--claude-hosted-content) §"Data source &
  Claude-hosted content" is the user-facing summary.

## Non-negotiable constraints

These bound every option below.

1. **No Anthropic API key in the browser bundle, ever.** This is a keyless client-side
   PWA. Any approach that would place the key in shipped JS/HTML, in a public env var
   inlined by Vite (`VITE_*` is inlined into the bundle — never put the key there), or in
   a static asset is **invalid**. The key lives only in: a developer's local shell env, a
   CI secret, or a serverless function's server-side env.
2. **Offline-first.** The app must keep working with no network and no backend. Adding a
   mandatory backend is disqualifying unless an option genuinely requires it — and then
   the trade-off is called out explicitly.
3. **The engine contract is sacred.** `src/lib/engine.ts` is pure and **deterministic
   given `prefs.seed`**. `contains[]` on each meal is the single source of truth for
   diet/allergen filtering. Any generated data must match the `Meal`/`Product` shapes
   exactly, or the engine, its tests, and its determinism break.
4. **Label-sourced nutrition is ground truth.** `products.ts` rows with `source:"label"`
   were transcribed from real nutrition panels. LLM-generated nutrition numbers are
   **approximate** and must never silently overwrite label data. See §"Nutrition accuracy
   & trust" — products are treated very differently from meals here.

---

## 1. What "host the DB on Claude" can mean

There are two genuinely different ideas hiding in the phrase, and it's worth being honest
about which is which:

- **"Use Claude to *generate* data that we host ourselves."** Claude is a content source
  at build time; the data lives in our repo / our CDN. (Options A, B-partial.)
- **"Host the data *on* Claude / Anthropic infrastructure."** The dataset physically
  lives in an Anthropic-managed store and is fetched at runtime. (Options C, D.)

For a static, offline-first PWA with no accounts and no backend, only the *generate-and-
self-host* family fits cleanly. The *host-on-Anthropic* family (C, D) all require a
runtime credential to read the data back, which means a backend, which breaks constraints
1 and 2. They are evaluated honestly below and rejected for this app.

### The options

**(a) Build-time generation → committed static JSON.**
A Node script (key in env) calls Claude to generate/expand the catalogue, validates it,
and writes a JSON file that is **committed to the repo** and shipped as a build asset. A
`ClaudeMealSource` (really a `JsonMealSource`) reads that JSON. Claude is touched only on
a developer's machine or in a manually-triggered CI job — never at app runtime. This is
"use Claude to generate data we host ourselves," and it preserves the offline/no-backend
/ deterministic-app model completely.

**(b) Serverless proxy → on-demand / live generation.**
A minimal serverless function (Cloudflare Worker / Vercel / Netlify) holds the key and
calls Claude; the PWA `fetch`es it to generate a recipe live ("make me a recipe for X
now"). This is the only way to get *runtime* generation without exposing the key. It adds
a backend surface and a network dependency for that feature — so it is offline-degraded,
not offline-first. Best as an *optional enhancement layered on top of (a)*, gated so the
core app still works offline, not as the primary data source.

**(c) Anthropic Files API to store/serve the dataset.**
The [Files API](https://platform.claude.com/docs/en/build-with-claude/files) stores files
(≤500 MB, 100 GB/org) for **use as inputs to Messages API requests** — referenced by
`file_id` inside an API call. It is *not* a public CDN: downloading a file
(`GET /v1/files/{id}/content`) requires the Anthropic API key. So serving the dataset to
the browser directly from Files would either expose the key (invalid) or require a proxy
(which is just option B with extra steps). Files is useful *inside* our build pipeline —
e.g. uploading the current `data.ts` as a reference document for the generator, or holding
a golden set — but it is **not a hosting mechanism for the app's data**.

**(d) Managed Agents + memory store as a persistent data store.**
[Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) provide
server-managed stateful agents, and a **memory store** is workspace-scoped persistent
text that survives across sessions. One could imagine keeping the catalogue in a memory
store. But: memory stores are read/written *by an agent inside a session*, gated behind
the API key, with no public read path; reading them back into the browser again needs a
proxy + key. Managed Agents is the right tool for *running an authoring/curation agent*
(e.g. "expand the Thai dinners and open a PR") — see §4 — but it is **not** a runtime data
store for a keyless PWA.

### Comparison

| Option | "Hosting on Claude"? | Effort | Offline support | Key-exposure risk | Cost | Freshness | Complexity |
|---|---|---|---|---|---|---|---|
| **(a) Build-time JSON** (recommended) | No — generate, self-host | Low–Med | Full (data shipped) | **None at runtime** (key in CI/dev only) | One-off generation; ~$0 to serve | On rebuild / PR | Low |
| **(b) Serverless proxy (live)** | No — generate at runtime | Med–High | Degraded (feature needs net) | Low (key server-side) but new attack surface | Per request + hosting | Real-time | Med–High |
| **(c) Files API** | Partial — stores on Anthropic | Med | None (read needs key) | **High if served to browser**; needs proxy otherwise | Storage ~free; egress via API | Manual re-upload | Med |
| **(d) Managed Agents + memory** | Yes — on Anthropic | High | None (read needs key) | **High** without a proxy | Session + agent cost | Agent-driven | High |

### Recommendation

**Adopt (a): build-time generation committed as a static JSON dataset, fed through the
existing `MealSource` seam.** Rationale:

- It is the only option that keeps **all four hard constraints** simultaneously: zero
  runtime key exposure, fully offline-first, no mandatory backend, and a deterministic
  app (the JSON is snapshotted and committed, so the engine's per-seed determinism is
  untouched — see §3).
- It treats Claude as what it is for this project: a **content generator**, not a runtime
  dependency. Generated meals enter the repo through a reviewable PR diff, exactly like
  hand-authored data does today.
- It is the lowest-effort, lowest-complexity path and builds directly on `mealSource.ts`,
  which was added in Phase 0 for precisely this.

**Optionally, later, layer (b)** as a clearly-gated "generate a recipe now" enhancement —
but only if a real user need appears, and only as an additive feature that the offline
core never depends on. Mark its trade-off plainly: it introduces a backend and a network
dependency for that one feature.

**Reject (c) and (d) as data-hosting mechanisms** for this app: both require the API key
on the read path, which forces a proxy and defeats the keyless/offline model. (c) still
has a legitimate *build-pipeline* role; (d) has a legitimate *authoring-agent* role — see
§4 — but neither hosts the app's data.

The rest of this document details the recommended option (a).

---

## 2. Generation / serving pipeline (recommended option a)

### Where it runs and what touches the key

```
 dev machine / CI (key in env)                          repo / build                browser (no key)
 ┌──────────────────────────────┐    writes/validates   ┌───────────────────┐  ship  ┌──────────────────┐
 │ scripts/gen-catalogue.ts     │ ───────────────────▶  │ src/data/         │ ─────▶ │ JsonMealSource   │
 │  @anthropic-ai/sdk           │                       │   meals.json      │        │  fetch(meals)    │
 │  claude-opus-4-8             │                       │   meals.meta.json │        │  → engine        │
 │  messages.parse + Zod        │ ◀─── few-shot ─────── │ (committed)       │        └──────────────────┘
 │  Batch API (bulk)            │      from data.ts     └───────────────────┘
 └──────────────────────────────┘
```

The generator is a Node/TS script under `scripts/` (e.g. `scripts/gen-catalogue.ts`),
**not** part of the app bundle. It reads `ANTHROPIC_API_KEY` from the environment
(local `.env` excluded from git, or a CI secret). The browser only ever sees the
committed JSON. This is the entire security story for option (a) — see §5.

### SDK + model (authoritative)

- **SDK:** the official **`@anthropic-ai/sdk`** (the project is TypeScript). Do not hand-
  roll HTTP and do not use any OpenAI-compatible shim.
- **Model:** **`claude-opus-4-8`** (the project default). Use the exact ID string as-is
  (no date suffix).
- **Thinking/effort:** for a generation script, leave adaptive thinking on
  (`thinking: { type: "adaptive" }`) and set `output_config: { effort: "medium" }` —
  generation is structured but not latency-sensitive. (Per-MTok pricing is the same
  regardless of effort; effort trades thoroughness for token spend.)
- **Streaming:** if generating long batches in a single non-batch call, stream and use
  `.finalMessage()` to avoid SDK HTTP timeouts on large outputs.

### Structured outputs

Use `client.messages.parse()` with `output_config.format` built from a **Zod schema via
`zodOutputFormat`** that mirrors `Meal` (and a separate one for `Product`). `messages.parse()`
validates the response against the schema and returns typed `parsed_output`.

A Zod schema mirroring `Meal` (shape only — see §3 for what the schema *cannot* enforce):

```ts
import { z } from "zod";

const Slot = z.enum(["breakfast", "lunch", "dinner", "snack"]);
const Cook = z.enum(["none", "sear", "cook"]);
const Cat  = z.enum(["protein", "grain", "produce", "dairy", "nuts", "pantry", "cooking"]);

const MealItem = z.object({
  n: z.string(),   // grocery line
  c: Cat,          // category
});

const MealSchema = z.object({
  id: z.string(),
  slot: Slot,
  name: z.string(),
  icon: z.string(),
  protein: z.number(),     // grams — range checked in script (see §3)
  prep: z.number(),        // minutes — range checked in script
  cook: Cook,
  pack: z.boolean(),
  cuisine: z.string(),     // membership checked against CUISINES in script
  contains: z.array(z.string()),   // vocabulary checked in script
  wellness: z.array(z.string()),   // vocabulary checked against WELLNESS in script
  detail: z.string(),
  items: z.array(MealItem),        // recommend required for generated meals
  recipe: z.array(z.string()).optional(),  // present iff cook !== "none"
});
```

> **Note on the existing `Meal` type:** in `types.ts`, `items?` and `recipe?` are both
> optional. For *generated* meals, require `items` (the grocery aggregation and brand
> picker depend on it) and require `recipe` whenever `cook !== "none"` (cooked meals show
> method steps). Enforce these as script rules; keep the runtime `Meal` type unchanged so
> hand-authored data stays valid.

A `Product` schema mirrors the shape in `products.ts`:
`{ id, brand, name, category, serving, ingredient, per:{ kcal, protein, carbs, sugar, fat, fiber, calcium? }, tags:[], source:"generic"|"label", note? }`.
Generated products **must** be `source:"generic"` (see §"Nutrition accuracy").

### Validation the JSON Schema cannot do (done in the script)

Structured-output JSON Schema does **not** enforce numeric ranges (`minimum`/`maximum`),
string lengths, array-length bounds, or cross-field invariants. The SDK strips those
constraints before sending and (for Python/TS) re-checks the simple ones client-side, but
the domain rules below must be implemented as an explicit validation pass in the generator,
failing the build on violation:

- **Numeric ranges** (sanity bounds, not the schema's job): `protein` 1–60 g (boosters
  can be low; clamp absurd values), `prep` 1–60 min, product `per.kcal`/macros
  non-negative and within plausible per-serving bounds.
- **Enum / vocabulary membership** — these are the load-bearing checks:
  - `cuisine` ∈ `CUISINES` ids (`indian`, `global`, `mezze`, `thai`, `mexican`) unless a
    new cuisine is being deliberately added (then add it to `CUISINES` in the same PR).
  - `wellness[]` ⊆ the `WELLNESS` ids (`skin`, `hair`, `energy`, `digestion`, `immunity`,
    `strength`). Unknown tags are silently ignored by scoring — reject them so they don't
    rot.
  - `contains[]` ⊆ the known allergen/diet vocabulary
    (`dairy, paneer, curd, egg, tofu, nuts, peanut, seeds, gluten, soy`). **This is the
    most important check** — `contains[]` is the single source of truth for
    diet/allergen filtering. A wrong or missing flag is a correctness/safety bug, not a
    cosmetic one (see below).
  - `items[].c` ∈ the grocery categories (`CAT_ORDER`).
- **`contains[]` ↔ `items[]` integrity.** Cross-check the two so they can't drift:
  if an item is paneer/tofu/peanut/curd/etc., the corresponding `contains` flag must be
  present, and vice-versa. Catch "lists peanut butter in items but omits `peanut` from
  `contains`" — that meal would wrongly pass a peanut-allergen filter. This check is
  worth maintaining a small ingredient→flag lookup for.
- **Vegetarian invariant.** All meals are vegetarian. Reject any meat/fish vocabulary in
  `name`/`detail`/`items`.
- **`pack`/`cook` plausibility.** Optional soft checks: `recipe` present iff
  `cook !== "none"`; a `pack:true` meal shouldn't require last-minute cooking.

### Dedupe & stable IDs

- **Stable, deterministic IDs.** Follow the existing convention (`bf-…`, `ln-…`, `dn-…`,
  `sn-…` by slot). Generate the id from a slug of `slot`+`name` (e.g.
  `ln-quinoa-rajma`), so re-running the generator for the same meal yields the same id and
  the committed diff is minimal. Do **not** let the model invent random ids.
- **Dedupe** on normalized `name` + `slot` (and optionally a fingerprint of
  `contains`+main ingredients) so re-runs and overlapping prompts don't add near-
  duplicates. Existing ids always win; new content is appended.
- **Few-shot from existing data** so the model matches house style and the exact shape —
  see §7.

### Batch API for bulk generation (cost)

For generating or expanding the whole catalogue, use the
[Message Batches API](https://platform.claude.com/docs/en/build-with-claude/batch-processing)
(`client.messages.batches`): up to 100k requests/batch, most complete within an hour,
**50% off** standard token pricing. Shape: one batch request per meal (or per small
group), each with its own `custom_id` (reuse the intended meal id), poll
`batches.retrieve` until `ended`, then stream results. Per-request structured output and
prompt caching both work inside batches. This is the right tool for a one-time "build the
catalogue" or a "+20 Thai dinners" expansion; use a plain `messages.parse()` call for
single on-demand additions.

### Prompt caching for shared instructions

The generator's system prompt is large and identical across every meal request: the full
shape spec, the enum vocabularies, the `contains[]`/`items[]` rules, and the few-shot
examples drawn from `data.ts`. Put all of that **before** the per-meal instruction and
mark a `cache_control: { type: "ephemeral" }` breakpoint at the end of the shared prefix
so it's written once and read (~0.1× cost) on every subsequent request. Keep the volatile
per-meal ask (cuisine, slot, "avoid duplicating these names…") *after* the breakpoint.
Verify with `usage.cache_read_input_tokens > 0`. (Note: Batch API requests can use prompt
caching, but cache hits across a large batch depend on timing; the bigger lever for bulk
is the 50% batch discount.)

### Keeping generated meals in the engine's exact shape

The generator's only output is JSON conforming to the `Meal`/`Product` shapes above. The
new `JsonMealSource` returns `Meal[]` exactly as `staticMealSource` does today, so
`engine.ts`, the screens, and the determinism contract are **unaffected**. Claude is a
content source that runs *before* the build; it is never in the runtime planner.

---

## 3. Data integrity & the engine contract

- **The app stays deterministic; generation is not.** LLM output is non-deterministic by
  nature. We make the *app* deterministic by **snapshotting** the generated JSON and
  **committing it**. After generation, the catalogue is a frozen, version-controlled asset
  — re-running the generator does not change a shipped build, and `engine.generatePlan`
  with a fixed seed always returns the same plan from a given committed dataset. The
  non-determinism is confined to the (offline, reviewed) generation step.
- **Schema validation step.** `messages.parse()` gives shape validity; the §2 script-level
  pass gives domain validity (ranges, enums, `contains[]`/`items[]` integrity, vegetarian
  invariant). Both must pass before any JSON is written.
- **CI gate.** A CI job (and a local `npm run validate:data`) re-validates the committed
  JSON against the Zod schema **and** the domain rules on every PR, with **no network /
  no API key** — it validates the data already in the repo. This catches hand-edits and
  bad merges, not just fresh generations. Wire it alongside the existing engine smoke
  test so a PR can't merge a dataset the engine can't safely plan from.
- **Engine smoke test against the dataset** — see §8.

---

## 4. Update & review workflow

- **Adding cuisines / expanding the catalogue.** Run the generator with a target (e.g.
  `--cuisine thai --slot dinner --count 10`). If introducing a brand-new cuisine, add it
  to `CUISINES` in `data.ts` in the **same PR** so the validator accepts it and the
  onboarding offers it.
- **Review generated diffs via PR.** Generation is never committed straight to a release
  branch. The generator writes JSON; a human opens a PR; the **diff is the review surface**
  (stable ids keep diffs minimal). Reviewers check: realistic ingredients/quantities,
  correct `contains[]` (allergen safety), sensible `protein`/`prep`, no duplicates, house
  style. This is identical to how hand-authored meals are reviewed today — the source just
  happens to be a model.
- **Optional authoring agent (Managed Agents).** For a more automated loop, a Managed
  Agent with the GitHub MCP server could expand the catalogue and open the PR itself
  (define a gradeable Outcome — e.g. "20 valid Thai dinners that pass `validate:data`").
  This is an *authoring* convenience, still gated behind review; it does **not** make
  Managed Agents the runtime data store (§1d). Out of scope for the first cut.
- **Versioning / seeding the dataset.** Ship a `meals.meta.json` sidecar with a
  `schemaVersion`, a `datasetVersion` (bump on content change), the `model` used, and the
  generation date. The app can read `schemaVersion` to guard against a stale precache. The
  per-user planning `seed` (in `Prefs`) is unrelated and continues to live in
  `localStorage` — generation does not touch it.
- **Rollback.** The dataset is a committed file, so rollback is `git revert` of the PR
  (and a redeploy). Because the runtime is offline-first, an in-flight user is unaffected
  until they update; bumping `datasetVersion`/`schemaVersion` lets the service worker
  refresh the precached JSON on next load.

---

## 5. Security & secrets

- **The browser never sees the key, in any option.** For the recommended option (a) the
  browser only ever fetches a committed static JSON file — there is no credential on the
  client at all.
- **Where the key lives, per option:**
  - **(a) build-time:** `ANTHROPIC_API_KEY` in the developer's local shell / a git-ignored
    `.env`, or a **CI secret** for a manually-triggered generation job. Never in `VITE_*`
    (those are inlined into the bundle), never committed, never in the deployed Pages
    artifact.
  - **(b) serverless proxy:** the key lives only in the **function's server-side env**;
    the function is the only thing that can call Anthropic. The PWA calls the function,
    not Anthropic. Add rate-limiting/abuse controls since it's a public endpoint.
  - **(c)/(d):** would require the key on the read path → rejected (§1).
- **`.gitignore` / CI hygiene:** ensure `.env*` is git-ignored; the generation CI job
  references the secret via the platform's secret store, never echoes it, and is separate
  from the deploy workflow (deploy needs no Anthropic key).
- **What the browser ever sees:** the committed `meals.json` / `products.json` and the
  app code. Nothing else.

---

## 6. Rough cost estimate (order of magnitude)

Pricing for `claude-opus-4-8`: **$5 / 1M input tokens, $25 / 1M output tokens**; the
**Batch API is 50% off** both.

Per generated meal, very roughly:
- Output: a `Meal` JSON object is ~250–400 tokens → call it ~400 output tokens with
  thinking overhead headroom.
- Input: the shared spec + few-shot prefix is large (~3–5k tokens) but **prompt-cached**,
  so after the first request most of it bills at ~0.1×; the per-meal ask is small.

For a **full ~50-meal (re)generation** via Batch:
- Output ≈ 50 × ~400 = ~20k tokens → ~$0.50 at standard, **~$0.25 batched**.
- Input (cached prefix counted once at write ~1.25×, then cheap reads) ≈ on the order of
  ~10–30k effective tokens → a few cents, **halved in batch**.
- **Total: roughly $0.25–$1 per full catalogue regeneration.** Even an order of magnitude
  off, this is **single-digit dollars** — a rounding error done a handful of times.

A products pass is similar magnitude (and smaller, since only `source:"generic"` rows are
ever generated). The serving cost of the recommended option is **$0** — the data is a
static asset on GitHub Pages.

(Option (b)'s cost would be per-request at runtime plus function hosting — another reason
to keep it an optional add-on, not the default path. These figures use the cached pricing
in the skill reference; re-confirm against current pricing before budgeting.)

---

## 7. Migration / seeding from the existing data

The current `data.ts`/`products.ts` are the **golden set** — they encode the house style,
the exact shape, realistic quantities, and (for products) real label values.

- **Few-shot examples.** Feed 4–8 existing `MEALS` entries (spanning slots and cuisines)
  into the generator's cached system prefix as canonical examples, so output matches shape
  and tone. Likewise feed a couple of `source:"generic"` products as the product template.
- **Reference document (optional).** The whole current `data.ts` can be uploaded once via
  the **Files API** and referenced in the generation prompt as "existing catalogue — do
  not duplicate these names; match this style." (This is the legitimate build-pipeline use
  of Files noted in §1c — input to generation, not hosting.)
- **Seeding the first JSON dataset.** Two clean paths, pick one:
  1. **Port-then-extend:** mechanically convert today's `MEALS`/`PRODUCTS` arrays into the
     committed `meals.json`/`products.json` (no model involved), point `JsonMealSource` at
     them, confirm byte-equivalent engine behavior, *then* use the generator only to
     **append** new meals. Safest — the existing curated data is preserved verbatim.
  2. **Regenerate-and-diff:** regenerate the catalogue from scratch and diff against the
     ported baseline to sanity-check the generator before trusting it for net-new content.
  Path 1 is recommended for the cutover; path 2 is a good one-time validation of the
  generator's quality.
- **Dedupe against the golden set** so generated content never collides with existing ids
  or near-duplicate names (§2).

---

## 8. Testing

- **Schema validation** — the committed JSON validates against the Zod `Meal`/`Product`
  schemas (shape). Run in CI, offline, no key.
- **Domain validation** — the §2 script rules (ranges, enum/vocabulary membership,
  `contains[]`/`items[]` integrity, vegetarian invariant, `recipe` iff cooked). Same
  offline CI job.
- **Engine smoke test against the generated dataset** — extend the existing headless
  determinism check (`docs/ENGINE.md` §"Determinism & testing"; moving to Vitest per
  UI-REVAMP-PLAN §10) to run `generatePlan(prefs, MEALS_FROM_JSON)` across a spread of
  prefs and assert the invariants the engine guarantees: every selected meal satisfies
  diet/egg/dairy/dislikes/allergens, office-day lunch+dinner are `pack:true`, no meal
  repeats within a day, daily protein within tolerance, and a fixed seed reproduces the
  same plan. This proves the generated data is *plannable*, not just *well-shaped*.
- **Filter-coverage check** — assert the catalogue can still satisfy each slot under
  common restrictive pref combinations (e.g. vegan + nut-allergic), so generation hasn't
  starved a slot. A no-candidates slot is a data regression even if every row is valid.

---

## 9. Phased steps

This slots under UI-REVAMP-PLAN §9 (the app rebuild) and is independent of it — it can
land any time after the `MealSource` seam (already in Phase 0).

- **DH-0 — Seam confirmation (done).** `mealSource.ts` exists; the engine/screens consume
  `MealSource` only. No code change needed to start.
- **DH-1 — JSON source + ported dataset.** Add `JsonMealSource` (reads committed
  `src/data/meals.json` / `products.json`); port today's `MEALS`/`PRODUCTS` into those
  files (§7 path 1); switch `mealSource` to the JSON source; confirm byte-equivalent
  engine output. *No Claude yet.* This de-risks the swap on its own.
- **DH-2 — Validation + CI gate.** Land the Zod schemas, the domain-validation script
  (`npm run validate:data`), and the offline CI job + engine smoke test (§3, §8).
- **DH-3 — Generator (single-meal).** `scripts/gen-catalogue.ts` with `@anthropic-ai/sdk`,
  `claude-opus-4-8`, `messages.parse()` + Zod, few-shot from `data.ts`, stable ids,
  dedupe; key from env. Generate a few meals, review the PR diff.
- **DH-4 — Bulk via Batch + caching.** Add the Batch API path and prompt-caching prefix
  for catalogue-scale generation/expansion (§2).
- **DH-5 — Products (cautious).** Generate `source:"generic"` rows only, with the trust
  guardrails in §"Nutrition accuracy"; never touch `source:"label"` rows.
- **DH-6 (optional) — Live generation proxy.** Only if a "generate a recipe now" need
  appears: a thin serverless proxy (option b), gated so the offline core is unaffected.

---

## Nutrition accuracy & trust (products.ts)

This deserves its own callout because it's where LLM generation is most dangerous.

- **LLM nutrition numbers are approximate.** Claude will happily produce plausible-looking
  macros that are wrong. For *meals*, `protein` is already an approximate planning input
  (the engine uses it for scoring and protein top-ups, not for medical accuracy), so
  generated meal `protein` is acceptable with the §2 range checks.
- **For *products*, the bar is higher.** `products.ts` exists partly to hold **real,
  label-transcribed** values (`source:"label"`) — these are trusted reference data the
  user explicitly entered from packs. **Generated values must never silently replace or be
  mixed in as if they were label data.** Rules:
  - Generated products are **always `source:"generic"`**, never `source:"label"`.
  - The generator must **never modify or delete** an existing `source:"label"` row.
  - Generated rows should carry a `note` flagging them as model-estimated, and PR review
    must scrutinize macros against known references.
  - Prefer using generation for *meals* first; treat product generation as an optional,
    extra-cautious extension (DH-5), and consider keeping product data hand-/label-curated
    indefinitely if the trust cost isn't worth it.

## Open questions for the user

1. **Scope:** generate **meals only**, or meals **and** generic products? (Recommendation:
   meals first; products cautiously or not at all — see above.)
2. **Trigger:** generation as a **local dev task** only, or also a **manually-triggered CI
   job** with the key as a CI secret? (Both keep the key off the client.)
3. **Live generation:** is "generate a recipe for X now" (option b, a backend) ever a
   desired feature, or is offline-first with a committed dataset sufficient indefinitely?
4. **New cuisines:** any target cuisines to expand into beyond the current five
   (`indian, global, mezze, thai, mexican`)?
5. **Authoring agent:** interest in a Managed-Agents authoring loop that opens PRs (§4), or
   keep generation as a plain script for now?
6. **Catalogue size target:** roughly how many meals per slot/cuisine is "enough" — this
   sets the batch size and the cost.
