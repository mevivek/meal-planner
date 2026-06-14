import { useEffect, useMemo, useState } from "react";
import { Engine } from "./lib/engine";
import { mealSource } from "./lib/mealSource";
import { load, KEYS } from "./lib/storage";
import { defaultPrefs } from "./state/defaultPrefs";
import type { Meal, Plan, Prefs } from "./lib/types";
import { Today } from "./screens/Today";

// Loosely-typed engine surface (engine.ts is ported JS, tightened in a later phase).
const planner = Engine as unknown as { generatePlan: (p: Prefs, meals: Meal[]) => Plan };

const DAY_BY_WEEKDAY = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function App() {
  const [meals, setMeals] = useState<Meal[] | null>(null);

  // Load the catalogue through the data-source seam (static today, Claude-hosted later).
  useEffect(() => {
    let alive = true;
    mealSource.getMeals().then((m) => {
      if (alive) setMeals(m);
    });
    return () => {
      alive = false;
    };
  }, []);

  const prefs = useMemo<Prefs>(() => load<Prefs>(KEYS.prefs, defaultPrefs), []);
  const plan = useMemo<Plan | null>(() => (meals ? planner.generatePlan(prefs, meals) : null), [meals, prefs]);

  const todayKey = DAY_BY_WEEKDAY[new Date().getDay()] || "mon";

  if (!plan) {
    return (
      <main className="app">
        <p className="loading">Loading your week…</p>
      </main>
    );
  }

  const day = plan.days.find((d) => d.key === todayKey) ?? plan.days[0];

  return (
    <main className="app">
      <Today day={day} />
      <p className="phase-note">
        Phase 0 scaffold · React + Vite + TypeScript, rendering a live plan from the ported engine.
      </p>
    </main>
  );
}
