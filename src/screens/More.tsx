import { useApp } from "../state/AppContext";
import { TopBar } from "../components/TopBar";
import { IconSun, IconMoon, IconMonitor } from "../components/icons";
import type { Theme } from "../lib/useTheme";

const THEMES: { v: Theme; label: string; Icon: typeof IconSun }[] = [
  { v: "light", label: "Light", Icon: IconSun },
  { v: "dark", label: "Dark", Icon: IconMoon },
  { v: "system", label: "System", Icon: IconMonitor },
];

const GOAL_LABEL: Record<string, string> = { cut: "Lean / cut", maintain: "Maintain", bulk: "Build / bulk" };

export function More() {
  const { theme, setTheme, regenerate, resetAll, prefs, plan } = useApp();

  const summary = [
    prefs.diet?.base === "vegan" ? "Vegan" : "Vegetarian",
    GOAL_LABEL[prefs.goals?.goal ?? "maintain"],
    plan ? `~${plan.target}g protein/day` : "",
  ].filter(Boolean).join(" · ");

  return (
    <>
      <TopBar title="More" />
      <div className="content">
        <section className="panel">
          <h2 className="panel-title">Appearance</h2>
          <div className="segmented" role="group" aria-label="Theme">
            {THEMES.map(({ v, label, Icon }) => (
              <button key={v} type="button" className={"seg" + (theme === v ? " seg--active" : "")} aria-pressed={theme === v} onClick={() => setTheme(v)}>
                <Icon width={16} height={16} />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Your plan</h2>
          <p className="muted">{summary}</p>
          <div className="panel-actions">
            <button type="button" className="btn" onClick={regenerate}>Regenerate week</button>
            <button
              type="button"
              className="btn btn--danger"
              onClick={() => {
                if (confirm("Start over? This clears your preferences and grocery list on this device.")) resetAll();
              }}
            >
              Start over
            </button>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">About</h2>
          <p className="muted">
            A personalised vegetarian meal-planner. Everything runs on your device — nothing leaves it. Protein figures
            are approximate; adjust portions to appetite.
          </p>
        </section>
      </div>
    </>
  );
}
