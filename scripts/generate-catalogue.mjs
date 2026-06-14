// Build-time meal-catalogue generation via Claude → static JSON.
//
//   ANTHROPIC_API_KEY=... node scripts/generate-catalogue.mjs [count]
//
// Writes public/catalogue.json (validated). The app reads it through the
// MealSource seam (src/lib/mealSource.ts) — Claude is a build-time content
// generator, never a runtime dependency, so the app stays offline-first and
// keyless. See docs/CLAUDE-DATA-HOSTING.md. The key lives only in your shell /
// CI secret — never in the client bundle.
import fs from "node:fs";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { CatalogueSchema, MealSchema, domainErrors, SLOTS, COOKS, CUISINES, CONTAINS, WELLNESS, ITEM_CATS } from "./catalogue-schema.mjs";

const COUNT = Number(process.argv[2]) || 40;

// Two real entries as few-shot anchors (keep generated data in the engine's shape).
const EXAMPLES = [
  { id: "bf-oats-pb", slot: "breakfast", name: "PB-banana overnight oats", icon: "🥣", protein: 26, prep: 5, cook: "none", pack: true, cuisine: "global", contains: ["curd", "peanut", "seeds"], wellness: ["energy", "hair", "digestion"], detail: "½ cup oats · 1 cup Greek yogurt · chia · 1 tbsp peanut butter · banana", items: [{ n: "Rolled oats", c: "grain" }, { n: "Greek yogurt", c: "dairy" }, { n: "Banana", c: "produce" }, { n: "Peanut butter", c: "pantry" }, { n: "Chia seeds", c: "nuts" }] },
];

const SYSTEM = `You generate a vegetarian meal catalogue for a planner engine. Every meal MUST be vegetarian and conform exactly to the schema. Vocabulary (use only these):
- slot: ${SLOTS.join(", ")}
- cook: ${COOKS.join(", ")}
- cuisine: ${CUISINES.join(", ")}
- contains (allergen/diet flags — list EVERY one any ingredient introduces): ${CONTAINS.join(", ")}
- wellness: ${WELLNESS.join(", ")}
- items[].c (grocery category): ${ITEM_CATS.join(", ")}
Rules: protein in grams (realistic, 0–80); prep in minutes (0–60); pack=true only if it survives a packed lunch; "contains" is the single source of truth for diet/allergen filtering, so it MUST include a flag for every ingredient that has one (e.g. paneer→paneer, peanut butter→peanut, tofu→tofu+soy); ids are short kebab-case and unique; recipe only for cooked meals. Mirror the example's structure.`;

async function main() {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY
  const Wrapper = z.object({ meals: CatalogueSchema });

  const res = await client.messages.parse({
    model: "claude-opus-4-8",
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    system: SYSTEM,
    output_config: { format: zodOutputFormat(Wrapper, "catalogue") },
    messages: [{
      role: "user",
      content: `Generate ${COUNT} diverse vegetarian meals across all slots and cuisines. Here is one example of the exact shape:\n${JSON.stringify(EXAMPLES[0], null, 2)}`,
    }],
  });

  if (res.stop_reason === "refusal") {
    console.error("Request refused:", res.stop_details);
    process.exit(1);
  }
  const meals = res.parsed_output?.meals ?? [];

  // Validate before writing (schema already enforced by parse; re-check + domain rules).
  const parsed = CatalogueSchema.safeParse(meals);
  if (!parsed.success) {
    console.error("Schema validation failed:\n", JSON.stringify(parsed.error.issues, null, 2));
    process.exit(1);
  }
  const errs = domainErrors(parsed.data);
  if (errs.length) {
    console.error("Domain validation failed:\n" + errs.join("\n"));
    process.exit(1);
  }

  fs.mkdirSync("public", { recursive: true });
  fs.writeFileSync("public/catalogue.json", JSON.stringify(parsed.data, null, 2) + "\n");
  console.log(`Wrote public/catalogue.json — ${parsed.data.length} meals. Review the diff, then switch mealSource to generatedMealSource.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
