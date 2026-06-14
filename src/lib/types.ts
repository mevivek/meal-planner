/* Shared types for the meal-planner app.
   These describe the shapes produced by the ported engine/data modules
   (see docs/ENGINE.md). The engine itself is still loosely typed during the
   migration; these types cover the new app code that consumes it. */

export type Slot = "breakfast" | "lunch" | "dinner" | "snack";
export type Cook = "none" | "sear" | "cook";
export type DayType = "office" | "wfh" | "off";

export interface MealItem {
  n: string; // grocery line
  c: string; // category (protein|grain|produce|dairy|nuts|pantry|cooking)
}

export interface Meal {
  id: string;
  slot: Slot;
  name: string;
  icon: string;
  protein: number;
  prep: number;
  cook: Cook;
  pack: boolean;
  cuisine: string;
  contains: string[];
  wellness: string[];
  detail: string;
  items?: MealItem[];
  recipe?: string[];
}

export interface Prefs {
  profile?: { age?: number | null; gender?: string | null; weightKg?: number | null; heightCm?: number | null };
  diet?: { base: "vegetarian" | "vegan"; egg: boolean; dislikes: string[]; allergens: string[] };
  cooking?: { level: Cook; maxPrep: number; cookDays: string[]; lastMealBy: string };
  schedule?: { dayTypes: Record<string, DayType> };
  goals?: { goal: "cut" | "maintain" | "bulk"; proteinTarget?: number | null; mealsPerDay: number; cuisines: string[]; variety?: string };
  wellness?: string[];
  seed?: number;
  overrides?: Record<string, string>;
  excludedMeals?: string[];
  excludedItems?: string[];
}

export interface PlanDay {
  key: string;
  label: string;
  full: string;
  dayType: DayType;
  cookAllowed: boolean;
  total: number;
  target: number;
  meals: Meal[];
}

export interface Plan {
  target: number;
  days: PlanDay[];
  seed: number;
  generatedAt: number;
}
