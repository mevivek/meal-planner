import { useMemo, useState } from "react";
import { Engine } from "../lib/engine";
import { useApp } from "../state/AppContext";
import { KEYS, load, save } from "../lib/storage";
import { TopBar } from "../components/TopBar";
import type { Plan } from "../lib/types";

const grocer = Engine as unknown as { buildGrocery: (plan: Plan) => { group: string; items: string[] }[] };

export function Grocery() {
  const { plan } = useApp();
  const groups = useMemo(() => (plan ? grocer.buildGrocery(plan) : []), [plan]);
  const [checks, setChecks] = useState<Record<string, boolean>>(() => load(KEYS.grocery, {}));
  if (!plan) return <p className="loading">Loading your week…</p>;

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const done = groups.reduce((n, g) => n + g.items.filter((i) => checks[i]).length, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const toggle = (item: string) =>
    setChecks((prev) => {
      const next = { ...prev, [item]: !prev[item] };
      save(KEYS.grocery, next);
      return next;
    });
  const reset = () => {
    setChecks({});
    save(KEYS.grocery, {});
  };

  return (
    <>
      <TopBar
        title="Grocery"
        subtitle={`${done} / ${total} checked`}
        action={<button type="button" className="text-btn" onClick={reset}>Reset</button>}
      />
      <div className="content">
        <div className="progress"><span style={{ width: `${pct}%` }} /></div>

        {groups.map((g) => (
          <section key={g.group} className="g-group">
            <h2 className="g-head">{g.group}</h2>
            <ul>
              {g.items.map((item) => (
                <li key={item}>
                  <button type="button" className={"g-item" + (checks[item] ? " is-checked" : "")} onClick={() => toggle(item)}>
                    <span className="g-check" aria-hidden="true">{checks[item] ? "✓" : ""}</span>
                    <span className="g-text">{item}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {total > 0 && done === total && <p className="g-done">All set — happy cooking 🎉</p>}
      </div>
    </>
  );
}
