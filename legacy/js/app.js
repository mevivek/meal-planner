/* ============================================================
   Graze — app orchestration
   Loads preferences → runs the engine → renders. Handles
   onboarding, settings, regenerate, the per-day type toggle,
   grocery check-off, build matrix, pantry, and the service worker.
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
  const PREFS_KEY = "graze.prefs.v1";
  const GROCERY_KEY = "graze.grocery.v2";
  const modeLabel = { office: "Office", wfh: "WFH", off: "Off" };
  const goalLabel = { cut: "Lean / cut", maintain: "Maintain", bulk: "Build / bulk" };
  const timeLabel = { "19:00": "7 pm", "20:00": "8 pm", "21:00": "9 pm", "23:00": "no limit" };

  const STATE = { prefs: null, plan: null, activeDay: "mon" };

  // Toggle visibility via inline display so it always beats stylesheet rules
  // like .onboarding/.bottom-nav { display: flex } (no cascade ambiguity).
  function setShown(node, shown) { if (!node) return; node.hidden = !shown; node.style.display = shown ? "" : "none"; }

  /* ---------- brand picking (link recipe ingredients to products) ---------- */
  const BRANDS_KEY = "graze.brands.v1";
  const BRAND_INDEX = {}; // ingredient token -> products[]
  PRODUCTS.forEach((p) => { if (!p.ingredient) return; (BRAND_INDEX[p.ingredient] = BRAND_INDEX[p.ingredient] || []).push(p); });
  function loadBrands() { try { return JSON.parse(localStorage.getItem(BRANDS_KEY)) || {}; } catch (e) { return {}; } }
  function saveBrands(b) { try { localStorage.setItem(BRANDS_KEY, JSON.stringify(b)); } catch (e) {} }
  function tokensForItem(name) { const n = name.toLowerCase(); return Object.keys(BRAND_INDEX).filter((t) => n.indexOf(t) >= 0); }
  // tokens in a meal that actually have a real brand to choose from
  function brandableTokens(meal) {
    const set = {};
    (meal.items || []).forEach((it) => tokensForItem(it.n).forEach((t) => { if (BRAND_INDEX[t].some((p) => p.source === "label")) set[t] = true; }));
    return Object.keys(set);
  }
  const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

  /* ---------- persistence ---------- */
  function loadPrefs() { try { return JSON.parse(localStorage.getItem(PREFS_KEY)); } catch (e) { return null; } }
  function savePrefs(p) { try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch (e) {} }

  /* ---------- boot / onboarding ---------- */
  function showOnboarding(prefs) {
    setShown($("#topbar"), false); setShown($("#app"), false); setShown($("#bottomNav"), false);
    const ob = $("#onboarding"); setShown(ob, true);
    Onboarding.run({ container: ob, prefs: prefs, onComplete: function (p) { savePrefs(p); setShown(ob, false); boot(p); } });
  }

  function boot(prefs) {
    STATE.prefs = prefs;
    STATE.plan = Engine.generatePlan(prefs, MEALS);
    setShown($("#onboarding"), false);
    setShown($("#topbar"), true); setShown($("#app"), true); setShown($("#bottomNav"), true);
    const order = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
    STATE.activeDay = order[new Date().getDay()] || "mon";
    renderTargets(); renderPlanNote(); renderDayTabs(); selectDay(STATE.activeDay);
    renderBuild(); renderGrocery(); renderSwaps(); renderPantry(); renderTips(); renderPrefsSummary(); renderExclusions();
    initNavOnce();
  }

  // Re-plan with the current seed (exclusions/overrides/day-type changes) and
  // refresh the plan-derived views, leaving the exclusions panel untouched.
  function rebuildPlan() {
    STATE.plan = Engine.generatePlan(STATE.prefs, MEALS);
    renderTargets(); renderPlanNote(); renderDayTabs(); selectDay(STATE.activeDay); renderGrocery(); renderSwaps();
  }
  function rebuild() { rebuildPlan(); renderExclusions(); }

  function regenerate() {
    if (!STATE.prefs) return;
    STATE.prefs.seed = Date.now() % 2147483647;
    STATE.prefs.overrides = {}; // a truly fresh week drops manual swaps
    savePrefs(STATE.prefs);
    rebuild();
  }

  /* ---------- meal exclusion / swap / ingredient avoidance ---------- */
  const ALL_ITEMS = (function () {
    const set = {};
    MEALS.forEach((m) => (m.items || []).forEach((it) => { set[it.n] = true; }));
    return Object.keys(set).sort();
  })();
  function excludeMeal(id) {
    const p = STATE.prefs; p.excludedMeals = p.excludedMeals || [];
    if (p.excludedMeals.indexOf(id) < 0) p.excludedMeals.push(id);
    if (p.overrides) Object.keys(p.overrides).forEach((k) => { if (p.overrides[k] === id) delete p.overrides[k]; });
    savePrefs(p); rebuild();
  }
  function restoreMeal(id) {
    const p = STATE.prefs; p.excludedMeals = (p.excludedMeals || []).filter((x) => x !== id);
    savePrefs(p); rebuild();
  }
  function toggleItem(name) {
    const p = STATE.prefs; p.excludedItems = p.excludedItems || [];
    const i = p.excludedItems.indexOf(name); const added = i < 0;
    if (added) p.excludedItems.push(name); else p.excludedItems.splice(i, 1);
    savePrefs(p); rebuildPlan(); // keep the exclusions panel (and its open list) in place
    return added;
  }
  function setOverride(dayKey, slot, id) {
    const p = STATE.prefs; p.overrides = p.overrides || {}; p.overrides[dayKey + ":" + slot] = id;
    savePrefs(p); STATE.activeDay = dayKey; rebuild();
  }

  function openSwapSheet(dayKey, slot, currentId) {
    const alts = Engine.alternatesFor(STATE.prefs, dayKey, slot, currentId, MEALS);
    const slotName = slot === "dinner" ? "early dinner" : slot;
    const sheet = el("div", "sheet-overlay");
    sheet.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="Swap ${slotName}">
      <div class="sheet-head"><b>Swap ${slotName}</b><button class="sheet-close" type="button" aria-label="Close">✕</button></div>
      <div class="sheet-note">${DAY_FULL[dayKey]} · ${alts.length} option${alts.length === 1 ? "" : "s"} that fit this day</div>
      <div class="sheet-list"></div></div>`;
    const list = $(".sheet-list", sheet);
    if (!alts.length) list.appendChild(el("p", "section-note", "No alternates fit this day. Try relaxing cooking effort or the day type."));
    alts.forEach((a) => {
      const row = el("button", "sheet-item"); row.type = "button";
      row.innerHTML = `<span class="si-ico">${a.icon}</span><span class="si-body"><span class="si-name">${a.name}</span><span class="si-meta">${a.protein}g · ⏱${a.prep} min · ${a.cuisine}</span></span>`;
      row.addEventListener("click", () => { setOverride(dayKey, slot, a.id); close(); });
      list.appendChild(row);
    });
    function close() { sheet.remove(); document.removeEventListener("keydown", onKey); }
    function onKey(e) { if (e.key === "Escape") close(); }
    sheet.addEventListener("click", (e) => { if (e.target === sheet) close(); });
    $(".sheet-close", sheet).addEventListener("click", close);
    document.addEventListener("keydown", onKey);
    document.body.appendChild(sheet);
  }

  function renderExclusions() {
    const wrap = $("#exclusions"); if (!wrap) return; wrap.innerHTML = "";
    const p = STATE.prefs;
    wrap.appendChild(el("p", "ob-flabel", "Excluded meals"));
    const xm = p.excludedMeals || [];
    const xmWrap = el("div", "excl-chips");
    if (!xm.length) xmWrap.appendChild(el("p", "section-note", "None — tap “Exclude” on any meal card."));
    else xm.forEach((id) => {
      const meal = MEALS.find((m) => m.id === id);
      const chip = el("button", "excl-chip on", (meal ? meal.name : id) + " ✕"); chip.type = "button";
      chip.addEventListener("click", () => restoreMeal(id));
      xmWrap.appendChild(chip);
    });
    wrap.appendChild(xmWrap);

    const det = el("details", "excl-details");
    const xiCount = (p.excludedItems || []).length;
    det.appendChild(el("summary", null, "Avoid specific ingredients" + (xiCount ? " (" + xiCount + ")" : "")));
    const body = el("div", "excl-body");
    const search = el("input", "pantry-search"); search.type = "search"; search.placeholder = "Search ingredients…";
    const chips = el("div", "excl-chips");
    const summary = $("summary", det);
    function paint(filter) {
      chips.innerHTML = ""; const q = (filter || "").toLowerCase(); const xi = p.excludedItems || [];
      ALL_ITEMS.filter((n) => !q || n.toLowerCase().indexOf(q) >= 0).forEach((n) => {
        const c = el("button", "excl-chip" + (xi.indexOf(n) >= 0 ? " on" : ""), n); c.type = "button";
        c.addEventListener("click", () => { const added = toggleItem(n); c.classList.toggle("on", added); summary.textContent = "Avoid specific ingredients" + ((p.excludedItems || []).length ? " (" + p.excludedItems.length + ")" : ""); });
        chips.appendChild(c);
      });
    }
    search.addEventListener("input", () => paint(search.value));
    body.appendChild(search); body.appendChild(chips); det.appendChild(body); wrap.appendChild(det);
    paint("");
  }

  /* ---------- targets banner ---------- */
  function renderTargets() {
    const p = STATE.prefs, t = $("#targets");
    const wl = (p.wellness || []).map((id) => { const w = WELLNESS.find((x) => x.id === id); return w ? `<span class="t-chip">${w.icon} ${w.label}</span>` : ""; }).join("");
    t.innerHTML = `
      <div class="t-main"><b>${STATE.plan.target}g</b><span>daily protein target</span></div>
      <div class="t-meta">
        <span class="t-chip strong">${goalLabel[p.goals.goal] || "Maintain"}</span>
        <span class="t-chip">Last meal ${timeLabel[p.cooking.lastMealBy] || p.cooking.lastMealBy}</span>
        ${wl}
      </div>`;
  }

  function renderPlanNote() {
    const p = STATE.prefs;
    const office = DAY_KEYS.filter((d) => (p.schedule.dayTypes || {})[d] === "office").length;
    const cookN = (p.cooking.cookDays || []).length;
    $("#planNote").textContent = `Breakfast · Lunch · early Dinner. ${office} office day${office === 1 ? "" : "s"} pack lunch + dinner; cooking on ${cookN} day${cookN === 1 ? "" : "s"}.`;
  }

  /* ---------- day tabs + panel ---------- */
  const tabByKey = {};
  function renderDayTabs() {
    const tabs = $("#dayTabs"); tabs.innerHTML = "";
    STATE.plan.days.forEach((d) => {
      const t = el("button", "day-tab"); t.dataset.key = d.key; t.dataset.mode = d.dayType; t.setAttribute("role", "tab");
      t.innerHTML = `<span class="d-label">${d.label}</span><span class="d-dot"></span>`;
      t.addEventListener("click", () => selectDay(d.key));
      tabByKey[d.key] = t; tabs.appendChild(t);
    });
  }

  function selectDay(key) {
    const day = STATE.plan.days.find((d) => d.key === key) || STATE.plan.days[0];
    STATE.activeDay = day.key;
    $("#dayTabs").querySelectorAll(".day-tab").forEach((t) => t.classList.toggle("active", t.dataset.key === day.key));
    renderDay(day);
  }

  function renderDay(day) {
    const panel = $("#dayPanel"); panel.innerHTML = "";
    const head = el("div", "day-header");
    head.innerHTML = `
      <div class="dh-left">
        <h3>${day.full}</h3>
        <div class="mode-toggle" role="group" aria-label="Set day type">
          ${["office", "wfh", "off"].map((m) => `<button type="button" data-mode="${m}" class="${m === day.dayType ? "active" : ""}">${modeLabel[m]}</button>`).join("")}
        </div>
      </div>
      <div class="protein-total"><b>${day.total}g</b><span>protein</span></div>`;
    panel.appendChild(head);
    head.querySelectorAll(".mode-toggle button").forEach((b) => b.addEventListener("click", () => setDayType(day.key, b.dataset.mode)));

    const brands = loadBrands();
    day.meals.forEach((m, i) => {
      const card = el("div", "meal-card"); card.style.animationDelay = i * 0.05 + "s";
      const recipe = m.recipe ? `<details class="meal-recipe"><summary>View recipe <span class="mr-steps">${m.recipe.length} steps</span></summary><ol>${m.recipe.map((s) => `<li>${s}</li>`).join("")}</ol></details>` : "";
      const slotName = m.slot === "snack" ? "Booster" : m.slot === "dinner" ? "Early dinner" : m.slot.charAt(0).toUpperCase() + m.slot.slice(1);
      const toks = brandableTokens(m);
      const brandRow = toks.length ? `<div class="brand-row">` + toks.map((t) => {
        const opts = [`<option value="">Any brand</option>`].concat(
          BRAND_INDEX[t].map((p) => `<option value="${p.id}"${brands[t] === p.id ? " selected" : ""}>${p.brand} · ${p.per.protein}g · ${p.serving}</option>`)
        ).join("");
        return `<label class="brand-pick"><span>🏷️ ${titleCase(t)}</span><select data-token="${t}">${opts}</select></label>`;
      }).join("") + `</div>` : "";
      const actions = m.slot === "snack"
        ? `<div class="meal-actions"><button type="button" class="meal-act" data-act="exclude">⊘ Exclude</button></div>`
        : `<div class="meal-actions"><button type="button" class="meal-act" data-act="swap">🔄 Swap</button><button type="button" class="meal-act" data-act="exclude">⊘ Exclude</button></div>`;
      card.innerHTML = `
        <div class="m-icon">${m.icon}</div>
        <div class="m-body">
          <div class="meal-slot">${slotName}</div>
          <div class="meal-name">${m.name}</div>
          <div class="meal-detail">${m.detail}</div>
          <div class="meal-meta">
            <span class="m-time">⏱ ${m.prep} min</span>
            <span class="m-prot">${m.protein}g protein</span>
            <span class="m-tag">${cookTag(m, day)}</span>
          </div>
          ${brandRow}
          ${recipe}
          ${actions}
        </div>`;
      card.querySelectorAll(".brand-row select").forEach((sel) => sel.addEventListener("change", () => {
        const b = loadBrands(); const tok = sel.dataset.token;
        if (sel.value) b[tok] = sel.value; else delete b[tok];
        saveBrands(b);
        selectDay(STATE.activeDay); renderGrocery();
      }));
      const swapBtn = card.querySelector('[data-act="swap"]');
      if (swapBtn) swapBtn.addEventListener("click", () => openSwapSheet(day.key, m.slot, m.id));
      const exclBtn = card.querySelector('[data-act="exclude"]');
      if (exclBtn) exclBtn.addEventListener("click", () => excludeMeal(m.id));
      panel.appendChild(card);
    });
  }

  function cookTag(m, day) {
    if (m.slot === "snack") return "Top-up";
    if (m.cook === "cook") return "Cooked";
    if (m.cook === "sear") return day.dayType === "office" ? "Sear AM · packs" : "5-min sear";
    return day.dayType === "office" && (m.slot === "lunch" || m.slot === "dinner") ? "Packs" : "No-cook";
  }

  function setDayType(key, mode) {
    STATE.prefs.schedule.dayTypes[key] = mode;
    STATE.activeDay = key;
    savePrefs(STATE.prefs);
    rebuildPlan();
  }

  /* ---------- build matrix ---------- */
  function renderBuild() {
    const matrix = $("#buildMatrix"); const result = $("#buildResult"); matrix.innerHTML = "";
    const conf = Engine.buildMatrix(STATE.prefs); const chosen = {};
    conf.columns.forEach((col) => {
      const row = el("div", "build-row"); row.appendChild(el("div", "br-label", col.label));
      const opts = el("div", "build-opts");
      col.options.forEach((o) => {
        const b = el("button", "opt", o.name); b.type = "button";
        b.addEventListener("click", () => {
          const already = chosen[col.key] && chosen[col.key].name === o.name;
          opts.querySelectorAll(".opt").forEach((x) => x.classList.remove("selected"));
          if (already) delete chosen[col.key]; else { chosen[col.key] = o; b.classList.add("selected"); }
          renderResult();
        });
        opts.appendChild(b);
      });
      row.appendChild(opts); matrix.appendChild(row);
    });
    function renderResult() {
      const keys = conf.columns.map((c) => c.key).filter((k) => chosen[k]);
      if (!keys.length) { result.innerHTML = `<p class="build-empty">Pick a base, protein, veg & dressing to plate a meal.</p>`; return; }
      const total = keys.reduce((s, k) => s + chosen[k].p, 0);
      const parts = keys.map((k) => `<span>${chosen[k].name}</span>`).join("");
      const combo = [chosen.protein, chosen.base].filter(Boolean).map((o) => o.name).join(" + ") || "Your plate";
      result.innerHTML = `<div class="br-title">Your plate</div><div class="br-combo">${combo}</div><div class="br-parts">${parts}</div>
        <div class="br-foot"><span class="br-hint">${conf.formatHint}</span><span class="br-protein"><b>~${total}g</b><span>protein</span></span></div>`;
    }
  }

  /* ---------- grocery ---------- */
  function loadChecks() { try { return JSON.parse(localStorage.getItem(GROCERY_KEY)) || {}; } catch (e) { return {}; } }
  function renderGrocery() {
    const list = $("#groceryList"); list.innerHTML = "";
    const groups = Engine.buildGrocery(STATE.plan);
    let checks = loadChecks(); let total = 0; const brands = loadBrands();
    const svg = `<svg viewBox="0 0 16 16"><polyline points="2,8 6,12 14,3"/></svg>`;
    groups.forEach((g) => {
      const group = el("div", "grocery-group"); group.appendChild(el("h3", null, g.group));
      g.items.forEach((item) => {
        total++; const id = item;
        const row = el("div", "g-item"); if (checks[id]) row.classList.add("checked");
        let badge = "";
        const toks = tokensForItem(item);
        for (let k = 0; k < toks.length; k++) {
          const pid = brands[toks[k]]; if (!pid) continue;
          const prod = PRODUCTS.find((p) => p.id === pid);
          if (prod && prod.source === "label") { badge = ` <span class="g-brand">${prod.brand}</span>`; break; }
        }
        row.innerHTML = `<span class="g-check">${svg}</span><span class="g-text">${item}${badge}</span>`;
        row.addEventListener("click", () => { row.classList.toggle("checked"); checks[id] = row.classList.contains("checked"); save(); update(); });
        group.appendChild(row);
      });
      list.appendChild(group);
    });
    function save() { try { localStorage.setItem(GROCERY_KEY, JSON.stringify(checks)); } catch (e) {} }
    function update() { const done = g_done(); $("#groceryBar").style.width = total ? (done / total) * 100 + "%" : "0%"; $("#groceryCount").textContent = done + " / " + total; }
    function g_done() { let n = 0; list.querySelectorAll(".g-item.checked").forEach(() => n++); return n; }
    $("#resetGrocery").onclick = function () { checks = {}; save(); list.querySelectorAll(".g-item").forEach((r) => r.classList.remove("checked")); update(); };
    update();
  }

  /* ---------- swaps ---------- */
  function renderSwaps() {
    const wrap = $("#swapList"); wrap.innerHTML = "";
    Engine.buildSwaps(STATE.prefs, MEALS).forEach((s, idx) => {
      const card = el("div", "swap-card");
      card.innerHTML = `<button class="swap-head" aria-expanded="${idx === 0}"><span class="sw-ico">${s.icon}</span><span class="sw-title">${s.slot}</span><span class="sw-arrow">▾</span></button>
        <div class="swap-body"><ul>${s.items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`;
      const head = $(".swap-head", card), body = $(".swap-body", card);
      head.addEventListener("click", () => { const open = card.classList.toggle("open"); head.setAttribute("aria-expanded", open); body.style.maxHeight = open ? body.scrollHeight + "px" : 0; });
      wrap.appendChild(card);
      if (idx === 0) { card.classList.add("open"); requestAnimationFrame(() => { body.style.maxHeight = body.scrollHeight + "px"; }); }
    });
  }

  /* ---------- pantry / products ---------- */
  function renderPantry(filter) {
    const grid = $("#pantryGrid"); grid.innerHTML = "";
    const q = (filter || "").trim().toLowerCase();
    const list = PRODUCTS.filter((p) => !q || (p.name + " " + p.brand + " " + p.category).toLowerCase().indexOf(q) >= 0);
    if (!list.length) { grid.appendChild(el("p", "section-note", "No products match — try another term.")); return; }
    PRODUCT_CATS.forEach((cat) => {
      const items = list.filter((p) => p.category === cat).sort((a, b) => (a.source === b.source ? 0 : a.source === "label" ? -1 : 1));
      if (!items.length) return;
      grid.appendChild(el("h4", "pantry-cat", cat));
      items.forEach((p) => {
        const c = el("div", "product-card");
        const macro = (lab, v, u) => v == null ? "" : `<span class="pm"><b>${v}${u || ""}</b>${lab}</span>`;
        c.innerHTML = `
          <div class="product-top">
            <div><div class="p-name">${p.name}</div><div class="p-brand">${p.brand}${p.source === "generic" ? " · typical" : ""} · ${p.serving}</div></div>
            <div class="p-kcal">${p.per.kcal}<span>kcal</span></div>
          </div>
          <div class="product-macros">
            ${macro("protein", p.per.protein, "g")}${macro("carbs", p.per.carbs, "g")}${macro("fat", p.per.fat, "g")}${macro("fibre", p.per.fiber, "g")}
          </div>`;
        grid.appendChild(c);
      });
    });
  }

  /* ---------- tips ---------- */
  function renderTips() {
    const grid = $("#tipsGrid"); grid.innerHTML = "";
    TIPS.forEach((t) => {
      const card = el("div", "tip-card");
      card.innerHTML = `<h3><span class="t-ico">${t.icon}</span>${t.title}</h3><ol>${t.steps.map((s) => `<li>${s}</li>`).join("")}</ol>`;
      grid.appendChild(card);
    });
  }

  /* ---------- prefs summary + manage ---------- */
  function renderPrefsSummary() {
    const p = STATE.prefs;
    const bits = [];
    bits.push(p.diet.base === "vegan" ? "Vegan" : "Vegetarian");
    if (!p.diet.egg) bits.push("no egg");
    (p.diet.dislikes || []).forEach((d) => bits.push("no " + d));
    (p.diet.allergens || []).forEach((a) => bits.push(a + "-free"));
    bits.push(goalLabel[p.goals.goal].toLowerCase());
    bits.push("~" + STATE.plan.target + "g protein");
    $("#prefsSummary").textContent = bits.join(" · ");
  }

  /* ---------- nav (scroll-spy + sliding pill) ---------- */
  let navInit = false;
  function initNavOnce() {
    if (navInit) return; navInit = true;
    const items = Array.from(document.querySelectorAll(".nav-item"));
    const sections = items.map((i) => document.getElementById(i.dataset.target));
    const topbar = $("#topbar"); const pill = $("#navPill");
    function movePill() { const a = items.find((it) => it.classList.contains("active")); if (a && pill) { pill.style.left = a.offsetLeft + "px"; pill.style.width = a.offsetWidth + "px"; } }
    function setActive(id) { items.forEach((it) => it.classList.toggle("active", it.dataset.target === id)); movePill(); }
    const obs = new IntersectionObserver((entries) => { entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); }); }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach((s) => s && obs.observe(s));
    items.forEach((it) => it.addEventListener("click", (e) => { e.preventDefault(); setActive(it.dataset.target); document.getElementById(it.dataset.target).scrollIntoView({ behavior: "smooth" }); }));
    requestAnimationFrame(() => requestAnimationFrame(movePill));
    window.addEventListener("load", movePill); window.addEventListener("resize", movePill);
    let ticking = false;
    window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(() => { topbar.classList.toggle("scrolled", window.scrollY > 8); ticking = false; }); ticking = true; } });
  }

  /* ---------- wire controls ---------- */
  function wire() {
    $("#regenBtn").addEventListener("click", regenerate);
    $("#regenBtn2").addEventListener("click", regenerate);
    $("#settingsBtn").addEventListener("click", () => showOnboarding(STATE.prefs));
    $("#editPrefs").addEventListener("click", () => showOnboarding(STATE.prefs));
    $("#resetAll").addEventListener("click", () => {
      if (!confirm("Start over? This clears your preferences and grocery checklist on this device.")) return;
      try { localStorage.removeItem(PREFS_KEY); localStorage.removeItem(GROCERY_KEY); } catch (e) {}
      showOnboarding(null);
    });
    const ps = $("#pantrySearch"); if (ps) ps.addEventListener("input", () => renderPantry(ps.value));
  }

  /* ---------- start ---------- */
  wire();
  const saved = loadPrefs();
  if (saved) boot(saved); else showOnboarding(null);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
  }
})();
