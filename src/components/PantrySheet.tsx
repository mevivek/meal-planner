import { useMemo, useState } from "react";
import { PRODUCTS, PRODUCT_CATS } from "../lib/products";
import { Sheet } from "./Sheet";

interface Product {
  id: string; brand: string; name: string; category: string; serving: string; source: string;
  per: { kcal: number; protein: number; carbs?: number; fat?: number; fiber?: number };
}
const CATS = PRODUCT_CATS as string[];
const PRODS = PRODUCTS as unknown as Product[];

/** Branded product-nutrition browser (per-serving macros), searchable. */
export function PantrySheet({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();
  const list = useMemo(
    () => PRODS.filter((p) => !ql || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(ql)),
    [ql],
  );

  const macro = (label: string, v: number | undefined, unit = "g") =>
    v == null ? null : <span className="pm"><b>{v}{unit}</b>{label}</span>;

  return (
    <Sheet title="Product nutrition" onClose={onClose}>
      <input className="search" type="search" placeholder="Search products or brands…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
      {list.length === 0 && <p className="muted" style={{ marginTop: 14 }}>No products match — try another term.</p>}
      {CATS.map((cat) => {
        const items = list.filter((p) => p.category === cat).sort((a, b) => (a.source === b.source ? 0 : a.source === "label" ? -1 : 1));
        if (!items.length) return null;
        return (
          <div key={cat}>
            <h3 className="pantry-cat">{cat}</h3>
            {items.map((p) => (
              <div key={p.id} className="product">
                <div className="product-top">
                  <div>
                    <div className="p-name">{p.name}</div>
                    <div className="p-brand">{p.brand}{p.source === "generic" ? " · typical" : ""} · {p.serving}</div>
                  </div>
                  <div className="p-kcal">{p.per.kcal}<span>kcal</span></div>
                </div>
                <div className="p-macros">
                  {macro("protein", p.per.protein)}
                  {macro("carbs", p.per.carbs)}
                  {macro("fat", p.per.fat)}
                  {macro("fibre", p.per.fiber)}
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </Sheet>
  );
}
