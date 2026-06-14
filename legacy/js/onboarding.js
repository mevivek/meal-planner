/* ============================================================
   Graze — onboarding wizard
   Collects preferences into the prefs schema (see docs/ENGINE.md)
   and calls onComplete(prefs). Field-driven so steps are easy to
   extend. Depends on globals: WELLNESS, CUISINES, DAY_KEYS, DAY_LABEL.
   ============================================================ */

const Onboarding = (function () {
  "use strict";
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };

  // Default working state for a fresh user.
  function freshState() {
    return {
      age: "", gender: "", weight: "", height: "",
      dietBase: "vegetarian", egg: "no", exclusions: [], allergens: [],
      cookLevel: "sear", maxPrep: 15, lastMeal: "20:00", cookDays: ["sat", "sun"],
      dayTypes: { mon: "wfh", tue: "wfh", wed: "wfh", thu: "wfh", fri: "wfh", sat: "off", sun: "off" },
      goal: "maintain", mealsPerDay: 3, proteinMode: "auto", proteinValue: 75,
      cuisines: CUISINES.map((c) => c.id),
      wellness: [],
    };
  }

  // Map saved prefs back into wizard state for editing.
  function stateFromPrefs(p) {
    const s = freshState();
    if (!p) return s;
    if (p.profile) { s.age = p.profile.age || ""; s.gender = p.profile.gender || ""; s.weight = p.profile.weightKg || ""; s.height = p.profile.heightCm || ""; }
    if (p.diet) { s.dietBase = p.diet.base || "vegetarian"; s.egg = p.diet.egg ? "yes" : "no"; s.exclusions = (p.diet.dislikes || []).slice(); s.allergens = (p.diet.allergens || []).slice(); }
    if (p.cooking) { s.cookLevel = p.cooking.level || "sear"; s.maxPrep = p.cooking.maxPrep || 15; s.lastMeal = p.cooking.lastMealBy || "20:00"; s.cookDays = (p.cooking.cookDays || []).slice(); }
    if (p.schedule && p.schedule.dayTypes) s.dayTypes = Object.assign({}, s.dayTypes, p.schedule.dayTypes);
    if (p.goals) { s.goal = p.goals.goal || "maintain"; s.mealsPerDay = p.goals.mealsPerDay || 3; s.proteinMode = p.goals.proteinTarget ? "custom" : "auto"; s.proteinValue = p.goals.proteinTarget || 75; s.cuisines = (p.goals.cuisines || s.cuisines).slice(); }
    if (p.wellness) s.wellness = p.wellness.slice();
    return s;
  }

  function buildPrefs(s, prevSeed) {
    return {
      profile: { age: Number(s.age) || null, gender: s.gender || null, weightKg: Number(s.weight) || null, heightCm: Number(s.height) || null },
      diet: { base: s.dietBase, egg: s.egg === "yes", dislikes: s.exclusions.slice(), allergens: s.allergens.slice() },
      cooking: { level: s.cookLevel, maxPrep: Number(s.maxPrep) || 15, cookDays: s.cookDays.slice(), lastMealBy: s.lastMeal },
      schedule: { dayTypes: Object.assign({}, s.dayTypes) },
      goals: { goal: s.goal, proteinTarget: s.proteinMode === "custom" ? Number(s.proteinValue) || null : null, mealsPerDay: Number(s.mealsPerDay) || 3, cuisines: s.cuisines.slice(), variety: "high" },
      wellness: s.wellness.slice(),
      seed: prevSeed || (Date.now() % 2147483647),
    };
  }

  /* ---- field renderers ---- */
  function chipGroup(options, getSel, multi, onChange) {
    const wrap = el("div", "ob-chips");
    options.forEach((o) => {
      const b = el("button", "ob-chip", (o.icon ? o.icon + " " : "") + o.label);
      b.type = "button";
      const sync = () => { const sel = getSel(); b.classList.toggle("on", multi ? sel.indexOf(o.v) >= 0 : sel === o.v); };
      b.addEventListener("click", () => { onChange(o.v); wrap.querySelectorAll(".ob-chip").forEach((x, i) => x.classList.toggle("on", chipOn(options[i].v, getSel(), multi))); });
      wrap.appendChild(b);
      sync();
    });
    return wrap;
  }
  function chipOn(v, sel, multi) { return multi ? sel.indexOf(v) >= 0 : sel === v; }
  function toggleIn(arr, v) { const i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); return arr; }

  function numberField(state, key, ph, suffix) {
    const w = el("label", "ob-num");
    const inp = el("input");
    inp.type = "number"; inp.inputMode = "numeric"; inp.placeholder = ph; inp.value = state[key] || "";
    inp.addEventListener("input", () => { state[key] = inp.value; });
    w.appendChild(inp);
    if (suffix) w.appendChild(el("span", "ob-suffix", suffix));
    return w;
  }

  /* ---- step definitions ---- */
  function steps(state) {
    return [
      {
        title: "Welcome to Graze", subtitle: "Answer a few quick questions and we'll generate a personalised week you can regenerate anytime.",
        render: () => { const w = el("div", "ob-welcome"); w.appendChild(el("div", "ob-bigmark", "🌿")); w.appendChild(el("p", "ob-lead", "No accounts, nothing leaves your phone. Takes about a minute.")); return w; },
      },
      {
        title: "About you", subtitle: "Used to set a sensible protein target. Weight & height are optional.",
        render: () => {
          const w = el("div");
          const grid = el("div", "ob-grid2");
          grid.appendChild(numberField(state, "age", "Age", "yrs"));
          grid.appendChild(numberField(state, "weight", "Weight", "kg"));
          grid.appendChild(numberField(state, "height", "Height", "cm"));
          w.appendChild(grid);
          w.appendChild(el("p", "ob-flabel", "Gender"));
          w.appendChild(chipGroup(
            [{ v: "female", label: "Female" }, { v: "male", label: "Male" }, { v: "other", label: "Other" }, { v: "na", label: "Prefer not to say" }],
            () => state.gender, false, (v) => { state.gender = v; }
          ));
          return w;
        },
      },
      {
        title: "Diet", subtitle: "Everything stays vegetarian. Tell us what to leave out.",
        render: () => {
          const w = el("div");
          w.appendChild(el("p", "ob-flabel", "Base"));
          w.appendChild(chipGroup([{ v: "vegetarian", label: "Vegetarian" }, { v: "vegan", label: "Vegan (no dairy/paneer)" }], () => state.dietBase, false, (v) => { state.dietBase = v; }));
          w.appendChild(el("p", "ob-flabel", "Do you eat egg?"));
          w.appendChild(chipGroup([{ v: "no", label: "No egg" }, { v: "yes", label: "Egg is fine" }], () => state.egg, false, (v) => { state.egg = v; }));
          w.appendChild(el("p", "ob-flabel", "Leave these out"));
          w.appendChild(chipGroup(
            [{ v: "tofu", label: "No tofu" }, { v: "paneer", label: "No paneer" }, { v: "curd", label: "No curd/yogurt" }, { v: "peanut", label: "No peanut" }],
            () => state.exclusions, true, (v) => toggleIn(state.exclusions, v)
          ));
          return w;
        },
      },
      {
        title: "Allergens", subtitle: "We'll never put these in your plan.",
        render: () => {
          const w = el("div");
          w.appendChild(chipGroup(
            [{ v: "nuts", label: "Tree nuts" }, { v: "peanut", label: "Peanuts" }, { v: "gluten", label: "Gluten" }, { v: "soy", label: "Soy" }, { v: "seeds", label: "Seeds" }],
            () => state.allergens, true, (v) => toggleIn(state.allergens, v)
          ));
          w.appendChild(el("p", "ob-hint", "None? Just leave them all off."));
          return w;
        },
      },
      {
        title: "Cooking", subtitle: "How much effort, and when can you actually cook?",
        render: () => {
          const w = el("div");
          w.appendChild(el("p", "ob-flabel", "Most you'll do"));
          w.appendChild(chipGroup([{ v: "none", label: "No cooking" }, { v: "sear", label: "Quick sear / toast" }, { v: "cook", label: "Full cooking" }], () => state.cookLevel, false, (v) => { state.cookLevel = v; }));
          w.appendChild(el("p", "ob-flabel", "Max prep on no-cook days"));
          w.appendChild(chipGroup([{ v: 10, label: "10 min" }, { v: 15, label: "15 min" }, { v: 20, label: "20 min" }], () => state.maxPrep, false, (v) => { state.maxPrep = v; }));
          w.appendChild(el("p", "ob-flabel", "Last meal by"));
          w.appendChild(chipGroup([{ v: "19:00", label: "7 pm" }, { v: "20:00", label: "8 pm" }, { v: "21:00", label: "9 pm" }, { v: "23:00", label: "Late / no limit" }], () => state.lastMeal, false, (v) => { state.lastMeal = v; }));
          w.appendChild(el("p", "ob-flabel", "Days you can cook"));
          w.appendChild(chipGroup(DAY_KEYS.map((d) => ({ v: d, label: DAY_LABEL[d] })), () => state.cookDays, true, (v) => toggleIn(state.cookDays, v)));
          return w;
        },
      },
      {
        title: "Your week", subtitle: "Office days pack lunch + an early dinner; WFH/Off assemble fresh.",
        render: () => {
          const w = el("div", "ob-days");
          DAY_KEYS.forEach((d) => {
            const row = el("div", "ob-dayrow");
            row.appendChild(el("span", "ob-dayname", DAY_LABEL[d]));
            row.appendChild(chipGroup(
              [{ v: "office", label: "Office" }, { v: "wfh", label: "WFH" }, { v: "off", label: "Off" }],
              () => state.dayTypes[d], false, (v) => { state.dayTypes[d] = v; }
            ));
            w.appendChild(row);
          });
          return w;
        },
      },
      {
        title: "Goal & protein", subtitle: "We'll aim each day near your target.",
        render: () => {
          const w = el("div");
          w.appendChild(el("p", "ob-flabel", "Goal"));
          w.appendChild(chipGroup([{ v: "cut", label: "Lean / cut" }, { v: "maintain", label: "Maintain" }, { v: "bulk", label: "Build / bulk" }], () => state.goal, false, (v) => { state.goal = v; }));
          w.appendChild(el("p", "ob-flabel", "Meals per day"));
          w.appendChild(chipGroup([{ v: 2, label: "2" }, { v: 3, label: "3" }], () => state.mealsPerDay, false, (v) => { state.mealsPerDay = v; }));
          w.appendChild(el("p", "ob-flabel", "Daily protein"));
          const pm = chipGroup([{ v: "auto", label: "Auto" }, { v: "custom", label: "Set my own" }], () => state.proteinMode, false, (v) => { state.proteinMode = v; custom.style.display = v === "custom" ? "flex" : "none"; });
          w.appendChild(pm);
          const custom = numberField(state, "proteinValue", "Protein", "g/day");
          custom.classList.add("ob-protein-custom");
          custom.style.display = state.proteinMode === "custom" ? "flex" : "none";
          w.appendChild(custom);
          return w;
        },
      },
      {
        title: "Cuisines", subtitle: "Pick what you like — we'll lean into these.",
        render: () => chipGroup(CUISINES.map((c) => ({ v: c.id, label: c.label })), () => state.cuisines, true, (v) => toggleIn(state.cuisines, v)),
      },
      {
        title: "Wellness focus", subtitle: "We'll bias your meals toward these benefits. Pick any that matter (or none).",
        render: () => chipGroup(WELLNESS.map((wn) => ({ v: wn.id, label: wn.label, icon: wn.icon })), () => state.wellness, true, (v) => toggleIn(state.wellness, v)),
      },
    ];
  }

  function run(opts) {
    const container = opts.container;
    const onComplete = opts.onComplete;
    const prevSeed = opts.prefs && opts.prefs.seed;
    const state = stateFromPrefs(opts.prefs);
    const STEPS = steps(state);
    let i = 0;

    function render() {
      const step = STEPS[i];
      container.innerHTML = "";
      const card = el("div", "ob-card");
      const prog = el("div", "ob-progress");
      for (let k = 0; k < STEPS.length; k++) prog.appendChild(el("span", "ob-dot" + (k <= i ? " on" : "")));
      card.appendChild(prog);
      card.appendChild(el("h2", "ob-title", step.title));
      if (step.subtitle) card.appendChild(el("p", "ob-sub", step.subtitle));
      const body = el("div", "ob-body");
      body.appendChild(step.render());
      card.appendChild(body);

      const nav = el("div", "ob-nav");
      const back = el("button", "ob-btn ghost", i === 0 ? "" : "Back");
      back.type = "button";
      back.style.visibility = i === 0 ? "hidden" : "visible";
      back.addEventListener("click", () => { i = Math.max(0, i - 1); render(); });
      const next = el("button", "ob-btn primary", i === STEPS.length - 1 ? "Generate my plan" : i === 0 ? "Get started" : "Next");
      next.type = "button";
      next.addEventListener("click", () => {
        if (i === STEPS.length - 1) { onComplete(buildPrefs(state, prevSeed)); return; }
        i++; render();
      });
      nav.appendChild(back); nav.appendChild(next);
      card.appendChild(nav);
      container.appendChild(card);
      container.scrollTop = 0;
    }
    render();
  }

  return { run: run };
})();
