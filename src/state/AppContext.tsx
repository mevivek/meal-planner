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
  // onboarding
  needsOnboarding: boolean;
  editing: boolean;
  completeOnboarding: (p: Prefs) => void;
  editPreferences: () => void;
  cancelEditing: () => void;
  // plan actions (re-plan in place)
  regenerate: () => void;
  resetAll: () => void;
  excludeMeal: (id: string) => void;
  restoreMeal: (id: string) => void;
  toggleItem: (name: string) => boolean;
  setOverride: (dayKey: string, slot: string, id: string) => void;
  setDayType: (dayKey: string, mode: "office" | "wfh" | "off") => void;
  alternatesFor: (dayKey: string, slot: string, currentId: string) => Meal[];
  // meal logging (today-scoped)
  isEaten: (slot: string) => boolean;
  toggleEaten: (slot: string) => void;
  // brand picker (ingredient token -> product id)
  brands: Record<string, string>;
  setBrand: (token: string, productId: string) => void;
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
  const savedPrefs = useMemo(() => load<Prefs | null>(KEYS.prefs, null), []);
  const [meals, setMeals] = useState<Meal[] | null>(null);
  const [prefs, setPrefs] = useState<Prefs>(savedPrefs ?? defaultPrefs);
  const [needsOnboarding, setNeedsOnboarding] = useState(savedPrefs == null);
  const [editing, setEditing] = useState(false);
  const [log, setLog] = useState<Record<string, boolean>>(() => load(KEYS.log, {}));
  const [brands, setBrands] = useState<Record<string, string>>(() => load(KEYS.brands, {}));
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

  const completeOnboarding = (p: Prefs) => {
    save(KEYS.prefs, p);
    setPrefs(p);
    setNeedsOnboarding(false);
    setEditing(false);
  };
  const editPreferences = () => setEditing(true);
  const cancelEditing = () => setEditing(false);

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

  const setDayType = (dayKey: string, mode: "office" | "wfh" | "off") =>
    updatePrefs((p) => ({ ...p, schedule: { dayTypes: { ...(p.schedule?.dayTypes || {}), [dayKey]: mode } } }));

  const alternatesFor = (dayKey: string, slot: string, currentId: string): Meal[] =>
    meals ? engine.alternatesFor(prefs, dayKey, slot, currentId, meals) : [];

  const setBrand = (token: string, productId: string) =>
    setBrands((prev) => {
      const next = { ...prev };
      if (productId) next[token] = productId;
      else delete next[token];
      save(KEYS.brands, next);
      return next;
    });

  const isEaten = (slot: string) => !!log[`${todayISO}:${slot}`];
  const toggleEaten = (slot: string) =>
    setLog((prev) => {
      const next = { ...prev, [`${todayISO}:${slot}`]: !prev[`${todayISO}:${slot}`] };
      save(KEYS.log, next);
      return next;
    });

  return (
    <Ctx.Provider
      value={{
        prefs, plan, meals, todayKey,
        needsOnboarding, editing, completeOnboarding, editPreferences, cancelEditing,
        regenerate, resetAll, excludeMeal, restoreMeal, toggleItem, setOverride, setDayType, alternatesFor,
        isEaten, toggleEaten,
        brands, setBrand,
        theme, setTheme,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
