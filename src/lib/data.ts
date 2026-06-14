/* ============================================================
   Graze — meal library & config (pure data)
   The engine (engine.js) selects from MEALS using the user's
   preferences. All meals are vegetarian; `contains` is the single
   source of truth for diet/allergen filtering, so new cuisines or
   diets are added purely as data here.

   Meal shape:
     { id, slot, name, icon, protein, prep, cook, pack, cuisine,
       contains:[...], wellness:[...], detail, items:[{n,c}], recipe?[] }
   cook: 'none' | 'sear' | 'cook'      (most effort the meal needs)
   contains flags: dairy, paneer, curd, egg, tofu, nuts, peanut, seeds, gluten, soy
   wellness tags:  skin, hair, energy, digestion, immunity, strength
   item category c: protein | grain | produce | dairy | nuts | pantry | cooking
   ============================================================ */

export const WELLNESS = [
  { id: "skin", label: "Glowing skin", icon: "✨", note: "Hydration, vitamin C, healthy fats, antioxidants" },
  { id: "hair", label: "Hair health", icon: "💇", note: "Protein, iron, biotin, omega-3" },
  { id: "energy", label: "Steady energy", icon: "⚡", note: "Complex carbs, iron, B-vitamins" },
  { id: "digestion", label: "Gut & digestion", icon: "🌱", note: "Fibre + probiotics (curd)" },
  { id: "immunity", label: "Immunity", icon: "🛡️", note: "Vitamin C, turmeric, ginger, zinc" },
  { id: "strength", label: "Strength & muscle", icon: "💪", note: "High protein + calcium" },
];

export const CUISINES = [
  { id: "indian", label: "Indian" },
  { id: "global", label: "Global" },
  { id: "mezze", label: "Mezze / Mediterranean" },
  { id: "thai", label: "Thai / East-Asian" },
  { id: "mexican", label: "Mexican" },
];

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
export const DAY_FULL = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };
export const DAY_LABEL = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
export const COOK_RANK = { none: 0, sear: 1, cook: 2 };
export const CAT_LABEL = {
  protein: "Proteins",
  grain: "Grains & wraps",
  produce: "Fresh produce",
  dairy: "Dairy",
  nuts: "Seeds & nuts",
  pantry: "Flavour & pantry",
  cooking: "Cooking staples",
};
export const CAT_ORDER = ["protein", "dairy", "grain", "produce", "nuts", "pantry", "cooking"];

