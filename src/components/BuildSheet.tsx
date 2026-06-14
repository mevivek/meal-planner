import { useEffect, useMemo, useState } from "react";
import { Engine } from "../lib/engine";
import { useApp } from "../state/AppContext";
import type { Prefs } from "../lib/types";

interface Option { name: string; p: number }
interface Column { key: string; label: string; options: Option[] }
const builder = Engine as unknown as { buildMatrix: (p: Prefs) => { formatHint: string; columns: Column[] } };

/** "Build a plate" — pick one option per row (filtered to the user's diet) and
 *  see the plated combo + approximate protein. */
export function BuildSheet({ onClose }: { onClose: () => void }) {
  const { prefs } = useApp();
  const conf = useMemo(() => builder.buildMatrix(prefs), [prefs]);
  const [chosen, setChosen] = useState<Record<string, Option>>({});

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const picked = conf.columns.map((c) => chosen[c.key]).filter(Boolean) as Option[];
  const total = picked.reduce((s, o) => s + (o.p || 0), 0);

  const pick = (key: string, o: Option) =>
    setChosen((prev) => {
      const next = { ...prev };
      if (next[key]?.name === o.name) delete next[key];
      else next[key] = o;
      return next;
    });

  return (
    <div className="sheet-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label="Build a plate">
        <div className="sheet-head">
          <b>Build a plate</b>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <p className="sheet-note">{conf.formatHint}</p>

        {conf.columns.map((col) => (
          <div key={col.key} className="build-row">
            <p className="field-label">{col.label}</p>
            <div className="chips chips--scroll-x">
              {col.options.map((o) => {
                const on = chosen[col.key]?.name === o.name;
                return (
                  <button key={o.name} type="button" className={"chip" + (on ? " chip--on" : "")} aria-pressed={on} onClick={() => pick(col.key, o)}>
                    {o.name}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div className="build-result">
          {picked.length ? (
            <>
              <strong>{picked.map((o) => o.name).join(" + ")}</strong>
              <span className="build-total">~{total}g protein</span>
            </>
          ) : (
            <span className="muted">Pick from each row to plate a meal.</span>
          )}
        </div>
      </div>
    </div>
  );
}
