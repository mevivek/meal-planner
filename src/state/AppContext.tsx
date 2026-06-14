import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Engine } from "../lib/engine";
import { mealSource } from "../lib/mealSource";
import { KEYS, load, save, remove } from "../lib/storage";
import { useTheme, type Theme } from "../lib/useTheme";
import { defaultPrefs } from "./defaultPrefs";
import type { Meal, Plan, Prefs } from "../lib/types";

// Loosely-typed engine surface (engine.ts is ported JS, tightened later).
const planner = Engine as unknown as { generatePlan: (p: Prefs, meals: Meal[]) => Plan };
const DAY_BY_WEEKDAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

interface AppValue {
  prefs: Prefs;
  plan: Plan | null;
  todayKey: string;
  regenerate: () => void;
  resetAll: () => void;
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
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    let alive = true;
    mealSource.getMeals().then((m) => alive && setMeals(m));
    return () => {
      alive = false;
    };
  }, []);

  const plan = useMemo<Plan | null>(() => (meals ? planner.generatePlan(prefs, meals) : null), [meals, prefs]);
  const todayKey = DAY_BY_WEEKDAY[new Date().getDay()] || "mon";

  const regenerate = () =>
    setPrefs((prev) => {
      const next: Prefs = { ...prev, seed: Date.now() % 2147483647, overrides: {} };
      save(KEYS.prefs, next);
      return next;
    });

  const resetAll = () => {
    remove(KEYS.prefs);
    remove(KEYS.grocery);
    window.location.reload();
  };

  return (
    <Ctx.Provider value={{ prefs, plan, todayKey, regenerate, resetAll, theme, setTheme }}>
      {children}
    </Ctx.Provider>
  );
}