export const MEALS = [
  /* ---------------- BREAKFAST ---------------- */
  {
    id: "bf-oats-pb", slot: "breakfast", name: "PB-banana overnight oats", icon: "🥣",
    protein: 26, prep: 5, cook: "none", pack: true, cuisine: "global",
    contains: ["curd", "peanut", "seeds"], wellness: ["energy", "hair", "digestion"],
    detail: "½ cup oats · 1 cup Greek yogurt · chia · 1 tbsp peanut butter · banana",
    items: [{ n: "Rolled oats", c: "grain" }, { n: "Greek yogurt", c: "dairy" }, { n: "Banana", c: "produce" }, { n: "Peanut butter", c: "pantry" }, { n: "Chia seeds", c: "nuts" }],
  },
  {
    id: "bf-berry-smoothie", slot: "breakfast", name: "Berry-yogurt smoothie bowl", icon: "🥤",
    protein: 28, prep: 7, cook: "none", pack: false, cuisine: "global",
    contains: ["curd", "peanut", "seeds"], wellness: ["skin", "immunity", "strength"],
    detail: "1 cup Greek yogurt · frozen berries · peanut butter · pumpkin seeds · oats",
    items: [{ n: "Greek yogurt", c: "dairy" }, { n: "Frozen berries", c: "pantry" }, { n: "Peanut butter", c: "pantry" }, { n: "Pumpkin seeds", c: "nuts" }, { n: "Rolled oats", c: "grain" }],
  },
  {
    id: "bf-parfait", slot: "breakfast", name: "Greek yogurt granola parfait", icon: "🍯",
    protein: 24, prep: 5, cook: "none", pack: true, cuisine: "global",
    contains: ["curd", "nuts", "seeds", "gluten"], wellness: ["digestion", "strength", "energy"],
    detail: "1 cup Greek yogurt · granola · mixed seeds · fruit · drizzle honey",
    items: [{ n: "Greek yogurt", c: "dairy" }, { n: "Granola", c: "grain" }, { n: "Mixed seeds", c: "nuts" }, { n: "Seasonal fruit", c: "produce" }, { n: "Honey", c: "pantry" }],
  },
  {
    id: "bf-avo-toast", slot: "breakfast", name: "Avocado-hummus toast + yogurt", icon: "🥑",
    protein: 22, prep: 8, cook: "none", pack: false, cuisine: "global",
    contains: ["gluten", "curd", "seeds"], wellness: ["skin", "energy"],
    detail: "2 slices whole-wheat toast · hummus · avocado · tomato · seeds · ½ cup Greek yogurt",
    items: [{ n: "Whole-wheat bread", c: "grain" }, { n: "Hummus", c: "protein" }, { n: "Avocado", c: "produce" }, { n: "Tomato", c: "produce" }, { n: "Greek yogurt", c: "dairy" }],
  },
  {
    id: "bf-mango-oats", slot: "breakfast", name: "Mango-seed overnight oats", icon: "🥣",
    protein: 25, prep: 5, cook: "none", pack: true, cuisine: "indian",
    contains: ["curd", "seeds"], wellness: ["skin", "energy", "digestion"],
    detail: "½ cup oats · 1 cup Greek yogurt · mango/banana · mixed seeds · cardamom",
    items: [{ n: "Rolled oats", c: "grain" }, { n: "Greek yogurt", c: "dairy" }, { n: "Mango / banana", c: "produce" }, { n: "Mixed seeds", c: "nuts" }],
  },
  {
    id: "bf-chia-pudding", slot: "breakfast", name: "Chia-curd pudding + apple", icon: "🍮",
    protein: 18, prep: 5, cook: "none", pack: true, cuisine: "global",
    contains: ["curd", "seeds"], wellness: ["digestion", "skin"],
    detail: "Curd · chia · apple · cinnamon · side roasted chana",
    items: [{ n: "Curd", c: "dairy" }, { n: "Chia seeds", c: "nuts" }, { n: "Apple", c: "produce" }, { n: "Roasted chana", c: "protein" }],
  },
  {
    id: "bf-savory-curd", slot: "breakfast", name: "Savory curd & roasted-chana bowl", icon: "🥗",
    protein: 16, prep: 6, cook: "none", pack: true, cuisine: "indian",
    contains: ["curd"], wellness: ["digestion", "strength"],
    detail: "Curd · roasted chana · cucumber · roasted cumin · seeds",
    items: [{ n: "Curd", c: "dairy" }, { n: "Roasted chana", c: "protein" }, { n: "Cucumber", c: "produce" }, { n: "Mixed seeds", c: "nuts" }],
  },
  {
    id: "bf-pb-toast", slot: "breakfast", name: "PB-banana toast + yogurt", icon: "🍞",
    protein: 20, prep: 6, cook: "none", pack: false, cuisine: "global",
    contains: ["gluten", "peanut", "curd"], wellness: ["energy", "hair"],
    detail: "Whole-wheat toast · peanut butter · banana · side Greek yogurt",
    items: [{ n: "Whole-wheat bread", c: "grain" }, { n: "Peanut butter", c: "pantry" }, { n: "Banana", c: "produce" }, { n: "Greek yogurt", c: "dairy" }],
  },
  {
    id: "bf-muesli", slot: "breakfast", name: "Muesli + milk + seeds + fruit", icon: "🥛",
    protein: 18, prep: 4, cook: "none", pack: false, cuisine: "global",
    contains: ["dairy", "nuts", "seeds", "gluten"], wellness: ["energy", "digestion"],
    detail: "Muesli · milk · mixed seeds · fruit",
    items: [{ n: "Muesli", c: "grain" }, { n: "Milk", c: "dairy" }, { n: "Mixed seeds", c: "nuts" }, { n: "Seasonal fruit", c: "produce" }],
  },
  {
    id: "bf-sattu-smoothie", slot: "breakfast", name: "Sattu-banana smoothie", icon: "🥤",
    protein: 22, prep: 6, cook: "none", pack: false, cuisine: "indian",
    contains: [], wellness: ["energy", "strength", "hair"],
    detail: "Sattu · banana · water/plant-milk · lemon · jaggery",
    items: [{ n: "Sattu (roasted gram flour)", c: "protein" }, { n: "Banana", c: "produce" }, { n: "Jaggery", c: "pantry" }],
  },
  {
    id: "bf-sprout-chaat", slot: "breakfast", name: "Sprout & peanut breakfast chaat", icon: "🌱",
    protein: 18, prep: 8, cook: "none", pack: true, cuisine: "indian",
    contains: ["peanut"], wellness: ["hair", "digestion", "energy"],
    detail: "Sprouts · roasted peanuts · onion-tomato · lemon · chaat masala",
    items: [{ n: "Sprouting moong", c: "produce" }, { n: "Peanuts", c: "nuts" }, { n: "Onion", c: "produce" }, { n: "Tomato", c: "produce" }, { n: "Chaat masala", c: "pantry" }],
  },
  {
    id: "bf-besan-chilla", slot: "breakfast", name: "Besan chilla + mint chutney", icon: "🥞",
    protein: 22, prep: 20, cook: "cook", pack: false, cuisine: "indian",
    contains: [], wellness: ["strength", "energy"],
    detail: "Besan · onion · coriander · green chilli · mint chutney",
    items: [{ n: "Besan (gram flour)", c: "protein" }, { n: "Onion", c: "produce" }, { n: "Coriander", c: "produce" }, { n: "Mint chutney", c: "pantry" }, { n: "Oil", c: "cooking" }],
    recipe: [
      "Whisk besan with water, salt, chopped onion, coriander & green chilli to a pourable batter.",
      "Pour onto a hot non-stick tawa, spread thin, drizzle oil; cook 2–3 min per side.",
      "Serve with mint chutney.",
    ],
  },
  {
    id: "bf-paneer-paratha", slot: "breakfast", name: "Paneer paratha + curd", icon: "🫓",
    protein: 22, prep: 30, cook: "cook", pack: true, cuisine: "indian",
    contains: ["paneer", "curd", "gluten"], wellness: ["strength"],
    detail: "Whole-wheat dough · grated paneer-onion-chilli · curd · pickle",
    items: [{ n: "Whole-wheat atta", c: "grain" }, { n: "Paneer", c: "protein" }, { n: "Onion", c: "produce" }, { n: "Curd", c: "dairy" }, { n: "Ghee", c: "cooking" }],
    recipe: [
      "Mix grated paneer with chopped onion, green chilli, coriander and salt.",
      "Stuff into a dough ball and roll gently into a paratha.",
      "Cook on a hot tawa with a little ghee, ~2 min per side.",
      "Serve with chilled curd and pickle.",
    ],
  },
  {
    id: "bf-poha", slot: "breakfast", name: "Veg poha + peanuts", icon: "🍚",
    protein: 12, prep: 20, cook: "cook", pack: true, cuisine: "indian",
    contains: ["peanut"], wellness: ["energy", "digestion"],
    detail: "Flattened rice · onion · peas · curry leaves · peanuts · lemon",
    items: [{ n: "Poha (flattened rice)", c: "grain" }, { n: "Onion", c: "produce" }, { n: "Peanuts", c: "nuts" }, { n: "Curry leaves", c: "produce" }, { n: "Oil", c: "cooking" }],
    recipe: [
      "Rinse poha briefly until soft; drain.",
      "Temper mustard, curry leaves & onion in oil; add peas & turmeric.",
      "Fold in poha, salt & lemon; top with roasted peanuts.",
    ],
  },
  {
    id: "bf-tofu-scramble", slot: "breakfast", name: "Tofu bhurji + toast", icon: "🍳",
    protein: 20, prep: 15, cook: "sear", pack: false, cuisine: "indian",
    contains: ["tofu", "soy", "gluten"], wellness: ["strength", "hair"],
    detail: "Crumbled tofu · onion-tomato-capsicum · turmeric · whole-wheat toast",
    items: [{ n: "Firm tofu", c: "protein" }, { n: "Onion", c: "produce" }, { n: "Capsicum", c: "produce" }, { n: "Whole-wheat bread", c: "grain" }, { n: "Oil", c: "cooking" }],
  },
  {
    id: "bf-egg-bhurji", slot: "breakfast", name: "Egg bhurji + toast", icon: "🍳",
    protein: 22, prep: 12, cook: "cook", pack: false, cuisine: "indian",
    contains: ["egg", "gluten"], wellness: ["strength"],
    detail: "Eggs · onion-tomato-chilli · whole-wheat toast",
    items: [{ n: "Eggs", c: "protein" }, { n: "Onion", c: "produce" }, { n: "Tomato", c: "produce" }, { n: "Whole-wheat bread", c: "grain" }, { n: "Oil", c: "cooking" }],
  },

  /* ---------------- LUNCH ---------------- */
  {
    id: "ln-rajma-rice", slot: "lunch", name: "Rajma–brown rice bowl + curd", icon: "🍱",
    protein: 24, prep: 10, cook: "none", pack: true, cuisine: "indian",
    contains: ["curd"], wellness: ["strength", "energy", "digestion"],
    detail: "Canned rajma · brown rice · cucumber-tomato kachumber · side curd",
    items: [{ n: "Canned rajma", c: "protein" }, { n: "Brown rice", c: "grain" }, { n: "Cucumber", c: "produce" }, { n: "Tomato", c: "produce" }, { n: "Curd", c: "dairy" }],
  },
  {
    id: "ln-hummus-mezze", slot: "lunch", name: "Hummus–chickpea mezze bowl", icon: "🥙",
    protein: 22, prep: 12, cook: "none", pack: true, cuisine: "mezze",
    contains: ["gluten", "seeds"], wellness: ["skin", "digestion", "strength"],
    detail: "Chickpeas · hummus · couscous · cucumber · olives · parsley · lemon",
    items: [{ n: "Canned chickpeas", c: "protein" }, { n: "Hummus", c: "protein" }, { n: "Couscous", c: "grain" }, { n: "Cucumber", c: "produce" }, { n: "Olives", c: "pantry" }],
  },
  {
    id: "ln-paneer-frankie", slot: "lunch", name: "Paneer Frankie + roasted chana", icon: "🌯",
    protein: 26, prep: 12, cook: "sear", pack: true, cuisine: "indian",
    contains: ["paneer", "gluten"], wellness: ["strength"],
    detail: "Whole-wheat roll · paneer · onion-capsicum · mint chutney · side roasted chana",
    items: [{ n: "Whole-wheat wraps/rolls", c: "grain" }, { n: "Paneer", c: "protein" }, { n: "Capsicum", c: "produce" }, { n: "Roasted chana", c: "protein" }, { n: "Mint chutney", c: "pantry" }],
  },
  {
    id: "ln-burrito-bowl", slot: "lunch", name: "Burrito bowl", icon: "🌮",
    protein: 24, prep: 12, cook: "none", pack: true, cuisine: "mexican",
    contains: ["curd"], wellness: ["strength", "energy"],
    detail: "Black beans / rajma · rice · corn · salsa · curd-crema · avocado · sprouts",
    items: [{ n: "Canned black beans", c: "protein" }, { n: "Brown rice", c: "grain" }, { n: "Frozen corn", c: "pantry" }, { n: "Salsa", c: "pantry" }, { n: "Avocado", c: "produce" }],
  },
  {
    id: "ln-chickpea-paneer-jar", slot: "lunch", name: "Chickpea-paneer jar salad", icon: "🫙",
    protein: 26, prep: 10, cook: "none", pack: true, cuisine: "mezze",
    contains: ["paneer"], wellness: ["skin", "strength"],
    detail: "Chickpeas · paneer cubes · cucumber · tomato · olives · lemon-olive oil",
    items: [{ n: "Canned chickpeas", c: "protein" }, { n: "Paneer", c: "protein" }, { n: "Cucumber", c: "produce" }, { n: "Tomato", c: "produce" }, { n: "Olive oil", c: "pantry" }],
  },
  {
    id: "ln-curd-rice", slot: "lunch", name: "Curd-rice + peanuts + chickpea sundal", icon: "🍚",
    protein: 22, prep: 10, cook: "none", pack: true, cuisine: "indian",
    contains: ["curd", "peanut"], wellness: ["digestion", "energy"],
    detail: "Curd-rice · roasted peanuts · chickpea sundal · curry-leaf tadka (optional)",
    items: [{ n: "Brown rice", c: "grain" }, { n: "Curd", c: "dairy" }, { n: "Peanuts", c: "nuts" }, { n: "Canned chickpeas", c: "protein" }],
  },
  {
    id: "ln-quinoa-rajma", slot: "lunch", name: "Quinoa-rajma power bowl", icon: "🥗",
    protein: 24, prep: 12, cook: "none", pack: true, cuisine: "global",
    contains: [], wellness: ["strength", "energy", "hair"],
    detail: "Quinoa · rajma · kachumber · lemon · olive oil",
    items: [{ n: "Quinoa", c: "grain" }, { n: "Canned rajma", c: "protein" }, { n: "Cucumber", c: "produce" }, { n: "Tomato", c: "produce" }, { n: "Olive oil", c: "pantry" }],
  },
  {
    id: "ln-peanut-noodle", slot: "lunch", name: "Peanut noodle jar (paneer + veg)", icon: "🍜",
    protein: 22, prep: 12, cook: "none", pack: true, cuisine: "thai",
    contains: ["paneer", "peanut", "gluten", "soy"], wellness: ["energy"],
    detail: "Noodles · paneer · carrot-cabbage · peanut-soy dressing · lime",
    items: [{ n: "Noodles", c: "grain" }, { n: "Paneer", c: "protein" }, { n: "Carrots", c: "produce" }, { n: "Peanut butter", c: "pantry" }, { n: "Soy sauce", c: "pantry" }],
  },
  {
    id: "ln-sprout-chickpea", slot: "lunch", name: "Sprout & chickpea salad jar", icon: "🫙",
    protein: 20, prep: 10, cook: "none", pack: true, cuisine: "indian",
    contains: ["seeds"], wellness: ["hair", "digestion", "skin"],
    detail: "Sprouts · chickpeas · cucumber · pomegranate · lemon-olive oil · seeds",
    items: [{ n: "Sprouting moong", c: "produce" }, { n: "Canned chickpeas", c: "protein" }, { n: "Pomegranate", c: "produce" }, { n: "Mixed seeds", c: "nuts" }, { n: "Olive oil", c: "pantry" }],
  },
  {
    id: "ln-kathi-roll", slot: "lunch", name: "Paneer kathi roll + carrot salad", icon: "🌯",
    protein: 24, prep: 12, cook: "sear", pack: true, cuisine: "indian",
    contains: ["paneer", "gluten"], wellness: ["strength"],
    detail: "Whole-wheat roll · paneer tikka · onion · carrot-cabbage salad · mint",
    items: [{ n: "Whole-wheat wraps/rolls", c: "grain" }, { n: "Paneer", c: "protein" }, { n: "Carrots", c: "produce" }, { n: "Onion", c: "produce" }, { n: "Tikka masala / paste", c: "pantry" }],
  },
  {
    id: "ln-soba-tofu", slot: "lunch", name: "Soba-tofu peanut jar", icon: "🍜",
    protein: 22, prep: 12, cook: "none", pack: true, cuisine: "thai",
    contains: ["tofu", "soy", "peanut", "gluten"], wellness: ["energy"],
    detail: "Soba · tofu · edamame · carrot · peanut-sesame dressing",
    items: [{ n: "Soba noodles", c: "grain" }, { n: "Firm tofu", c: "protein" }, { n: "Carrots", c: "produce" }, { n: "Peanut butter", c: "pantry" }, { n: "Soy sauce", c: "pantry" }],
  },
  {
    id: "ln-chole-chaat", slot: "lunch", name: "Chole-chana chaat bowl", icon: "🥗",
    protein: 22, prep: 10, cook: "none", pack: true, cuisine: "indian",
    contains: ["curd"], wellness: ["digestion", "strength"],
    detail: "Canned chickpeas · onion-tomato · curd · pomegranate · chaat masala",
    items: [{ n: "Canned chickpeas", c: "protein" }, { n: "Onion", c: "produce" }, { n: "Tomato", c: "produce" }, { n: "Curd", c: "dairy" }, { n: "Chaat masala", c: "pantry" }],
  },
  {
    id: "ln-palak-paneer", slot: "lunch", name: "Palak paneer + jeera rice", icon: "🍛",
    protein: 28, prep: 35, cook: "cook", pack: true, cuisine: "indian",
    contains: ["paneer", "curd"], wellness: ["strength", "immunity", "hair"],
    detail: "Spinach · paneer · onion-tomato-garlic · jeera rice",
    items: [{ n: "Spinach (1 bunch)", c: "produce" }, { n: "Paneer", c: "protein" }, { n: "Brown rice", c: "grain" }, { n: "Onion", c: "produce" }, { n: "Ghee", c: "cooking" }],
    recipe: [
      "Blanch spinach 2 min, then blend to a purée.",
      "Sauté onion, ginger-garlic & tomato; add cumin and garam masala.",
      "Add purée, simmer 5 min, fold in paneer; finish with a spoon of curd.",
      "Serve with jeera rice.",
    ],
  },
  {
    id: "ln-thai-curry", slot: "lunch", name: "Thai red curry (veg + paneer) + rice", icon: "🍛",
    protein: 26, prep: 35, cook: "cook", pack: false, cuisine: "thai",
    contains: ["paneer"], wellness: ["immunity", "energy"],
    detail: "Red curry paste · coconut milk · mixed veg · paneer · steamed rice",
    items: [{ n: "Thai red curry paste", c: "pantry" }, { n: "Coconut milk", c: "pantry" }, { n: "Paneer", c: "protein" }, { n: "Capsicum", c: "produce" }, { n: "Brown rice", c: "grain" }],
    recipe: [
      "Sauté curry paste in oil until fragrant.",
      "Add coconut milk; bring to a gentle simmer.",
      "Add chopped veg & paneer; simmer 8–10 min.",
      "Finish with lime & basil; serve over rice.",
    ],
  },
  {
    id: "ln-veg-pulao", slot: "lunch", name: "Veg pulao + paneer raita", icon: "🍚",
    protein: 22, prep: 30, cook: "cook", pack: true, cuisine: "indian",
    contains: ["paneer", "curd"], wellness: ["energy"],
    detail: "Rice · mixed veg · whole spices · paneer raita",
    items: [{ n: "Brown rice", c: "grain" }, { n: "Mixed veg", c: "produce" }, { n: "Paneer", c: "protein" }, { n: "Curd", c: "dairy" }, { n: "Ghee", c: "cooking" }],
    recipe: [
      "Sauté whole spices & onion in ghee; add chopped veg.",
      "Add rinsed rice + water (1:1.75); cook until done.",
      "Serve with paneer raita (curd + grated paneer + roasted cumin).",
    ],
  },

  /* ---------------- DINNER (early) ---------------- */
  {
    id: "dn-paneer-chaat", slot: "dinner", name: "Paneer & sprout chaat box", icon: "🥗",
    protein: 24, prep: 12, cook: "sear", pack: true, cuisine: "indian",
    contains: ["paneer"], wellness: ["strength", "digestion"],
    detail: "Paneer (raw or AM-seared) · sprouts · onion-tomato · lemon · chaat masala",
    items: [{ n: "Paneer", c: "protein" }, { n: "Sprouting moong", c: "produce" }, { n: "Onion", c: "produce" }, { n: "Chaat masala", c: "pantry" }],
  },
  {
    id: "dn-chickpea-paneer-box", slot: "dinner", name: "Chickpea-paneer salad box", icon: "🥗",
    protein: 22, prep: 10, cook: "none", pack: true, cuisine: "mezze",
    contains: ["paneer", "peanut"], wellness: ["skin", "strength"],
    detail: "Chickpeas · paneer cubes · cucumber-tomato · peanuts · lemon-olive oil",
    items: [{ n: "Canned chickpeas", c: "protein" }, { n: "Paneer", c: "protein" }, { n: "Cucumber", c: "produce" }, { n: "Peanuts", c: "nuts" }, { n: "Olive oil", c: "pantry" }],
  },
  {
    id: "dn-sprout-bhel", slot: "dinner", name: "Sprout-peanut bhel + curd", icon: "🥗",
    protein: 22, prep: 8, cook: "none", pack: true, cuisine: "indian",
    contains: ["curd", "peanut"], wellness: ["digestion", "hair"],
    detail: "Sprouts · roasted peanuts · onion-tomato-cucumber · lemon · sev · side curd",
    items: [{ n: "Sprouting moong", c: "produce" }, { n: "Peanuts", c: "nuts" }, { n: "Sev (light)", c: "pantry" }, { n: "Curd", c: "dairy" }],
  },
  {
    id: "dn-paneer-tikka-box", slot: "dinner", name: "Paneer tikka box + lettuce", icon: "🥬",
    protein: 22, prep: 12, cook: "sear", pack: true, cuisine: "indian",
    contains: ["paneer", "curd"], wellness: ["strength"],
    detail: "Paneer tikka (sear in the AM) · lettuce · onion · cucumber · mint-curd dip",
    items: [{ n: "Paneer", c: "protein" }, { n: "Lettuce", c: "produce" }, { n: "Tikka masala / paste", c: "pantry" }, { n: "Curd", c: "dairy" }],
  },
  {
    id: "dn-chickpea-avo-wrap", slot: "dinner", name: "Smashed chickpea-avocado wrap + curd", icon: "🌯",
    protein: 21, prep: 10, cook: "none", pack: true, cuisine: "global",
    contains: ["gluten", "curd"], wellness: ["skin", "digestion"],
    detail: "Mashed chickpea · avocado · lemon · whole-wheat wrap · side curd",
    items: [{ n: "Canned chickpeas", c: "protein" }, { n: "Avocado", c: "produce" }, { n: "Whole-wheat wraps/rolls", c: "grain" }, { n: "Curd", c: "dairy" }],
  },
  {
    id: "dn-raita-bowl", slot: "dinner", name: "Curd-cucumber raita bowl + roasted chana", icon: "🥣",
    protein: 20, prep: 8, cook: "none", pack: true, cuisine: "indian",
    contains: ["curd"], wellness: ["digestion", "strength"],
    detail: "Thick curd · cucumber · roasted cumin · roasted chana · seeds",
    items: [{ n: "Greek yogurt", c: "dairy" }, { n: "Cucumber", c: "produce" }, { n: "Roasted chana", c: "protein" }, { n: "Mixed seeds", c: "nuts" }],
  },
  {
    id: "dn-paneer-lettuce", slot: "dinner", name: "Paneer-veg lettuce wraps", icon: "🥬",
    protein: 22, prep: 10, cook: "sear", pack: false, cuisine: "global",
    contains: ["paneer"], wellness: ["strength"],
    detail: "Seared paneer · lettuce cups · onion-capsicum · mint-curd dip",
    items: [{ n: "Paneer", c: "protein" }, { n: "Lettuce", c: "produce" }, { n: "Capsicum", c: "produce" }],
  },
  {
    id: "dn-hummus-bowl", slot: "dinner", name: "Hummus-veg bowl + seeds", icon: "🥗",
    protein: 18, prep: 8, cook: "none", pack: true, cuisine: "mezze",
    contains: ["seeds"], wellness: ["skin", "digestion"],
    detail: "Hummus · cucumber-tomato · olives · sprouts · seeds · pita",
    items: [{ n: "Hummus", c: "protein" }, { n: "Cucumber", c: "produce" }, { n: "Pita", c: "grain" }, { n: "Mixed seeds", c: "nuts" }],
  },
  {
    id: "dn-tofu-rolls", slot: "dinner", name: "Tofu rice-paper rolls + peanut dip", icon: "🌯",
    protein: 22, prep: 15, cook: "none", pack: false, cuisine: "thai",
    contains: ["tofu", "soy", "peanut"], wellness: ["energy"],
    detail: "Tofu · rice paper · carrot · cucumber · mint · peanut dip",
    items: [{ n: "Firm tofu", c: "protein" }, { n: "Rice paper sheets", c: "grain" }, { n: "Carrots", c: "produce" }, { n: "Peanut butter", c: "pantry" }],
  },
  {
    id: "dn-rajma-box", slot: "dinner", name: "Rajma-veg salad box", icon: "🥗",
    protein: 20, prep: 10, cook: "none", pack: true, cuisine: "indian",
    contains: [], wellness: ["strength", "energy"],
    detail: "Canned rajma · cucumber-tomato-onion · corn · lemon · olive oil",
    items: [{ n: "Canned rajma", c: "protein" }, { n: "Cucumber", c: "produce" }, { n: "Frozen corn", c: "pantry" }, { n: "Olive oil", c: "pantry" }],
  },
  {
    id: "dn-dal-tadka", slot: "dinner", name: "Dal tadka + roti + raita", icon: "🍲",
    protein: 22, prep: 30, cook: "cook", pack: false, cuisine: "indian",
    contains: ["curd", "gluten"], wellness: ["strength", "digestion"],
    detail: "Toor/moong dal · tomato-onion · garlic-cumin tadka · roti · cucumber raita",
    items: [{ n: "Toor dal", c: "protein" }, { n: "Whole-wheat atta", c: "grain" }, { n: "Curd", c: "dairy" }, { n: "Ghee", c: "cooking" }],
    recipe: [
      "Pressure-cook ½ cup dal with turmeric & salt until soft.",
      "Tadka: heat ghee, splutter cumin, add garlic, dry chilli & a pinch of hing; pour over dal.",
      "Simmer 5 min. Serve with roti & cucumber raita.",
    ],
  },
  {
    id: "dn-khichdi", slot: "dinner", name: "Moong dal khichdi + curd", icon: "🍚",
    protein: 22, prep: 30, cook: "cook", pack: false, cuisine: "indian",
    contains: ["curd"], wellness: ["digestion", "strength"],
    detail: "Rice + moong dal · cumin-ghee tadka · curd · roasted papad",
    items: [{ n: "Moong dal", c: "protein" }, { n: "Brown rice", c: "grain" }, { n: "Curd", c: "dairy" }, { n: "Ghee", c: "cooking" }, { n: "Papad", c: "pantry" }],
    recipe: [
      "Rinse ½ cup rice + ⅓ cup moong dal; pressure-cook with turmeric, salt & 3 cups water.",
      "Temper cumin & a pinch of hing in ghee; stir through.",
      "Serve with curd and a roasted papad.",
    ],
  },
  {
    id: "dn-stirfry-paneer", slot: "dinner", name: "Paneer-veg stir-fry + rice", icon: "🥘",
    protein: 24, prep: 20, cook: "cook", pack: false, cuisine: "thai",
    contains: ["paneer", "soy"], wellness: ["strength", "energy"],
    detail: "Paneer · capsicum-broccoli-carrot · soy-garlic · steamed rice",
    items: [{ n: "Paneer", c: "protein" }, { n: "Capsicum", c: "produce" }, { n: "Carrots", c: "produce" }, { n: "Soy sauce", c: "pantry" }, { n: "Brown rice", c: "grain" }],
    recipe: [
      "Sear paneer cubes in 1 tsp oil; set aside.",
      "Stir-fry garlic + chopped veg on high heat 4–5 min.",
      "Return paneer, add soy-garlic sauce; toss 1 min. Serve over rice.",
    ],
  },
  {
    id: "dn-chana-masala", slot: "dinner", name: "Chana masala + rice", icon: "🍲",
    protein: 22, prep: 30, cook: "cook", pack: false, cuisine: "indian",
    contains: [], wellness: ["strength", "digestion"],
    detail: "Chickpeas · onion-tomato masala · steamed rice · onion-lemon",
    items: [{ n: "Canned chickpeas", c: "protein" }, { n: "Onion", c: "produce" }, { n: "Tomato", c: "produce" }, { n: "Brown rice", c: "grain" }, { n: "Oil", c: "cooking" }],
    recipe: [
      "Sauté onion, ginger-garlic & tomato; add chana masala spices.",
      "Add chickpeas + a little water; simmer 10 min.",
      "Finish with lemon & coriander; serve with rice.",
    ],
  },

  /* ---------------- SNACK / BOOSTER (no-cook protein top-ups) ---------------- */
  { id: "sn-roasted-chana", slot: "snack", name: "Roasted chana", icon: "🫘", protein: 6, prep: 1, cook: "none", pack: true, cuisine: "indian", contains: [], wellness: ["strength"], detail: "A handful of roasted chana", items: [{ n: "Roasted chana", c: "protein" }] },
  { id: "sn-yogurt-cup", slot: "snack", name: "Greek yogurt cup", icon: "🥛", protein: 16, prep: 1, cook: "none", pack: true, cuisine: "global", contains: ["curd"], wellness: ["strength", "digestion"], detail: "1 cup Greek yogurt", items: [{ n: "Greek yogurt", c: "dairy" }] },
  { id: "sn-trail-mix", slot: "snack", name: "Peanut & seed trail mix", icon: "🥜", protein: 8, prep: 1, cook: "none", pack: true, cuisine: "global", contains: ["peanut", "seeds", "nuts"], wellness: ["hair", "skin"], detail: "Peanuts + pumpkin/sunflower seeds", items: [{ n: "Peanuts", c: "nuts" }, { n: "Pumpkin seeds", c: "nuts" }] },
  { id: "sn-hummus-sticks", slot: "snack", name: "Hummus + veg sticks", icon: "🥕", protein: 5, prep: 3, cook: "none", pack: true, cuisine: "mezze", contains: ["seeds"], wellness: ["digestion", "skin"], detail: "Hummus with carrot & cucumber sticks", items: [{ n: "Hummus", c: "protein" }, { n: "Carrots", c: "produce" }] },
  { id: "sn-whey", slot: "snack", name: "Whey protein shake", icon: "🥤", protein: 24, prep: 2, cook: "none", pack: false, cuisine: "global", contains: ["dairy"], wellness: ["strength"], detail: "1 scoop whey blended with milk/water", items: [{ n: "Whey (optional)", c: "protein" }] },
  { id: "sn-sattu-drink", slot: "snack", name: "Sattu drink", icon: "🥤", protein: 12, prep: 3, cook: "none", pack: true, cuisine: "indian", contains: [], wellness: ["energy", "strength"], detail: "Sattu + water + lemon + roasted cumin", items: [{ n: "Sattu (roasted gram flour)", c: "protein" }] },
];

