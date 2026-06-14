/* Links recipe ingredients to branded products (the brand picker).
   An ingredient "token" (e.g. "paneer") maps to the products that declare it,
   so a meal can offer a brand choice and the grocery line can show the badge. */

import { PRODUCTS } from "./products";

export interface BrandProduct {
  id: string;
  brand: string;
  ingredient?: string;
  serving: string;
  source: string;
  per: { protein: number };
}

const PRODS = PRODUCTS as unknown as BrandProduct[];

export const BRAND_INDEX: Record<string, BrandProduct[]> = {};
PRODS.forEach((p) => {
  if (!p.ingredient) return;
  (BRAND_INDEX[p.ingredient] ||= []).push(p);
});

/** Ingredient tokens that appear in a grocery-line name. */
export function tokensForItem(name: string): string[] {
  const n = name.toLowerCase();
  return Object.keys(BRAND_INDEX).filter((t) => n.includes(t));
}

/** Tokens in a meal that actually have a real (label-sourced) brand to pick. */
export function brandableTokens(meal: { items?: { n: string }[] }): string[] {
  const set = new Set<string>();
  (meal.items || []).forEach((it) =>
    tokensForItem(it.n).forEach((t) => {
      if (BRAND_INDEX[t].some((p) => p.source === "label")) set.add(t);
    }),
  );
  return [...set];
}

export function productById(id: string): BrandProduct | undefined {
  return PRODS.find((p) => p.id === id);
}

export const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());
