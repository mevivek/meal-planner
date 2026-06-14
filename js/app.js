/* ============================================================
   Graze — UI logic
   Renders the plan from data.js and wires up interactions.
   No framework, no build step.
   ============================================================ */
(function () {
  "use strict";
  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const modeLabel = { office: "Office", wfh: "WFH", off: "Off" };

  /* ---------- Day tabs + panel ---------- */
  const tabs = $("#dayTabs");
  const panel = $("#dayPanel");

  // The user sets each day's mode themselves; choices persist on-device.
  const MODE_KEY = "graze.modes.v1";
  const MODES = ["office", "wfh", "off"];
  const modeHint = {
    office: "Out ~10am–11pm: lunch packs as tiffin, dinner stays light & late.",
    wfh: "Home day: assemble everything fresh in your morning window.",
    off: "Day off: relaxed timing, same easy assembly.",
    "": "Tap to set this day — Office, WFH, or Off.",
  };
  let modes = {};
  try { modes = JSON.parse(localStorage.getItem(MODE_KEY)) || {}; } catch (e) { modes = {}; }
  const getMode = (key) => modes[key] || "";
  const tabByKey = {};

  function setMode(key, mode) {
    modes[key] = mode;
    try { localStorage.setItem(MODE_KEY, JSON.stringify(modes)); } catch (e) {}
    if (tabByKey[key]) tabByKey[key].dataset.mode = mode;
  }

  function renderDay(day) {
    const cur = getMode(day.key);
    panel.innerHTML = "";
    const head = el("div", "day-header");
    head.innerHTML = `
      <div class="dh-left">
        <h3>${day.full}</h3>
        <div class="mode-toggle" role="group" aria-label="Set day type">
          ${MODES.map(
            (m) =>
              `<button type="button" data-mode="${m}" class="${m === cur ? "active" : ""}" aria-pressed="${m === cur}">${modeLabel[m]}</button>`
          ).join("")}
        </div>
      </div>
      <div class="protein-total"><b>${day.total}g</b><span>protein</span></div>`;
    panel.appendChild(head);

    const hint = el("p", "mode-hint", modeHint[cur]);
    panel.appendChild(hint);

    head.querySelectorAll(".mode-toggle button").forEach((b) => {
      b.addEventListener("click", () => {
        const next = b.dataset.mode === getMode(day.key) ? "" : b.dataset.mode; // tap again to clear
        setMode(day.key, next);
        head.querySelectorAll(".mode-toggle button").forEach((x) => {
          const on = x.dataset.mode === next;
          x.classList.toggle("active", on);
          x.setAttribute("aria-pressed", on);
        });
        hint.textContent = modeHint[next];
      });
    });

    day.meals.forEach((m, i) => {
      const card = el("div", "meal-card");
      card.style.animationDelay = i * 0.06 + "s";
      const recipe = m.recipe
        ? `<details class="meal-recipe">
             <summary>View recipe <span class="mr-steps">${m.recipe.length} steps</span></summary>
             <ol>${m.recipe.map((s) => `<li>${s}</li>`).join("")}</ol>
           </details>`
        : "";
      card.innerHTML = `
        <div class="m-icon">${m.icon}</div>
        <div class="m-body">
          <div class="meal-slot">${m.slot}</div>
          <div class="meal-name">${m.name}</div>
          <div class="meal-detail">${m.detail}</div>
          <div class="meal-meta">
            <span class="m-time">⏱ ${m.time}</span>
            <span class="m-prot">${m.protein}g protein</span>
            <span class="m-tag">${m.tag}</span>
          </div>
          ${recipe}
        </div>`;
      panel.appendChild(card);
    });
  }

  function selectDay(key) {
    const day = PLAN.days.find((d) => d.key === key) || PLAN.days[0];
    tabs.querySelectorAll(".day-tab").forEach((t) =>
      t.classList.toggle("active", t.dataset.key === day.key)
    );
    renderDay(day);
  }

  PLAN.days.forEach((d) => {
    const t = el("button", "day-tab");
    t.dataset.key = d.key;
    t.dataset.mode = getMode(d.key);
    t.setAttribute("role", "tab");
    t.innerHTML = `<span class="d-label">${d.label}</span>
      <span class="d-dot"></span>`;
    t.addEventListener("click", () => selectDay(d.key));
    tabByKey[d.key] = t;
    tabs.appendChild(t);
  });

  // Default to today if within Mon–Sun, else Monday.
  const jsDay = new Date().getDay(); // 0 Sun .. 6 Sat
  const order = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  selectDay(order[jsDay] || "mon");

  $("#todayPill").addEventListener("click", () => {
    selectDay(order[new Date().getDay()] || "mon");
    document.getElementById("plan").scrollIntoView({ behavior: "smooth" });
  });

  /* ---------- Protein shelf ---------- */
  (function shelf() {
    const grid = $("#shelfGrid");
    PLAN.shelf.forEach((s) => {
      const c = el("div", "shelf-card");
      c.innerHTML = `<div class="s-item">${s.item}</div>
        <div class="s-note">${s.note}</div>
        <span class="s-prot">${s.protein}</span>`;
      grid.appendChild(c);
    });
  })();

  /* ---------- Build-your-own matrix ---------- */
  (function build() {
    const matrix = $("#buildMatrix");
    const result = $("#buildResult");
    const chosen = {}; // key -> option object

    PLAN.build.columns.forEach((col) => {
      const row = el("div", "build-row");
      row.appendChild(el("div", "br-label", col.label));
      const opts = el("div", "build-opts");
      col.options.forEach((o) => {
        const b = el("button", "opt", o.name);
        b.addEventListener("click", () => {
          const already = chosen[col.key] && chosen[col.key].name === o.name;
          opts.querySelectorAll(".opt").forEach((x) => x.classList.remove("selected"));
          if (already) {
            delete chosen[col.key];
          } else {
            chosen[col.key] = o;
            b.classList.add("selected");
          }
          renderResult();
        });
        opts.appendChild(b);
      });
      row.appendChild(opts);
      matrix.appendChild(row);
    });

    function renderResult() {
      const keys = PLAN.build.columns.map((c) => c.key);
      const picked = keys.filter((k) => chosen[k]);
      if (picked.length === 0) {
        result.innerHTML = `<p class="build-empty">Pick a base, protein, veg & dressing to plate a meal.</p>`;
        return;
      }
      const total = picked.reduce((sum, k) => sum + chosen[k].p, 0);
      const parts = picked.map((k) => `<span>${chosen[k].name}</span>`).join("");
      const combo = [chosen.protein, chosen.base]
        .filter(Boolean)
        .map((o) => o.name)
        .join(" + ") || "Your plate";
      result.innerHTML = `
        <div class="br-title">Your plate</div>
        <div class="br-combo">${combo}</div>
        <div class="br-parts">${parts}</div>
        <div class="br-foot">
          <span class="br-hint">${PLAN.build.formatHint}</span>
          <span class="br-protein"><b>~${total}g</b><span>protein</span></span>
        </div>`;
    }
  })();

  /* ---------- Grocery list (persisted) ---------- */
  (function grocery() {
    const list = $("#groceryList");
    const bar = $("#groceryBar");
    const count = $("#groceryCount");
    const KEY = "graze.grocery.v1";
    let state = {};
    try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { state = {}; }

    let total = 0;
    const checkSvg = `<svg viewBox="0 0 16 16"><polyline points="2,8 6,12 14,3"/></svg>`;

    PLAN.grocery.forEach((g) => {
      const group = el("div", "grocery-group");
      group.appendChild(el("h3", null, g.group));
      g.items.forEach((item) => {
        total++;
        const id = g.group + "::" + item;
        const row = el("div", "g-item");
        if (state[id]) row.classList.add("checked");
        row.innerHTML = `<span class="g-check">${checkSvg}</span><span class="g-text">${item}</span>`;
        row.addEventListener("click", () => {
          row.classList.toggle("checked");
          state[id] = row.classList.contains("checked");
          save();
          update();
        });
        group.appendChild(row);
      });
      list.appendChild(group);
    });

    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    }
    function update() {
      const done = Object.values(state).filter(Boolean).length;
      bar.style.width = total ? (done / total) * 100 + "%" : "0%";
      count.textContent = done + " / " + total;
    }
    $("#resetGrocery").addEventListener("click", () => {
      state = {};
      save();
      list.querySelectorAll(".g-item").forEach((r) => r.classList.remove("checked"));
      update();
    });
    update();
  })();

  /* ---------- Swap accordion ---------- */
  (function swaps() {
    const wrap = $("#swapList");
    PLAN.swaps.forEach((s, idx) => {
      const card = el("div", "swap-card");
      const items = s.items.map((i) => `<li>${i}</li>`).join("");
      card.innerHTML = `
        <button class="swap-head" aria-expanded="${idx === 0}">
          <span class="sw-ico">${s.icon}</span>
          <span class="sw-title">${s.slot}</span>
          <span class="sw-arrow">▾</span>
        </button>
        <div class="swap-body"><ul>${items}</ul></div>`;
      const head = $(".swap-head", card);
      const body = $(".swap-body", card);
      head.addEventListener("click", () => {
        const open = card.classList.toggle("open");
        head.setAttribute("aria-expanded", open);
        body.style.maxHeight = open ? body.scrollHeight + "px" : 0;
      });
      wrap.appendChild(card);
      if (idx === 0) {
        card.classList.add("open");
        requestAnimationFrame(() => { body.style.maxHeight = body.scrollHeight + "px"; });
      }
    });
  })();

  /* ---------- Tips ---------- */
  (function tips() {
    const grid = $("#tipsGrid");
    PLAN.tips.forEach((t) => {
      const card = el("div", "tip-card");
      const steps = t.steps.map((s) => `<li>${s}</li>`).join("");
      card.innerHTML = `<h3><span class="t-ico">${t.icon}</span>${t.title}</h3><ol>${steps}</ol>`;
      grid.appendChild(card);
    });
  })();

  /* ---------- Scroll-spy bottom nav + topbar shadow ---------- */
  (function nav() {
    const items = Array.from(document.querySelectorAll(".nav-item"));
    const sections = items.map((i) => document.getElementById(i.dataset.target));
    const topbar = $("#topbar");

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = e.target.id;
            items.forEach((it) => it.classList.toggle("active", it.dataset.target === id));
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => s && obs.observe(s));

    items.forEach((it) => {
      it.addEventListener("click", (e) => {
        e.preventDefault();
        document.getElementById(it.dataset.target).scrollIntoView({ behavior: "smooth" });
      });
    });

    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          topbar.classList.toggle("scrolled", window.scrollY > 8);
          ticking = false;
        });
        ticking = true;
      }
    });
  })();

  /* ---------- Open directly on the plan (skip the hero) ---------- */
  (function openOnPlan() {
    if (location.hash) return; // respect a deep link like #grocery
    const plan = document.getElementById("plan");
    if (!plan) return;
    let interacted = false;
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach((ev) =>
      window.addEventListener(ev, () => { interacted = true; }, { passive: true, once: true })
    );
    const jump = () => {
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto"; // no animation on open
      plan.scrollIntoView({ block: "start" });
      root.style.scrollBehavior = prev;
    };
    requestAnimationFrame(() => requestAnimationFrame(jump));
    // Re-align after fonts/images settle, unless the user already engaged.
    window.addEventListener("load", () => { if (!interacted) jump(); });
  })();

  /* ---------- Service worker ---------- */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {});
    });
  }
})();
