/* Data-source seam for meals/recipes.
   ---------------------------------------------------------------------------
   Today the catalogue is the built-in static library (src/lib/data.ts). This
   indirection exists so the source can later be swapped for Claude-generated
   content WITHOUT touching the engine or the screens — see
   docs/UI-REVAMP-PLAN.md §"Claude-hosted recipes/items".

   Hard constraint: this is a keyless client-side PWA, so the Anthropic API key
   can never ship in the browser bundle. A future ClaudeMealSource must read a
   pre-generated static JSON (build-time generation) or fetch from a thin
   serverless proxy that holds the key — never call the API directly here. */

import { MEALS } from "./data";
import type { Meal } from "./types";

export interface MealSource {
  /** Return the meal catalogue the engine plans from. */
  getMeals(): Promise<Meal[]>;
}

/** The built-in library — current behaviour. */
export const staticMealSource: MealSource = {
  async getMeals() {
    return MEALS as unknown as Meal[];
  },
};

// Active source. Swap this (or make it config-driven) when Claude-hosted
// content lands; everything downstream consumes the MealSource interface.
export const mealSource: MealSource = staticMealSource;
