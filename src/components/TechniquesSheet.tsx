import { TIPS } from "../lib/data";
import { Sheet } from "./Sheet";

const TIP_LIST = TIPS as unknown as { icon: string; title: string; steps: string[] }[];

/** Quick cooking techniques. */
export function TechniquesSheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="Quick techniques" onClose={onClose}>
      {TIP_LIST.map((t) => (
        <div key={t.title} className="tip">
          <h3><span aria-hidden="true">{t.icon}</span>{t.title}</h3>
          <ol>{t.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </div>
      ))}
    </Sheet>
  );
}
