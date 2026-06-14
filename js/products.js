/* ============================================================
   Graze — branded product nutrition database
   Per-serving macros for packaged staples. `source:"generic"`
   rows are typical placeholder values; `source:"label"` rows are
   transcribed from a real product's nutrition panel (added from
   the user's screenshots — brand + the exact serving on the pack).

   Product shape:
     { id, brand, name, category, serving,
       per: { kcal, protein, carbs, sugar, fat, fiber, calcium? },
       tags:[...], source:"generic"|"label", note? }
   All values are per the stated `serving`.
   ============================================================ */

const PRODUCT_CATS = [
  "Yogurt & curd",
  "Paneer & tofu",
  "Beans & pulses",
  "Nut & seed butters",
  "Seeds & nuts",
  "Grains & flours",
  "Milk & plant milk",
  "Protein & bars",
];

const PRODUCTS = [
  // --- real products transcribed from nutrition labels ---
  { id: "cd-paneer", brand: "Country Delight", name: "Paneer", category: "Paneer & tofu", serving: "90 g",
    per: { kcal: 261, protein: 15.7, carbs: 2.3, sugar: 2.3, fat: 21.1, fiber: 0, calcium: 459 },
    tags: ["high-protein", "calcium"], source: "label", note: "Cow milk + citric acid · 2 servings/pack · 14.8 g sat fat · 26 mg sodium" },
  { id: "md-cow-milk", brand: "Mother Dairy", name: "Cow Milk", category: "Milk & plant milk", serving: "200 ml",
    per: { kcal: 137, protein: 6.2, carbs: 9.6, sugar: 9.6, fat: 8.2, fiber: 0, calcium: 218 },
    tags: ["calcium", "protein"], source: "label", note: "Per 200 ml glass (label per 100 ml ×2) · 5.6 g sat fat · 110 mg sodium · 5 servings/pack" },
  { id: "amul-masti-dahi", brand: "Amul", name: "Masti Dahi (curd)", category: "Yogurt & curd", serving: "100 g",
    per: { kcal: 61, protein: 3.5, carbs: 4.0, sugar: 4.0, fat: 3.1, fiber: 0, calcium: 120 },
    tags: ["probiotic", "calcium"], source: "label", note: "Per 100 g · 2.0 g sat fat · 0 trans · 45 mg sodium" },

  // --- generic reference values (replace/supplement with real brands from screenshots) ---
  { id: "gen-greek-yogurt", brand: "Generic", name: "Greek yogurt (plain)", category: "Yogurt & curd", serving: "100 g",
    per: { kcal: 97, protein: 9, carbs: 4, sugar: 4, fat: 5, fiber: 0 }, tags: ["high-protein", "probiotic"], source: "generic" },
  { id: "gen-curd", brand: "Generic", name: "Curd / dahi", category: "Yogurt & curd", serving: "100 g",
    per: { kcal: 60, protein: 3.5, carbs: 4, sugar: 4, fat: 4, fiber: 0 }, tags: ["probiotic"], source: "generic" },
  { id: "gen-paneer", brand: "Generic", name: "Paneer (full-fat)", category: "Paneer & tofu", serving: "100 g",
    per: { kcal: 296, protein: 18, carbs: 4, sugar: 2, fat: 22, fiber: 0, calcium: 420 }, tags: ["high-protein", "calcium"], source: "generic" },
  { id: "gen-chickpeas", brand: "Generic", name: "Canned chickpeas (drained)", category: "Beans & pulses", serving: "100 g",
    per: { kcal: 139, protein: 7, carbs: 22, sugar: 1, fat: 2, fiber: 6 }, tags: ["fibre", "no-cook"], source: "generic" },
  { id: "gen-peanut-butter", brand: "Generic", name: "Peanut butter", category: "Nut & seed butters", serving: "2 tbsp (32 g)",
    per: { kcal: 190, protein: 7, carbs: 7, sugar: 3, fat: 16, fiber: 2 }, tags: ["healthy-fats"], source: "generic" },
  { id: "gen-roasted-chana", brand: "Generic", name: "Roasted chana", category: "Beans & pulses", serving: "30 g",
    per: { kcal: 120, protein: 6, carbs: 18, sugar: 1, fat: 2, fiber: 5 }, tags: ["high-protein", "snack", "no-cook"], source: "generic" },
  { id: "gen-sattu", brand: "Generic", name: "Sattu (roasted gram flour)", category: "Grains & flours", serving: "30 g",
    per: { kcal: 110, protein: 6, carbs: 18, sugar: 1, fat: 1.5, fiber: 3 }, tags: ["high-protein", "no-cook"], source: "generic" },
  { id: "gen-oats", brand: "Generic", name: "Rolled oats", category: "Grains & flours", serving: "40 g",
    per: { kcal: 150, protein: 5, carbs: 27, sugar: 1, fat: 3, fiber: 4 }, tags: ["fibre", "energy"], source: "generic" },
];
