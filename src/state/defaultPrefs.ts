/* A sensible default preferences object, matching the schema the onboarding
   wizard produces (see docs/ENGINE.md). Used to render a plan before the React
   onboarding flow is ported (Phase 3). Mirrors the legacy wizard's freshState. */

import type { Prefs } from "../lib/types";

export const defaultPrefs: Prefs = {
  profile: { age: null, gender: null, weightKg: null, heightCm: null },
  diet: { base: "vegetarian", egg: false, dislikes: [], allergens: [] },
  cooking: { level: "sear", maxPrep: 15, cookDays: ["sat", "sun"], lastMealBy: "20:00" },
  schedule: {
    dayTypes: { mon: "wfh", tue: "wfh", wed: "wfh", thu: "wfh", fri: "wfh", sat: "off", sun: "off" },
  },
  goals: { goal: "maintain", proteinTarget: null, mealsPerDay: 3, cuisines: ["indian", "global", "mezze", "thai", "mexican"], variety: "high" },
  wellness: [],
  seed: 1,
};
