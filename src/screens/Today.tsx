import { useState } from "react";
import { useApp } from "../state/AppContext";
import { TopBar, IconButton } from "../components/TopBar";
import { IconRefresh } from "../components/icons";
import { MealCard } from "../components/MealCard";
import { ProteinRing } from "../components/ProteinRing";
import { SwapSheet } from "../components/SwapSheet";
import { DayTypeToggle } from "../components/DayTypeToggle";

const DATE_FMT = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" });
const MODE_LABEL: Record<string, string> = { office: "Office", wfh: "WFH", off: "Off" };

export function Today() {
  const { plan, todayKey, regenerate, isEaten, toggleEaten, excludeMeal } = useApp();
  const [swap, setSwap] = useState<{ slot: string; id: string } | null>(null);
  if (!plan) return <p className="loading">Loading your week…</p>;

  const day = plan.days.find((d) => d.key === todayKey) ?? plan.days[0];
  const eaten = day.meals.filter((m) => isEaten(m.slot)).reduce((n, m) => n + m.protein, 0);

  return (
    <>
      <TopBar
        title={DATE_FMT.format(new Date())}
        subtitle={`${MODE_LABEL[day.dayType] ?? day.dayType} day`}
        action={<IconButton label="Regenerate week" onClick={regenerate}><IconRefresh /></IconButton>}
      />
      <div className="content">
        <DayTypeToggle dayKey={day.key} value={day.dayType} />
        <ProteinRing eaten={eaten} target={day.target} planned={day.total} />

        <ul className="meals">
          {day.meals.map((m) => (
            <MealCard
              key={m.id}
              meal={m}
              eaten={isEaten(m.slot)}
              onToggleEaten={() => toggleEaten(m.slot)}
              onSwap={m.slot !== "snack" ? () => setSwap({ slot: m.slot, id: m.id }) : undefined}
              onExclude={() => excludeMeal(m.id)}
            />
          ))}
        </ul>
      </div>

      {swap && <SwapSheet dayKey={todayKey} slot={swap.slot} currentId={swap.id} onClose={() => setSwap(null)} />}
    </>
  );
}
