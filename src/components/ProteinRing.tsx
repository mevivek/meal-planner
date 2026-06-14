const R = 52;
const C = 2 * Math.PI * R;

/** Circular protein gauge: eaten / target, with the day's planned total as caption. */
export function ProteinRing({ eaten, target, planned }: { eaten: number; target: number; planned: number }) {
  const pct = target ? Math.min(1, eaten / target) : 0;

  return (
    <div className="ring-wrap">
      <div className="ring">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle className="ring-track" cx="60" cy="60" r={R} />
          <circle
            className="ring-fill"
            cx="60" cy="60" r={R}
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct)}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="ring-center">
          <span className="ring-now">{eaten}<span className="ring-unit">g</span></span>
          <span className="ring-sub">of {target}g</span>
        </div>
      </div>
      <p className="ring-caption">
        {eaten >= target && target > 0 ? "Protein goal hit 🎉" : "eaten today"} · {planned}g planned
      </p>
    </div>
  );
}
