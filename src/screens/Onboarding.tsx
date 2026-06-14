import { useState } from "react";
import { WELLNESS, CUISINES, DAY_KEYS, DAY_LABEL } from "../lib/data";
import type { Prefs } from "../lib/types";

const WELL = WELLNESS as { id: string; label: string; icon: string }[];
const CUIS = CUISINES as { id: string; label: string }[];
const DAYS = DAY_KEYS as string[];
const DLABEL = DAY_LABEL as Record<string, string>;

interface OB {
  age: string; gender: string; weight: string; height: string;
  dietBase: "vegetarian" | "vegan"; egg: "no" | "yes"; exclusions: string[]; allergens: string[];
  cookLevel: "none" | "sear" | "cook"; maxPrep: number; lastMeal: string; cookDays: string[];
  dayTypes: Record<string, "office" | "wfh" | "off">;
  goal: "cut" | "maintain" | "bulk"; mealsPerDay: number; proteinMode: "auto" | "custom"; proteinValue: string;
  cuisines: string[]; wellness: string[];
}

function freshState(): OB {
  return {
    age: "", gender: "", weight: "", height: "",
    dietBase: "vegetarian", egg: "no", exclusions: [], allergens: [],
    cookLevel: "sear", maxPrep: 15, lastMeal: "20:00", cookDays: ["sat", "sun"],
    dayTypes: { mon: "wfh", tue: "wfh", wed: "wfh", thu: "wfh", fri: "wfh", sat: "off", sun: "off" },
    goal: "maintain", mealsPerDay: 3, proteinMode: "auto", proteinValue: "75",
    cuisines: CUIS.map((c) => c.id), wellness: [],
  };
}

function fromPrefs(p: Prefs | null): OB {
  const s = freshState();
  if (!p) return s;
  if (p.profile) {
    s.age = p.profile.age != null ? String(p.profile.age) : "";
    s.gender = p.profile.gender || "";
    s.weight = p.profile.weightKg != null ? String(p.profile.weightKg) : "";
    s.height = p.profile.heightCm != null ? String(p.profile.heightCm) : "";
  }
  if (p.diet) {
    s.dietBase = p.diet.base || "vegetarian";
    s.egg = p.diet.egg ? "yes" : "no";
    s.exclusions = [...(p.diet.dislikes || [])];
    s.allergens = [...(p.diet.allergens || [])];
  }
  if (p.cooking) {
    s.cookLevel = p.cooking.level || "sear";
    s.maxPrep = p.cooking.maxPrep || 15;
    s.lastMeal = p.cooking.lastMealBy || "20:00";
    s.cookDays = [...(p.cooking.cookDays || [])];
  }
  if (p.schedule?.dayTypes) s.dayTypes = { ...s.dayTypes, ...p.schedule.dayTypes };
  if (p.goals) {
    s.goal = p.goals.goal || "maintain";
    s.mealsPerDay = p.goals.mealsPerDay || 3;
    s.proteinMode = p.goals.proteinTarget ? "custom" : "auto";
    s.proteinValue = p.goals.proteinTarget ? String(p.goals.proteinTarget) : "75";
    s.cuisines = [...(p.goals.cuisines || s.cuisines)];
  }
  if (p.wellness) s.wellness = [...p.wellness];
  return s;
}

function buildPrefs(s: OB, prevSeed?: number): Prefs {
  return {
    profile: { age: Number(s.age) || null, gender: s.gender || null, weightKg: Number(s.weight) || null, heightCm: Number(s.height) || null },
    diet: { base: s.dietBase, egg: s.egg === "yes", dislikes: [...s.exclusions], allergens: [...s.allergens] },
    cooking: { level: s.cookLevel, maxPrep: Number(s.maxPrep) || 15, cookDays: [...s.cookDays], lastMealBy: s.lastMeal },
    schedule: { dayTypes: { ...s.dayTypes } },
    goals: { goal: s.goal, proteinTarget: s.proteinMode === "custom" ? Number(s.proteinValue) || null : null, mealsPerDay: Number(s.mealsPerDay) || 3, cuisines: [...s.cuisines], variety: "high" },
    wellness: [...s.wellness],
    seed: prevSeed || Date.now() % 2147483647,
  };
}

