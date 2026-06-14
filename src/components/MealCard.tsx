import type { Meal } from "../lib/types";

const SLOT_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Early dinner",
  snack: "Booster",
};

export function MealCard({ meal }: { meal: Meal }) {
  return (
    <li className="meal">
      <span className="meal-icon" aria-hidden="true">{meal.icon}</span>
      <div className="meal-body">
        <span className="meal-slot">{SLOT_LABEL[meal.slot] ?? meal.slot}</span>
        <h3 className="meal-name">{meal.name}</h3>
        <p className="meal-detail">{meal.detail}</p>
        <div className="meal-meta">
          <span className="tag tag--protein">{meal.protein}g protein</span>
          <span className="tag">{meal.prep} min</span>
          {meal.cook !== "none" && <span className="tag">{meal.cook === "cook" ? "Cooked" : "Quick sear"}</span>}
        </div>
        {meal.recipe && meal.recipe.length > 0 && (
          <details className="meal-recipe">
            <summary>Recipe · {meal.recipe.length} steps</summary>
            <ol>{meal.recipe.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </details>
        )}
      </div>
    </li>
  );
}
