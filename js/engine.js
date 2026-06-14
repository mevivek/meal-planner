/* ============================================================
   Graze — planner engine (pure, no DOM)
   generatePlan(prefs, MEALS) is deterministic given prefs.seed,
   so it can be unit-tested headlessly.
   Depends on globals from data.js: MEALS, BUILD, DAY_KEYS,
   DAY_LABEL, DAY_FULL, COOK_RANK, CAT_LABEL, CAT_ORDER.
   ============================================================ */

const Engine = (function () {
  "use strict";

  // Small seeded PRNG so "Regenerate" yields a different-but-stable week.
  function mulberry32(a) {
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function proteinTarget(prefs) {
    const g = (prefs.goals && prefs.goals.goal) || "maintain";
    if (prefs.goals && prefs.goals.proteinTarget) return prefs.goals.proteinTarget;
    const w = prefs.profile && prefs.profile.weightKg;
    if (w) {
      const perKg = g === "cut" ? 1.6 : g === "bulk" ? 1.8 : 1.4;
      return Math.max(50, Math.min(120, Math.round(w * perKg)));
    }
    return g === "cut" ? 75 : g === "bulk" ? 90 : 70;
  }

  // Single source of diet/allergen exclusion, shared by meals & build options.
  function excludedByDiet(contains, prefs) {
    const d = prefs.diet || {};
    const c = contains || [];
    if (d.base === "vegan" && (c.includes("dairy") || c.includes("paneer") || c.includes("curd") || c.includes("egg"))) return true;
    if (!d.egg && c.includes("egg")) return true;
    const dislikes = d.dislikes || [];
    for (let i = 0; i < dislikes.length; i++) if (c.includes(dislikes[i])) return true;
    const allergens = d.allergens || [];
    for (let i = 0; i < allergens.length; i++) if (c.includes(allergens[i])) return true;
    return false;
  }

  function dayContext(dayKey, prefs) {
    const dayType = (prefs.schedule && prefs.schedule.dayTypes && prefs.schedule.dayTypes[dayKey]) || "wfh";
    const level = (prefs.cooking && prefs.cooking.level) || "sear";
    const cookDays = (prefs.cooking && prefs.cooking.cookDays) || [];
    const cookAllowed = level !== "none" && cookDays.indexOf(dayKey) >= 0;
    const maxLevel = cookAllowed ? level : "none";
    const maxPrep = cookAllowed ? 45 : (prefs.cooking && prefs.cooking.maxPrep) || 15;
    const requirePack = dayType === "office";
    return { dayType, cookAllowed, maxLevel, maxPrep, requirePack };
  }

  function passesDay(meal, ctx, prefs, ignoreCuisine) {
    if (COOK_RANK[meal.cook] > COOK_RANK[ctx.maxLevel]) return false;
    if (meal.prep > ctx.maxPrep) return false;
    // Office days: lunch & dinner must travel; breakfast is eaten at home.
    if (ctx.requirePack && (meal.slot === "lunch" || meal.slot === "dinner") && !meal.pack) return false;
    if (!ignoreCuisine) {
      const cz = (prefs.goals && prefs.goals.cuisines) || [];
      if (cz.length && cz.indexOf(meal.cuisine) < 0) return false;
    }
    return true;
  }

  function scoreMeal(meal, prefs, usedWeek, remaining, rng) {
    let s = 0;
    const wl = prefs.wellness || [];
    let wmatch = 0;
    for (let i = 0; i < meal.wellness.length; i++) if (wl.indexOf(meal.wellness[i]) >= 0) wmatch++;
    s += wmatch * 3;
    const cz = (prefs.goals && prefs.goals.cuisines) || [];
    if (cz.length && cz.indexOf(meal.cuisine) >= 0) s += 1;
    s += Math.min(meal.protein, remaining) / 10; // help close the daily gap
    if (usedWeek.has(meal.id)) s -= 6; // strong variety penalty
    s += rng() * 1.2; // seeded jitter
    return s;
  }

  function pickForSlot(slot, meals, ctx, prefs, usedToday, usedWeek, remaining, rng) {
    // Progressive relaxation so a slot is never left empty.
    let cands = meals.filter((m) => m.slot === slot && !excludedByDiet(m.contains, prefs) && passesDay(m, ctx, prefs, false) && !usedToday.has(m.id));
    if (!cands.length) cands = meals.filter((m) => m.slot === slot && !excludedByDiet(m.contains, prefs) && passesDay(m, ctx, prefs, true));
    if (!cands.length) cands = meals.filter((m) => m.slot === slot && !excludedByDiet(m.contains, prefs) && COOK_RANK[m.cook] <= COOK_RANK[ctx.maxLevel]);
    if (!cands.length) cands = meals.filter((m) => m.slot === slot && !excludedByDiet(m.contains, prefs));
    if (!cands.length) return null;
    const scored = cands.map((m) => ({ m: m, s: scoreMeal(m, prefs, usedWeek, remaining, rng) }));
    scored.sort((a, b) => b.s - a.s);
    return scored[0].m;
  }

  function generatePlan(prefs, meals) {
    meals = meals || MEALS;
    const rng = mulberry32((prefs.seed || 1) >>> 0);
    const target = proteinTarget(prefs);
    const mpd = Math.max(2, Math.min(3, (prefs.goals && prefs.goals.mealsPerDay) || 3));
    const slots = ["breakfast", "lunch", "dinner"].slice(0, mpd);
    const usedWeek = new Set();

    const days = DAY_KEYS.map((dayKey) => {
      const ctx = dayContext(dayKey, prefs);
      const usedToday = new Set();
      let dayProtein = 0;
      const picked = [];

      slots.forEach((slot) => {
        const remaining = Math.max(0, target - dayProtein);
        const choice = pickForSlot(slot, meals, ctx, prefs, usedToday, usedWeek, remaining, rng);
        if (choice) {
          picked.push(choice);
          usedToday.add(choice.id);
          usedWeek.add(choice.id);
          dayProtein += choice.protein;
        }
      });

      // Protein top-up: one no-cook booster if the day lands short.
      if (dayProtein < target - 8) {
        let boosters = meals.filter(
          (m) => m.slot === "snack" && !excludedByDiet(m.contains, prefs) && (!ctx.requirePack || m.pack)
        );
        boosters = boosters.map((m) => ({ m: m, s: m.protein + (rng() - 0.5) })).sort((a, b) => b.s - a.s);
        if (boosters.length) {
          picked.push(boosters[0].m);
          dayProtein += boosters[0].m.protein;
        }
      }

      return {
        key: dayKey,
        label: DAY_LABEL[dayKey],
        full: DAY_FULL[dayKey],
        dayType: ctx.dayType,
        cookAllowed: ctx.cookAllowed,
        total: dayProtein,
        target: target,
        meals: picked,
      };
    });

    return { target: target, days: days, seed: prefs.seed || 1, generatedAt: Date.now() };
  }

  function buildGrocery(plan) {
    const map = {};
    plan.days.forEach((d) => d.meals.forEach((m) => (m.items || []).forEach((it) => { map[it.n] = it.c; })));
    const groups = {};
    Object.keys(map).forEach((n) => { const c = map[n]; (groups[c] = groups[c] || []).push(n); });
    return CAT_ORDER.filter((c) => groups[c]).map((c) => ({ group: CAT_LABEL[c], items: groups[c].sort() }));
  }

  function buildSwaps(prefs, meals) {
    meals = meals || MEALS;
    const defs = [
      ["breakfast", "Breakfast swaps", "🥣"],
      ["lunch", "Lunch swaps (tiffin-safe)", "🍱"],
      ["dinner", "Early-dinner swaps", "🥗"],
    ];
    return defs.map(function (def) {
      const items = meals.filter((m) => m.slot === def[0] && !excludedByDiet(m.contains, prefs)).map((m) => m.name);
      return { slot: def[1], icon: def[2], items: items.slice(0, 8) };
    });
  }

  function buildMatrix(prefs) {
    const cols = BUILD.columns.map(function (col) {
      return { key: col.key, label: col.label, options: col.options.filter((o) => !excludedByDiet(o.contains, prefs)) };
    });
    return { formatHint: BUILD.formatHint, columns: cols };
  }

  return {
    proteinTarget: proteinTarget,
    excludedByDiet: excludedByDiet,
    dayContext: dayContext,
    generatePlan: generatePlan,
    buildGrocery: buildGrocery,
    buildSwaps: buildSwaps,
    buildMatrix: buildMatrix,
  };
})();
