import type { PlanDay } from "../lib/types";

const SLOT_LABEL: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Early dinner",
  snack: "Booster",
};

const DATE_FMT = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" });

/** Minimal Today screen — proves the engine output renders in React.
 *  The full Today design (protein ring, meal logging, swap/exclude actions)
 *  lands in a later phase; see docs/UI-REVAMP-PLAN.md §5.1. */
export function Today({ day }: { day: PlanDay }) {
  const pct = day.target ? Math.min(100, Math.round((day.total / day.target) * 100)) : 0;

  return (
    <section className="today">
      <header className="today-head">
        <p className="today-date">{DATE_FMT.format(new Date())}</p>
        <span className={`day-type day-type--${day.dayType}`}>{day.dayType}</span>
      </header>

      <div className="protein">
        <div className="protein-row">
          <span className="protein-now">
            {day.total}
            <span className="protein-unit">g</span>
          </span>
          <span className="protein-target">/ {day.target}g protein</span>
        </div>
        <div className="protein-bar">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ul className="meals">
        {day.meals.map((m) => (
          <li key={m.id} className="meal">
            <span className="meal-icon" aria-hidden="true">{m.icon}</span>
            <div className="meal-body">
              <span className="meal-slot">{SLOT_LABEL[m.slot] ?? m.slot}</span>
              <h2 className="meal-name">{m.name}</h2>
              <p className="meal-detail">{m.detail}</p>
              <div className="meal-meta">
                <span>{m.protein}g protein</span>
                <span>{m.prep} min</span>
              </div>
              {m.recipe && m.recipe.length > 0 && (
                <details className="meal-recipe">
                  <summary>Recipe · {m.recipe.length} steps</summary>
                  <ol>{m.recipe.map((s, i) => <li key={i}>{s}</li>)}</ol>
                </details>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
