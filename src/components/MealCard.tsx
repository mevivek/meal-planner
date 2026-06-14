import type { Meal } from "../lib/types";
import { useApp } from "../state/AppContext";
import { BRAND_INDEX, brandableTokens, titleCase } from "../lib/brands";

const SLOT_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Early dinner",
  snack: "Booster",
};

export interface MealCardProps {
  meal: Meal;
  eaten?: boolean;
  onToggleEaten?: () => void;
  onSwap?: () => void;
  onExclude?: () => void;
}

export function MealCard({ meal, eaten, onToggleEaten, onSwap, onExclude }: MealCardProps) {
  const { brands, setBrand } = useApp();
  const tokens = brandableTokens(meal);
  const hasActions = onToggleEaten || onSwap || onExclude;
  return (
    <li className={"meal" + (eaten ? " meal--eaten" : "")}>
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

        {tokens.length > 0 && (
          <div className="brand-row">
            {tokens.map((t) => (
              <label key={t} className="brand-pick">
                <span>🏷️ {titleCase(t)}</span>
                <select value={brands[t] ?? ""} onChange={(e) => setBrand(t, e.target.value)}>
                  <option value="">Any brand</option>
                  {BRAND_INDEX[t].map((p) => (
                    <option key={p.id} value={p.id}>{p.brand} · {p.per.protein}g · {p.serving}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}

        {hasActions && (
          <div className="meal-actions">
            {onToggleEaten && (
              <button type="button" className={"act act--eat" + (eaten ? " is-on" : "")} aria-pressed={!!eaten} onClick={onToggleEaten}>
                {eaten ? "✓ Eaten" : "Mark eaten"}
              </button>
            )}
            {onSwap && <button type="button" className="act" onClick={onSwap}>Swap</button>}
            {onExclude && <button type="button" className="act act--danger" onClick={onExclude}>Exclude</button>}
          </div>
        )}
      </div>
    </li>
  );
}
