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
          slot: "Early dinner",
          icon: "🥗",
          name: "Paneer & sprout chaat box",
          detail: "80g paneer (cube raw, or sear in the AM) · ½ cup sprouts · onion-tomato · lemon · chaat masala",
          time: "12 min",
          protein: 24,
          tag: "By 7–8pm · packs",
        },
      ],
    },
    {
      key: "tue",
      label: "Tue",
      full: "Tuesday",
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
          slot: "Early dinner",
          icon: "🥗",
          name: "Chickpea-paneer salad box",
          detail: "1 cup chickpeas · 80g paneer cubes · cucumber-tomato · peanuts · lemon-olive oil",
          time: "10 min",
          protein: 22,
          tag: "By 7–8pm · packs",
        },
      ],
    },
    {
      key: "wed",
      label: "Wed",
      full: "Wednesday",
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
          slot: "Early dinner",
          icon: "🥗",
          name: "Sprout-peanut bhel + curd",
          detail: "Sprouts · roasted peanuts · onion-tomato-cucumber · lemon · sev-light · side curd cup",
          time: "8 min",
          protein: 22,
          tag: "By 7–8pm · pack sev separately",
        },
      ],
    },
    {
      key: "thu",
      label: "Thu",
      full: "Thursday",
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
          slot: "Early dinner",
          icon: "🥬",
          name: "Paneer tikka box + lettuce",
          detail: "80g paneer tikka (sear in the AM) · lettuce · onion · cucumber · mint-curd dip",
          time: "12 min",
          protein: 22,
          tag: "By 7–8pm · packs",
        },
      ],
    },
    {
      key: "fri",
      label: "Fri",
      full: "Friday",
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
          slot: "Early dinner",
          icon: "🌯",
          name: "Smashed chickpea-avocado wrap + curd",
          detail: "Mashed chickpea · avocado · lemon · whole-wheat wrap · side curd cup",
          time: "10 min",
          protein: 21,
          tag: "By 7–8pm · packs",
        },
      ],
    },
    {
      key: "sat",
      label: "Sat",
      full: "Saturday",
      weekend: true,
      total: 74,
      meals: [
        {
          slot: "Breakfast",
          icon: "🥞",
          name: "Moong dal chilla + curd",
          detail: "Soaked moong dal · ginger-green chilli · onion · coriander · mint chutney · side curd",
          time: "25 min",
          protein: 24,
          tag: "Cooked · weekend",
          recipe: [
            "Blend ½ cup soaked moong dal with ginger, green chilli & a splash of water to a pourable batter; salt it.",
            "Stir in chopped onion and coriander.",
            "Pour a ladle onto a hot non-stick tawa, spread thin, drizzle ½ tsp oil; cook 2–3 min per side.",
            "Serve with mint chutney and a bowl of curd.",
          ],
        },
        {
          slot: "Lunch",
          icon: "🍛",
          name: "Palak paneer + jeera rice",
          detail: "Spinach · 100g paneer · onion-tomato-garlic · jeera rice",
          time: "35 min",
          protein: 28,
          tag: "Cooked · weekend",
          recipe: [
            "Blanch a big bunch of spinach 2 min, then blend to a purée.",
            "Sauté onion, ginger-garlic and tomato in 1 tsp oil; add cumin and garam masala.",
            "Add the spinach purée, simmer 5 min, fold in paneer cubes; finish with a spoon of curd.",
            "Serve with jeera rice (temper cumin in ghee, toss through cooked rice).",
          ],
        },
        {
          slot: "Early dinner",
          icon: "🍲",
          name: "Dal tadka + roti + raita",
          detail: "Toor/moong dal · tomato-onion · garlic-cumin tadka · roti · cucumber raita",
          time: "30 min",
          protein: 22,
          tag: "By 7–8pm · cooked at home",
          recipe: [
            "Pressure-cook ½ cup dal with turmeric and salt until soft.",
            "Make a tadka: heat ghee, splutter cumin, add garlic, a dry chilli and a pinch of hing; pour over the dal.",
            "Simmer 5 min. Serve with roti and a quick cucumber raita (curd + grated cucumber + roasted cumin).",
          ],
        },
      ],
    },
    {
      key: "sun",
      label: "Sun",
      full: "Sunday",
      weekend: true,
      total: 70,
      meals: [
        {
          slot: "Breakfast",
          icon: "🫓",
          name: "Paneer paratha + curd",
          detail: "Whole-wheat dough · grated paneer-onion-chilli filling · curd · pickle",
          time: "30 min",
          protein: 22,
          tag: "Cooked · weekend",
          recipe: [
            "Mix grated paneer with finely chopped onion, green chilli, coriander and salt.",
            "Stuff into a dough ball and roll gently into a paratha.",
            "Cook on a hot tawa with a little ghee, ~2 min per side until golden-spotted.",
            "Serve with chilled curd and pickle.",
          ],
        },
        {
          slot: "Lunch",
          icon: "🍛",
          name: "Thai red curry (veg + paneer) + rice",
          detail: "Thai red curry paste · coconut milk · mixed veg · 80g paneer · steamed rice",
          time: "35 min",
          protein: 26,
          tag: "Cooked · global",
          recipe: [
            "Sauté 1–2 tbsp red curry paste in 1 tsp oil until fragrant.",
            "Pour in coconut milk and bring to a gentle simmer.",
            "Add chopped veg (capsicum, beans, carrot) and paneer; simmer 8–10 min.",
            "Finish with lime and basil; serve over steamed rice.",
          ],
        },
        {
          slot: "Early dinner",
          icon: "🍚",
          name: "Moong dal khichdi + curd",
          detail: "Rice + moong dal · cumin-ghee tadka · curd · roasted papad",
          time: "30 min",
          protein: 22,
          tag: "By 7–8pm · cooked at home",
          recipe: [
            "Rinse ½ cup rice + ⅓ cup moong dal; pressure-cook with turmeric, salt and 3 cups water until soft.",
            "Temper cumin and a pinch of hing in ghee; stir it through.",
            "Serve with curd and a roasted papad.",
          ],
        },
      ],
    },
  ],

  /* ---- No-cook protein shelf ---- */
  shelf: [
    { item: "Paneer", note: "Sear 5 min or cube raw", protein: "≈18g / 100g" },
    { item: "Sattu (roasted gram)", note: "Blend into drinks & smoothies", protein: "≈20g / 100g" },
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
      items: ["Paneer (≈700g block)", "Greek yogurt (large tub)", "Curd (large tub)"],
    },
    {
      group: "Pantry proteins",
      items: ["Canned chickpeas ×3", "Canned rajma / black beans ×2", "Roasted chana", "Sattu (roasted gram flour)", "Peanuts", "Peanut butter", "Hummus tub", "Whey (optional)"],
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
    {
      group: "Weekend cooking",
      items: ["Moong dal (split)", "Toor dal", "Spinach (1 bunch)", "Whole-wheat atta", "Coconut milk", "Thai red curry paste", "Fresh basil", "Limes", "Ghee", "Papad", "Ginger-garlic", "Green chillies", "Whole spices (cumin, turmeric, garam masala, hing)"],
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
        "Mango-curd smoothie (Greek yogurt blended)",
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
        "Peanut noodle jar (paneer + veg)",
        "Sprout & chickpea salad jar + lemon-olive oil",
      ],
    },
    {
      slot: "Early-dinner swaps (by 7–8pm)",
      icon: "🥗",
      items: [
        "Paneer-veg rice-paper rolls + peanut dip",
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
          { name: "Black beans 1 cup", p: 15 },
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
        "Office day? Pack two boxes — lunch and an early dinner — and eat dinner by 7–8pm at work, since you're home too late to cook.",
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
        "Blend whey or extra Greek yogurt into any smoothie.",
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
