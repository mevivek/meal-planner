import { useApp } from "../state/AppContext";

const MODES: { v: "office" | "wfh" | "off"; label: string }[] = [
  { v: "office", label: "Office" },
  { v: "wfh", label: "WFH" },
  { v: "off", label: "Off" },
];

/** Segmented Office/WFH/Off control — changes a day's type and re-plans it. */
export function DayTypeToggle({ dayKey, value }: { dayKey: string; value: string }) {
  const { setDayType } = useApp();
  return (
    <div className="segmented daytype" role="group" aria-label="Day type">
      {MODES.map(({ v, label }) => (
        <button key={v} type="button" className={"seg" + (value === v ? " seg--active" : "")} aria-pressed={value === v} onClick={() => setDayType(dayKey, v)}>
          {label}
        </button>
      ))}
    </div>
  );
}
