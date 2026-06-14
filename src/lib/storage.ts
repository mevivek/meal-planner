/* Centralised localStorage access. Keys are preserved from the legacy app so
   existing users keep their data across the migration; new keys are additive. */

export const KEYS = {
  prefs: "graze.prefs.v1",
  grocery: "graze.grocery.v2",
  brands: "graze.brands.v1",
  log: "graze.log.v1", // per-meal "eaten" state (new — drives the Today ring)
  theme: "graze.theme.v1", // light | dark | system (new)
} as const;

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — ignore */
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
