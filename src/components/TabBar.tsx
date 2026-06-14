import type { Route } from "../lib/useHashRoute";
import { IconToday, IconWeek, IconGrocery, IconMore } from "./icons";

type TabDef = { route: Route; label: string; Icon: typeof IconToday };
const LEFT: TabDef[] = [
  { route: "today", label: "Today", Icon: IconToday },
  { route: "week", label: "Week", Icon: IconWeek },
];
const RIGHT: TabDef[] = [
  { route: "grocery", label: "Grocery", Icon: IconGrocery },
  { route: "more", label: "More", Icon: IconMore },
];

export function TabBar({ route, onNavigate, onBuild }: { route: Route; onNavigate: (r: Route) => void; onBuild: () => void }) {
  const tab = ({ route: r, label, Icon }: TabDef) => {
    const active = r === route;
    return (
      <button key={r} type="button" className={"tab" + (active ? " tab--active" : "")} aria-current={active ? "page" : undefined} onClick={() => onNavigate(r)}>
        <Icon />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <nav className="tabbar" aria-label="Sections">
      {LEFT.map(tab)}
      <button type="button" className="tab tab--build" aria-label="Build a plate" onClick={onBuild}>
        <span className="build-fab" aria-hidden="true">+</span>
        <span>Build</span>
      </button>
      {RIGHT.map(tab)}
    </nav>
  );
}
