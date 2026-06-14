import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Engine } from "../lib/engine";
import { mealSource } from "../lib/mealSource";
import { KEYS, load, save, remove } from "../lib/storage";
import { useTheme, type Theme } from "../lib/useTheme";
import { defaultPrefs } from "./defaultPrefs";
import type { Meal, Plan, Prefs } from "../lib/types";

// Loosely-typed engine surface (engine.ts is ported JS, tightened later).
const engine = Engine as unknown as {
  generatePlan: (p: Prefs, meals: Meal[]) => Plan;
  alternatesFor: (p: Prefs, dayKey: string, slot: string, currentId: string, meals: Meal[]) => Meal[];
};
const DAY_BY_WEEKDAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

interface AppValue {
  prefs: Prefs;
  plan: Plan | null;
  meals: Meal[] | null;
  todayKey: string;
  // plan actions (re-plan in place)
  regenerate: () => void;
  resetAll: () => void;
  excludeMeal: (id: string) => void;
  restoreMeal: (id: string) => void;
  toggleItem: (name: string) => boolean; // returns whether it's now avoided
  setOverride: (dayKey: string, slot: string, id: string) => void;
  alternatesFor: (dayKey: string, slot: string, currentId: string) => Meal[];
  // meal logging (today-scoped)
  isEaten: (slot: string) => boolean;
  toggleEaten: (slot: string) => void;
  // theme
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const Ctx = createContext<AppValue | null>(null);

export function useApp(): AppValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be used within <AppProvider>");
  return v;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [prefs, setPrefs] = useState<Prefs>(() => load<Prefs>(KEYS.prefs, defaultPrefs));
  const [log, setLog] = useState<Record<string, boolean>>(() => load(KEYS.log, {}));
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    let alive = true;
    mealSource.getMeals().then((m) => alive && setMeals(m));
    return () => {
      alive = false;
    };
  }, []);

  const plan = useMemo<Plan | null>(() => (meals ? engine.generatePlan(prefs, meals) : null), [meals, prefs]);
  const todayKey = DAY_BY_WEEKDAY[new Date().getDay()] || "mon";
  const todayISO = new Date().toISOString().slice(0, 10);

  const updatePrefs = (fn: (p: Prefs) => Prefs) =>
    setPrefs((prev) => {
      const next = fn(prev);
      save(KEYS.prefs, next);
      return next;
    });

  const regenerate = () => updatePrefs((p) => ({ ...p, seed: Date.now() % 2147483647, overrides: {} }));

  const resetAll = () => {
    remove(KEYS.prefs);
    remove(KEYS.grocery);
    remove(KEYS.log);
    window.location.reload();
  };

  const excludeMeal = (id: string) =>
    updatePrefs((p) => {
      const excludedMeals = [...(p.excludedMeals || [])];
      if (!excludedMeals.includes(id)) excludedMeals.push(id);
      const overrides = { ...(p.overrides || {}) };
      for (const k of Object.keys(overrides)) if (overrides[k] === id) delete overrides[k];
      return { ...p, excludedMeals, overrides };
    });

  const restoreMeal = (id: string) =>
    updatePrefs((p) => ({ ...p, excludedMeals: (p.excludedMeals || []).filter((x) => x !== id) }));

  const toggleItem = (name: string): boolean => {
    const added = !(prefs.excludedItems || []).includes(name);
    updatePrefs((p) => {
      const set = new Set(p.excludedItems || []);
      if (added) set.add(name);
      else set.delete(name);
      return { ...p, excludedItems: [...set] };
    });
    return added;
  };

  const setOverride = (dayKey: string, slot: string, id: string) =>
    updatePrefs((p) => ({ ...p, overrides: { ...(p.overrides || {}), [`${dayKey}:${slot}`]: id } }));

  const alternatesFor = (dayKey: string, slot: string, currentId: string): Meal[] =>
    meals ? engine.alternatesFor(prefs, dayKey, slot, currentId, meals) : [];

  const isEaten = (slot: string) => !!log[`${todayISO}:${slot}`];
  const toggleEaten = (slot: string) =>
    setLog((prev) => {
      const key = `${todayISO}:${slot}`;
      const next = { ...prev, [key]: !prev[key] };
      save(KEYS.log, next);
      return next;
    });

  return (
    <Ctx.Provider
      value={{
        prefs, plan, meals, todayKey,
        regenerate, resetAll, excludeMeal, restoreMeal, toggleItem, setOverride, alternatesFor,
        isEaten, toggleEaten,
        theme, setTheme,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
