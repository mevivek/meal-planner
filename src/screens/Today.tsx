import { useApp } from "../state/AppContext";
import { TopBar, IconButton } from "../components/TopBar";
import { IconRefresh } from "../components/icons";
import { MealCard } from "../components/MealCard";

const DATE_FMT = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "short", day: "numeric" });
const MODE_LABEL: Record<string, string> = { office: "Office", wfh: "WFH", off: "Off" };

export function Today() {
  const { plan, todayKey, regenerate } = useApp();
  if (!plan) return <p className="loading">Loading your week…</p>;

  const day = plan.days.find((d) => d.key === todayKey) ?? plan.days[0];
  const pct = day.target ? Math.min(100, Math.round((day.total / day.target) * 100)) : 0;

  return (
    <>
      <TopBar
        title={DATE_FMT.format(new Date())}
        subtitle={`${MODE_LABEL[day.dayType] ?? day.dayType} day`}
        action={<IconButton label="Regenerate week" onClick={regenerate}><IconRefresh /></IconButton>}
      />
      <div className="content">
        <div className="protein">
          <div className="protein-row">
            <span className="protein-now">{day.total}<span className="protein-unit">g</span></span>
            <span className="protein-target">of {day.target}g protein</span>
          </div>
          <div className="progress"><span style={{ width: `${pct}%` }} /></div>
        </div>

        <ul className="meals">
          {day.meals.map((m) => <MealCard key={m.id} meal={m} />)}
        </ul>
      </div>
    </>
  );
}