function Chips<T extends string | number>({ options, selected, onPick, multi }: {
  options: { v: T; label: string; icon?: string }[];
  selected: T | T[];
  onPick: (v: T) => void;
  multi?: boolean;
}) {
  return (
    <div className="chips">
      {options.map((o) => {
        const on = multi ? (selected as T[]).includes(o.v) : selected === o.v;
        return (
          <button key={String(o.v)} type="button" className={"chip" + (on ? " chip--on" : "")} aria-pressed={on} onClick={() => onPick(o.v)}>
            {o.icon ? `${o.icon} ` : ""}{o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Onboarding({ initial, onComplete, onCancel }: { initial: Prefs | null; onComplete: (p: Prefs) => void; onCancel?: () => void }) {
  const [s, setS] = useState<OB>(() => fromPrefs(initial));
  const [i, setI] = useState(0);
  const set = (patch: Partial<OB>) => setS((prev) => ({ ...prev, ...patch }));
  const toggle = (key: "exclusions" | "allergens" | "cookDays" | "cuisines" | "wellness", v: string) =>
    setS((prev) => {
      const arr = new Set(prev[key]);
      arr.has(v) ? arr.delete(v) : arr.add(v);
      return { ...prev, [key]: [...arr] };
    });

  const steps: { title: string; subtitle?: string; body: () => JSX.Element }[] = [
    {
      title: "Welcome", subtitle: "Answer a few quick questions and we'll generate a personalised vegetarian week you can regenerate anytime.",
      body: () => <p className="ob-lead">No accounts, nothing leaves your device. Takes about a minute.</p>,
    },
    {
      title: "About you", subtitle: "Used to set a sensible protein target. Weight & height are optional.",
      body: () => (
        <>
          <div className="ob-grid3">
            <NumberField label="Age" value={s.age} onChange={(v) => set({ age: v })} suffix="yrs" />
            <NumberField label="Weight" value={s.weight} onChange={(v) => set({ weight: v })} suffix="kg" />
            <NumberField label="Height" value={s.height} onChange={(v) => set({ height: v })} suffix="cm" />
          </div>
          <p className="field-label">Gender</p>
          <Chips options={[{ v: "female", label: "Female" }, { v: "male", label: "Male" }, { v: "other", label: "Other" }, { v: "na", label: "Prefer not to say" }]} selected={s.gender} onPick={(v) => set({ gender: v })} />
        </>
      ),
    },
    {
      title: "Diet", subtitle: "Everything stays vegetarian. Tell us what to leave out.",
      body: () => (
        <>
          <p className="field-label">Base</p>
          <Chips options={[{ v: "vegetarian", label: "Vegetarian" }, { v: "vegan", label: "Vegan (no dairy/paneer)" }]} selected={s.dietBase} onPick={(v) => set({ dietBase: v as OB["dietBase"] })} />
          <p className="field-label">Do you eat egg?</p>
          <Chips options={[{ v: "no", label: "No egg" }, { v: "yes", label: "Egg is fine" }]} selected={s.egg} onPick={(v) => set({ egg: v as OB["egg"] })} />
          <p className="field-label">Leave these out</p>
          <Chips multi options={[{ v: "tofu", label: "No tofu" }, { v: "paneer", label: "No paneer" }, { v: "curd", label: "No curd/yogurt" }, { v: "peanut", label: "No peanut" }]} selected={s.exclusions} onPick={(v) => toggle("exclusions", v)} />
        </>
      ),
    },
    {
      title: "Allergens", subtitle: "We'll never put these in your plan.",
      body: () => (
        <>
          <Chips multi options={[{ v: "nuts", label: "Tree nuts" }, { v: "peanut", label: "Peanuts" }, { v: "gluten", label: "Gluten" }, { v: "soy", label: "Soy" }, { v: "seeds", label: "Seeds" }]} selected={s.allergens} onPick={(v) => toggle("allergens", v)} />
          <p className="ob-hint">None? Just leave them all off.</p>
        </>
      ),
    },
    {
      title: "Cooking", subtitle: "How much effort, and when can you actually cook?",
      body: () => (
        <>
          <p className="field-label">Most you'll do</p>
          <Chips options={[{ v: "none", label: "No cooking" }, { v: "sear", label: "Quick sear / toast" }, { v: "cook", label: "Full cooking" }]} selected={s.cookLevel} onPick={(v) => set({ cookLevel: v as OB["cookLevel"] })} />
          <p className="field-label">Max prep on no-cook days</p>
          <Chips options={[{ v: 10, label: "10 min" }, { v: 15, label: "15 min" }, { v: 20, label: "20 min" }]} selected={s.maxPrep} onPick={(v) => set({ maxPrep: v as number })} />
          <p className="field-label">Last meal by</p>
          <Chips options={[{ v: "19:00", label: "7 pm" }, { v: "20:00", label: "8 pm" }, { v: "21:00", label: "9 pm" }, { v: "23:00", label: "Late / no limit" }]} selected={s.lastMeal} onPick={(v) => set({ lastMeal: v as string })} />
          <p className="field-label">Days you can cook</p>
          <Chips multi options={DAYS.map((d) => ({ v: d, label: DLABEL[d] }))} selected={s.cookDays} onPick={(v) => toggle("cookDays", v)} />
        </>
      ),
    },
    {
      title: "Your week", subtitle: "Office days pack lunch + an early dinner; WFH/Off assemble fresh.",
      body: () => (
        <div className="ob-days">
          {DAYS.map((d) => (
            <div key={d} className="ob-dayrow">
              <span className="ob-dayname">{DLABEL[d]}</span>
              <Chips
                options={[{ v: "office", label: "Office" }, { v: "wfh", label: "WFH" }, { v: "off", label: "Off" }]}
                selected={s.dayTypes[d]}
                onPick={(v) => set({ dayTypes: { ...s.dayTypes, [d]: v as "office" | "wfh" | "off" } })}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Goal & protein", subtitle: "We'll aim each day near your target.",
      body: () => (
        <>
          <p className="field-label">Goal</p>
          <Chips options={[{ v: "cut", label: "Lean / cut" }, { v: "maintain", label: "Maintain" }, { v: "bulk", label: "Build / bulk" }]} selected={s.goal} onPick={(v) => set({ goal: v as OB["goal"] })} />
          <p className="field-label">Meals per day</p>
          <Chips options={[{ v: 2, label: "2" }, { v: 3, label: "3" }]} selected={s.mealsPerDay} onPick={(v) => set({ mealsPerDay: v as number })} />
          <p className="field-label">Daily protein</p>
          <Chips options={[{ v: "auto", label: "Auto" }, { v: "custom", label: "Set my own" }]} selected={s.proteinMode} onPick={(v) => set({ proteinMode: v as OB["proteinMode"] })} />
          {s.proteinMode === "custom" && (
            <div className="ob-custom"><NumberField label="Protein" value={s.proteinValue} onChange={(v) => set({ proteinValue: v })} suffix="g/day" /></div>
          )}
        </>
      ),
    },
    {
      title: "Cuisines", subtitle: "Pick what you like — we'll lean into these.",
      body: () => <Chips multi options={CUIS.map((c) => ({ v: c.id, label: c.label }))} selected={s.cuisines} onPick={(v) => toggle("cuisines", v)} />,
    },
    {
      title: "Wellness focus", subtitle: "We'll bias meals toward these benefits. Pick any (or none).",
      body: () => <Chips multi options={WELL.map((w) => ({ v: w.id, label: w.label, icon: w.icon }))} selected={s.wellness} onPick={(v) => toggle("wellness", v)} />,
    },
  ];

  const step = steps[i];
  const last = i === steps.length - 1;

  return (
    <div className="onboarding">
      <div className="ob-card">
        <div className="ob-progress">
          {steps.map((_, k) => <span key={k} className={"ob-dot" + (k <= i ? " on" : "")} />)}
        </div>
        <h1 className="ob-title">{step.title}</h1>
        {step.subtitle && <p className="ob-sub">{step.subtitle}</p>}
        <div className="ob-body">{step.body()}</div>
        <div className="ob-nav">
          {i > 0 ? (
            <button type="button" className="btn" onClick={() => setI((n) => Math.max(0, n - 1))}>Back</button>
          ) : onCancel ? (
            <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => (last ? onComplete(buildPrefs(s, initial?.seed)) : setI((n) => n + 1))}
          >
            {last ? "Generate my plan" : i === 0 ? "Get started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, suffix }: { label: string; value: string; onChange: (v: string) => void; suffix?: string }) {
  return (
    <label className="ob-num">
      <input type="number" inputMode="numeric" placeholder={label} value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
      {suffix && <span className="ob-suffix">{suffix}</span>}
    </label>
  );
}
