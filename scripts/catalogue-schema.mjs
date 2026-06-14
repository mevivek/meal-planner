// Shared schema + vocabulary + domain rules for the meal catalogue.
// Used by generate-catalogue.mjs (build-time generation) and
// validate-catalogue.mjs (CI/offline validation). See docs/CLAUDE-DATA-HOSTING.md.
import { z } from "zod";

export const SLOTS = ["breakfast", "lunch", "dinner", "snack"];
export const COOKS = ["none", "sear", "cook"];
export const CUISINES = ["indian", "global", "mezze", "thai", "mexican"];
export const CONTAINS = ["dairy", "paneer", "curd", "egg", "tofu", "nuts", "peanut", "seeds", "gluten", "soy"];
export const WELLNESS = ["skin", "hair", "energy", "digestion", "immunity", "strength"];
export const ITEM_CATS = ["protein", "grain", "produce", "dairy", "nuts", "pantry", "cooking"];

// Mirrors the Meal shape the engine consumes (src/lib/types.ts / docs/ENGINE.md).
export const MealSchema = z.object({
  id: z.string().min(1),
  slot: z.enum(SLOTS),
  name: z.string().min(1),
  icon: z.string().min(1),
  protein: z.number(),
  prep: z.number(),
  cook: z.enum(COOKS),
  pack: z.boolean(),
  cuisine: z.enum(CUISINES),
  contains: z.array(z.enum(CONTAINS)),
  wellness: z.array(z.enum(WELLNESS)),
  detail: z.string().min(1),
  items: z.array(z.object({ n: z.string().min(1), c: z.enum(ITEM_CATS) })).min(1),
  recipe: z.array(z.string()).optional(),
});

export const CatalogueSchema = z.array(MealSchema).min(1);

// Heuristic ingredient-token → required `contains` flag. This is the
// allergen-safety gate the JSON Schema can't express: if an item mentions one
// of these, the meal must declare the flag. Refine the map as the data grows.
const TOKEN_FLAGS = {
  paneer: "paneer", tofu: "tofu", curd: "curd", yogurt: "curd", dahi: "curd",
  egg: "egg", peanut: "peanut", almond: "nuts", walnut: "nuts", cashew: "nuts",
  pistachio: "nuts", chia: "seeds", sesame: "seeds", tahini: "seeds", flax: "seeds",
  "pumpkin seed": "seeds", milk: "dairy", cheese: "dairy", ghee: "dairy",
  wheat: "gluten", bread: "gluten", wrap: "gluten", roti: "gluten", couscous: "gluten",
  soy: "soy", edamame: "soy",
};

/** Domain rules the JSON Schema can't enforce. Returns an array of error strings. */
export function domainErrors(meals) {
  const errs = [];
  const ids = new Set();
  for (const m of meals) {
    if (ids.has(m.id)) errs.push(`duplicate id: ${m.id}`);
    ids.add(m.id);
    if (m.protein < 0 || m.protein > 80) errs.push(`${m.id}: protein ${m.protein}g out of range 0–80`);
    if (m.prep < 0 || m.prep > 60) errs.push(`${m.id}: prep ${m.prep}min out of range 0–60`);
    // Allergen-safety: any flagged ingredient in items must appear in `contains`.
    for (const it of m.items || []) {
      const n = it.n.toLowerCase();
      for (const [token, flag] of Object.entries(TOKEN_FLAGS)) {
        if (n.includes(token) && !m.contains.includes(flag)) {
          errs.push(`${m.id}: item "${it.n}" implies contains:"${flag}" but it's missing`);
        }
      }
    }
  }
  return errs;
}
