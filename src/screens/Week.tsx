import { useState } from "react";
import { useApp } from "../state/AppContext";
import { TopBar, IconButton } from "../components/TopBar";
import { IconRefresh } from "../components/icons";
import { MealCard } from "../components/MealCard";

export function Week() {
  const { plan, todayKey, regenerate } = useApp();
  const [open, setOpen] = useState<string | null>(todayKey);
  if (!plan) return <p className="loading">Loading your week…</p>;

  return (
    <>
      <TopBar
        title="Your week"
        subtitle={`Target ~${plan.target}g protein/day`}
        action={<IconButton label="Regenerate week" onClick={regenerate}><IconRefresh /></IconButton>}
      />
      <div className="content">
        <ul className="week-list">
          {plan.days.map((d) => {
            const isOpen = open === d.key;
            return (
              <li key={d.key} className={"week-day" + (isOpen ? " is-open" : "")}>
                <button type="button" className="week-row" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : d.key)}>
                  <span className={`dot dot--${d.dayType}`} aria-hidden="true" />
                  <span className="week-name">{d.full}{d.key === todayKey ? <span className="today-pill">Today</span> : null}</span>
                  <span className="week-total">{d.total}g</span>
                  <span className="week-chev" aria-hidden="true">▾</span>
                </button>
                {isOpen && <ul className="meals week-meals">{d.meals.map((m) => <MealCard key={m.id} meal={m} />)}</ul>}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
