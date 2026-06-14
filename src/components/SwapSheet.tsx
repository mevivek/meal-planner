import { useEffect } from "react";
import { useApp } from "../state/AppContext";

const SLOT_NAME: Record<string, string> = { dinner: "early dinner", lunch: "lunch", breakfast: "breakfast", snack: "booster" };

/** Bottom sheet of diet-valid alternates for one day's slot. Picking one sets a
 *  manual override and the week re-plans around it. */
export function SwapSheet({ dayKey, slot, currentId, onClose }: { dayKey: string; slot: string; currentId: string; onClose: () => void }) {
  const { alternatesFor, setOverride } = useApp();
  const alts = alternatesFor(dayKey, slot, currentId);
  const name = SLOT_NAME[slot] ?? slot;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="sheet-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`Swap ${name}`}>
        <div className="sheet-head">
          <b>Swap {name}</b>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        {alts.length === 0 ? (
          <p className="muted">No alternates fit this day. Try relaxing cooking effort or the day type.</p>
        ) : (
          <ul className="sheet-list">
            {alts.map((a) => (
              <li key={a.id}>
                <button type="button" className="sheet-item" onClick={() => { setOverride(dayKey, slot, a.id); onClose(); }}>
                  <span className="meal-icon" aria-hidden="true">{a.icon}</span>
                  <span className="si-body">
                    <span className="si-name">{a.name}</span>
                    <span className="si-meta">{a.protein}g · {a.prep} min · {a.cuisine}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