/* ---- Assembly techniques (static; shown filtered by what's relevant) ---- */
export const TIPS = [
  { id: "rice-paper", title: "Roll rice paper", icon: "🌯", needs: ["rice paper sheets"], steps: ["Dip one sheet in warm water 8–10 sec until just pliable.", "Lay flat, add fillings in a line just below center — keep it lean.", "Fold bottom up, fold in both sides, then roll tight.", "Serve seam-down; don't stack touching or they stick."] },
  { id: "peanut-dip", title: "30-second peanut dip", icon: "🥜", needs: [], steps: ["2 tbsp peanut butter + 1 tbsp soy sauce + 1 tsp lemon.", "Loosen with warm water until pourable.", "Optional: chilli flakes + grated ginger."] },
  { id: "paneer-sear", title: "5-minute paneer sear", icon: "🔥", needs: [], steps: ["Cube paneer, pat dry. Hot pan, ½ tsp oil.", "Sear 2 min undisturbed, flip, 2 min more.", "Toss with chaat or tikka masala off heat."] },
  { id: "tiffin", title: "Tiffin that holds", icon: "🍱", needs: [], steps: ["Office day? Pack two boxes — lunch and an early dinner — and eat dinner by your cutoff at work.", "Pack dressing separate; add at desk to keep crunch.", "Grain + bean bowls reheat best; salads stay raw & cool.", "Layer wet at bottom, greens on top in jar salads."] },
  { id: "boost", title: "No-cook protein boost", icon: "💪", needs: [], steps: ["Short? Add a curd/Greek-yogurt cup (+16g) or roasted chana (+6g).", "Blend whey or extra yogurt into a smoothie.", "Sprinkle hemp/pumpkin seeds on bowls (+5g)."] },
  { id: "sprout", title: "Sprout at home", icon: "🌱", needs: [], steps: ["Soak moong overnight, drain, rinse.", "Keep in a loosely-covered jar; rinse morning & night.", "Ready in 1–2 days. No cooking needed."] },
];

