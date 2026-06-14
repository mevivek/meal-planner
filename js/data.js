/* ============================================================
   Graze — 7-day no-cook vegetarian plan
   All plan content lives here as structured data so the UI
   can render it, filter it, and stay interactive.
   Protein values are approximate (grams), tuned to ~60–80g/day.
   ============================================================ */

const PLAN = {
  profile: {
    name: "Graze",
    tagline: "Eat clean. Never cook.",
    chips: ["27 • maintain", "Pure veg", "No egg · no cheese", "Assembly-only", "10–15 min meals"],
    proteinTarget: "60–80g / day",
  },

  /* ---- Mon–Sun day-by-day chart ---- */
  days: [
    {
      key: "mon",
      label: "Mon",
      full: "Monday",
      mode: "office",
      total: 74,
      meals: [
        {
          slot: "Breakfast",
          icon: "🥣",
          name: "PB-banana overnight oats",
          detail: "½ cup oats · 1 cup Greek yogurt · 1 tbsp chia · 1 tbsp peanut butter · banana",
          time: "5 min night before",
          protein: 26,
          tag: "No-cook",
        },
        {
          slot: "Lunch",
          icon: "🍱",
          name: "Rajma–brown rice bowl",
          detail: "Canned rajma · ¾ cup brown rice · cucumber-tomato kachumber · side curd cup",
          time: "10 min",
          protein: 24,
          tag: "Packs · reheats",
        },
        {
          slot: "Dinner",
          icon: "🥗",
          name: "Seared paneer & sprout chaat",
          detail: "80g paneer (5-min sear) · ½ cup sprouts · onion-tomato · lemon · chaat masala",
          time: "12 min",
          protein: 24,
          tag: "Light · 5-min sear",
        },
      ],
    },
    {
      key: "tue",
      label: "Tue",
      full: "Tuesday",
      mode: "wfh",
      total: 72,
      meals: [
        {
          slot: "Breakfast",
          icon: "🥤",
          name: "Berry-yogurt smoothie bowl",
          detail: "1 cup Greek yogurt · frozen berries · 1 tbsp PB · 2 tbsp pumpkin seeds · 2 tbsp oats",
          time: "7 min",
          protein: 28,
          tag: "No-cook",
        },
        {
          slot: "Lunch",
          icon: "🥙",
          name: "Hummus–chickpea mezze bowl",
          detail: "1 cup chickpeas · 3 tbsp hummus · couscous · cucumber · olives · parsley · lemon",
          time: "12 min",
          protein: 22,
          tag: "Fresh-assembled",
        },
        {
          slot: "Dinner",
          icon: "🌯",
          name: "Tofu rice-paper rolls + peanut dip",
          detail: "120g tofu · rice paper · carrot · cucumber · mint · quick peanut dip",
          time: "15 min",
          protein: 22,
          tag: "Light · no-cook",
        },
      ],
    },
    {
      key: "wed",
      label: "Wed",
      full: "Wednesday",
      mode: "office",
      total: 72,
      meals: [
        {
          slot: "Breakfast",
          icon: "🍯",
          name: "Greek yogurt granola parfait",
          detail: "1 cup Greek yogurt · granola · 2 tbsp mixed seeds · fruit · drizzle honey",
          time: "5 min",
          protein: 24,
          tag: "No-cook",
        },
        {
          slot: "Lunch",
          icon: "🌯",
          name: "Paneer Frankie + roasted chana",
          detail: "Whole-wheat roll · 80g paneer (5-min sear) · onion-capsicum · mint chutney · side roasted chana",
          time: "12 min",
          protein: 26,
          tag: "Packs · hold",
        },
        {
          slot: "Dinner",
          icon: "🥗",
          name: "Sprout-peanut bhel + curd",
          detail: "Sprouts · roasted peanuts · onion-tomato-cucumber · lemon · sev-light · side curd",
          time: "8 min",
          protein: 22,
          tag: "Light · no-cook",
        },
      ],
    },
    {
      key: "thu",
      label: "Thu",
      full: "Thursday",
      mode: "wfh",
      total: 68,
      meals: [
        {
          slot: "Breakfast",
          icon: "🥑",
          name: "Avocado-hummus toast + yogurt",
          detail: "2 slices whole-wheat toast · hummus · avocado · tomato · seeds · ½ cup Greek yogurt",
          time: "8 min",
          protein: 22,
          tag: "Toast only",
        },
        {
          slot: "Lunch",
          icon: "🌮",
          name: "Burrito bowl",
          detail: "Canned rajma/black beans · rice · corn · salsa · curd-crema · sprouts · avocado",
          time: "12 min",
          protein: 24,
          tag: "Fresh-assembled",
        },
        {
          slot: "Dinner",
          icon: "🥬",
          name: "Paneer tikka lettuce wraps",
          detail: "80g paneer (5-min sear in tikka masala) · lettuce cups · onion · mint-curd dip",
          time: "12 min",
          protein: 22,
          tag: "Light · 5-min sear",
        },
      ],
    },
    {
      key: "fri",
      label: "Fri",
      full: "Friday",
      mode: "office",
      total: 72,
      meals: [
        {
          slot: "Breakfast",
          icon: "🥣",
          name: "Mango-seed overnight oats",
          detail: "½ cup oats · 1 cup Greek yogurt · mango/banana · 2 tbsp mixed seeds · cardamom",
          time: "5 min night before",
          protein: 25,
          tag: "No-cook",
        },
        {
          slot: "Lunch",
          icon: "🫙",
          name: "Chickpea-paneer jar salad",
          detail: "1 cup chickpeas · 60g paneer cubes · cucumber · tomato · olives · lemon-olive oil",
          time: "10 min",
          protein: 26,
          tag: "Packs · no reheat",
        },
        {
          slot: "Dinner",
          icon: "🌯",
          name: "Smashed chickpea-avocado wrap + curd",
          detail: "Mashed chickpea · avocado · lemon · whole-wheat wrap · side curd",
          time: "10 min",
          protein: 21,
          tag: "Light · no-cook",
        },
      ],
    },
    {
      key: "sat",
      label: "Sat",
      full: "Saturday",
      mode: "off",
      total: 74,
      meals: [
        {
          slot: "Breakfast",
          icon: "🥤",
          name: "Loaded protein smoothie",
          detail: "Greek yogurt · banana · 1 tbsp PB · milk · 2 tbsp oats · 1 tbsp seeds",
          time: "7 min",
          protein: 28,
          tag: "No-cook",
        },
        {
          slot: "Lunch",
          icon: "🥗",
          name: "Chole-chana chaat bowl",
          detail: "Canned chickpeas · onion-tomato · curd · pomegranate · chaat masala · sev-light",
          time: "10 min",
          protein: 22,
          tag: "Fresh-assembled",
        },
        {
          slot: "Dinner",
          icon: "🌯",
          name: "Paneer bhurji wrap",
          detail: "80g paneer crumbled & seared 5 min · onion-tomato-capsicum · roti/wrap",
          time: "12 min",
          protein: 24,
          tag: "Light · 5-min sear",
        },
      ],
    },
    {
      key: "sun",
      label: "Sun",
      full: "Sunday",
      mode: "off",
      total: 70,
      meals: [
        {
          slot: "Breakfast",
          icon: "🍯",
          name: "Curd parfait + granola",
          detail: "1 cup curd/Greek yogurt · granola · walnuts · seasonal fruit · seeds",
          time: "5 min",
          protein: 24,
          tag: "No-cook",
        },
        {
          slot: "Lunch",
          icon: "🫓",
          name: "Mezze platter",
          detail: "Hummus · 120g tofu (5-min sear) · pita · olives · cucumber-tomato salad · pickle",
          time: "15 min",
          protein: 24,
          tag: "Fresh-assembled",
        },
        {
          slot: "Dinner",
          icon: "🥗",
          name: "Sprout-paneer salad bowl + curd",
          detail: "Sprouts · 60g paneer · cucumber · pomegranate · peanuts · lemon · side curd",
          time: "10 min",
          protein: 22,
          tag: "Light · no-cook",
        },
      ],
    },
  ],

  /* ---- No-cook protein shelf ---- */
  shelf: [
    { item: "Paneer", note: "Sear 5 min or cube raw", protein: "≈18g / 100g" },
    { item: "Tofu (firm)", note: "Rolls, bowls, quick sear", protein: "≈14g / 100g" },
    { item: "Greek yogurt / curd", note: "Bowls, dips, smoothies", protein: "≈16g / cup" },
    { item: "Canned chickpeas", note: "Rinse & toss", protein: "≈15g / cup" },
    { item: "Canned rajma / beans", note: "Rinse & toss", protein: "≈15g / cup" },
    { item: "Sprouts (moong)", note: "Raw or quick-steam", protein: "≈12g / cup" },
    { item: "Roasted chana", note: "Snack / crunch topping", protein: "≈6g / 30g" },
    { item: "Peanuts & seeds", note: "Pumpkin, sunflower, hemp", protein: "≈7g / 30g" },
    { item: "Peanut butter", note: "Oats, smoothies, dips", protein: "≈7g / 2 tbsp" },
    { item: "Hummus", note: "Spread / bowl base", protein: "≈3g / 2 tbsp" },
    { item: "Whey (optional)", note: "Blend into smoothies", protein: "≈24g / scoop" },
  ],

  /* ---- Weekly grocery list, grouped ---- */
  grocery: [
    {
      group: "Fridge proteins",
      items: ["Paneer (≈500g block)", "Firm tofu (2 packs)", "Greek yogurt (large tub)", "Curd (large tub)"],
    },
    {
      group: "Pantry proteins",
      items: ["Canned chickpeas ×3", "Canned rajma / black beans ×2", "Roasted chana", "Peanuts", "Peanut butter", "Hummus tub", "Whey (optional)"],
    },
    {
      group: "Grains & wraps",
      items: ["Rolled oats", "Brown rice", "Couscous", "Whole-wheat wraps/rolls", "Whole-wheat bread", "Pita", "Rice paper sheets", "Granola"],
    },
    {
      group: "Fresh produce",
      items: ["Cucumbers", "Tomatoes", "Onions", "Capsicum", "Carrots", "Lettuce", "Avocados ×2", "Lemons", "Mint", "Parsley/coriander", "Bananas", "Seasonal fruit / berries", "Pomegranate", "Sprouting moong"],
    },
    {
      group: "Seeds & nuts",
      items: ["Pumpkin seeds", "Sunflower seeds", "Chia seeds", "Hemp seeds (optional)", "Walnuts"],
    },
    {
      group: "Flavour & extras",
      items: ["Chaat masala", "Tikka masala / paste", "Mint chutney", "Salsa", "Olives", "Olive oil", "Honey", "Pickle", "Sev (light)", "Soy sauce", "Frozen corn", "Frozen berries", "Milk"],
    },
  ],

  /* ---- Swap library (alternates per slot) ---- */
  swaps: [
    {
      slot: "Breakfast swaps",
      icon: "🥣",
      items: [
        "Chia-curd pudding + apple + roasted chana",
        "Savory yogurt bowl: curd + cucumber + roasted chana + seeds",
        "PB-banana toast + Greek yogurt side",
        "Muesli + milk + seeds + fruit",
        "Mango-tofu smoothie (silken tofu blended)",
        "Sprout & peanut breakfast chaat",
      ],
    },
    {
      slot: "Lunch swaps (tiffin-safe)",
      icon: "🍱",
      items: [
        "Curd-rice bowl + roasted peanuts + chickpea sundal",
        "Quinoa-rajma bowl + kachumber",
        "Hummus-falafel-free mezze box (chickpea + pita)",
        "Paneer kathi roll + carrot salad",
        "Soba/peanut noodle jar (tofu + veg)",
        "Sprout & chickpea salad jar + lemon-olive oil",
      ],
    },
    {
      slot: "Dinner swaps (light, late)",
      icon: "🥗",
      items: [
        "Tofu-veg rice-paper rolls + peanut dip",
        "Greek yogurt + cucumber raita bowl + roasted chana",
        "Paneer-veg lettuce wraps",
        "Smashed chickpea-avocado toast",
        "Sprout bhel + curd",
        "Hummus-veg bowl with seeds",
      ],
    },
  ],

  /* ---- Build-your-own matrix ---- */
  build: {
    columns: [
      {
        key: "base",
        label: "Base",
        options: [
          { name: "Brown rice", p: 5 },
          { name: "Couscous", p: 6 },
          { name: "Quinoa", p: 8 },
          { name: "Whole-wheat wrap", p: 7 },
          { name: "Toast (2 slices)", p: 8 },
          { name: "Rice paper", p: 2 },
          { name: "Lettuce cups", p: 1 },
          { name: "Oats (overnight)", p: 6 },
        ],
      },
      {
        key: "protein",
        label: "Protein",
        options: [
          { name: "Paneer 80g", p: 15 },
          { name: "Tofu 120g", p: 17 },
          { name: "Chickpeas 1 cup", p: 15 },
          { name: "Rajma 1 cup", p: 15 },
          { name: "Greek yogurt 1 cup", p: 16 },
          { name: "Sprouts 1 cup", p: 12 },
          { name: "Hummus 3 tbsp", p: 5 },
          { name: "Roasted chana 30g", p: 6 },
        ],
      },
      {
        key: "veg",
        label: "Veg / crunch",
        options: [
          { name: "Cucumber-tomato", p: 2 },
          { name: "Onion-capsicum", p: 2 },
          { name: "Carrot ribbons", p: 1 },
          { name: "Lettuce + mint", p: 1 },
          { name: "Avocado", p: 2 },
          { name: "Pomegranate", p: 1 },
          { name: "Sprouts handful", p: 4 },
          { name: "Olives", p: 1 },
        ],
      },
      {
        key: "dressing",
        label: "Dressing",
        options: [
          { name: "Peanut dip", p: 4 },
          { name: "Mint-curd", p: 3 },
          { name: "Lemon-olive oil", p: 0 },
          { name: "Hummus smear", p: 3 },
          { name: "Chaat masala + lemon", p: 0 },
          { name: "Salsa", p: 1 },
          { name: "Tahini drizzle", p: 2 },
          { name: "Soy-sesame", p: 1 },
        ],
      },
    ],
    formatHint: "Wrap it, bowl it, or roll it — same parts, new meal.",
  },

  /* ---- Assembly techniques ---- */
  tips: [
    {
      title: "Roll rice paper",
      icon: "🌯",
      steps: [
        "Dip one sheet in warm water 8–10 sec until just pliable (it keeps softening).",
        "Lay flat, add fillings in a line just below center — keep it lean.",
        "Fold bottom up over filling, fold in both sides, then roll tight.",
        "Serve seam-down; don't stack touching or they stick.",
      ],
    },
    {
      title: "30-second peanut dip",
      icon: "🥜",
      steps: [
        "2 tbsp peanut butter + 1 tbsp soy sauce + 1 tsp lemon.",
        "Loosen with warm water, 1 tsp at a time, until pourable.",
        "Optional: pinch chilli flakes + grated ginger.",
      ],
    },
    {
      title: "5-minute paneer sear",
      icon: "🔥",
      steps: [
        "Cube paneer, pat dry. Hot pan, ½ tsp oil.",
        "Sear 2 min undisturbed, flip, 2 min more.",
        "Toss with chaat or tikka masala off heat. Done.",
      ],
    },
    {
      title: "Tiffin that holds",
      icon: "🍱",
      steps: [
        "Pack dressing separate; add at desk to keep crunch.",
        "Grain + bean bowls reheat best; salads stay raw & cool.",
        "Layer wet at bottom, greens on top in jar salads.",
      ],
    },
    {
      title: "No-cook protein boost",
      icon: "💪",
      steps: [
        "Short on protein? Add a curd cup (+16g) or roasted chana (+6g).",
        "Blend whey or silken tofu into any smoothie.",
        "Sprinkle hemp/pumpkin seeds on bowls (+5g).",
      ],
    },
    {
      title: "Sprout at home",
      icon: "🌱",
      steps: [
        "Soak moong overnight, drain, rinse.",
        "Keep in a loosely-covered jar; rinse morning & night.",
        "Ready in 1–2 days. No cooking needed.",
      ],
    },
  ],
};
