import type { Route } from "../lib/useHashRoute";
import { IconToday, IconWeek, IconGrocery, IconMore } from "./icons";

const TABS: { route: Route; label: string; Icon: typeof IconToday }[] = [
  { route: "today", label: "Today", Icon: IconToday },
  { route: "week", label: "Week", Icon: IconWeek },
  { route: "grocery", label: "Grocery", Icon: IconGrocery },
  { route: "more", label: "More", Icon: IconMore },
];

export function TabBar({ route, onNavigate }: { route: Route; onNavigate: (r: Route) => void }) {
  return (
    <nav className="tabbar" aria-label="Sections">
      {TABS.map(({ route: r, label, Icon }) => {
        const active = r === route;
        return (
          <button
            key={r}
            type="button"
            className={"tab" + (active ? " tab--active" : "")}
            aria-current={active ? "page" : undefined}
            onClick={() => onNavigate(r)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