/* ---- Build-your-own matrix source (engine filters by diet) ---- */
export const BUILD = {
  formatHint: "Wrap it, bowl it, or roll it — same parts, new meal.",
  columns: [
    { key: "base", label: "Base", options: [
      { name: "Brown rice", p: 5, contains: [] }, { name: "Couscous", p: 6, contains: ["gluten"] },
      { name: "Quinoa", p: 8, contains: [] }, { name: "Whole-wheat wrap", p: 7, contains: ["gluten"] },
      { name: "Toast (2 slices)", p: 8, contains: ["gluten"] }, { name: "Lettuce cups", p: 1, contains: [] },
      { name: "Overnight oats", p: 6, contains: [] } ] },
    { key: "protein", label: "Protein", options: [
      { name: "Paneer 80g", p: 15, contains: ["paneer"] }, { name: "Tofu 120g", p: 17, contains: ["tofu", "soy"] },
      { name: "Chickpeas 1 cup", p: 15, contains: [] }, { name: "Rajma 1 cup", p: 15, contains: [] },
      { name: "Greek yogurt 1 cup", p: 16, contains: ["curd"] }, { name: "Sprouts 1 cup", p: 12, contains: [] },
      { name: "Hummus 3 tbsp", p: 5, contains: [] }, { name: "Roasted chana 30g", p: 6, contains: [] } ] },
    { key: "veg", label: "Veg / crunch", options: [
      { name: "Cucumber-tomato", p: 2, contains: [] }, { name: "Onion-capsicum", p: 2, contains: [] },
      { name: "Carrot ribbons", p: 1, contains: [] }, { name: "Avocado", p: 2, contains: [] },
      { name: "Pomegranate", p: 1, contains: [] }, { name: "Sprouts handful", p: 4, contains: [] },
      { name: "Olives", p: 1, contains: [] } ] },
    { key: "dressing", label: "Dressing", options: [
      { name: "Peanut dip", p: 4, contains: ["peanut"] }, { name: "Mint-curd", p: 3, contains: ["curd"] },
      { name: "Lemon-olive oil", p: 0, contains: [] }, { name: "Hummus smear", p: 3, contains: [] },
      { name: "Chaat masala + lemon", p: 0, contains: [] }, { name: "Salsa", p: 1, contains: [] },
      { name: "Tahini drizzle", p: 2, contains: ["seeds"] }, { name: "Soy-sesame", p: 1, contains: ["soy"] } ] },
  ],
};
