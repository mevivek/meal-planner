import { useEffect, useState } from "react";
import { KEYS, load, save } from "./storage";

export type Theme = "light" | "dark" | "system";

const DARK_THEME_COLOR = "#131312";
const LIGHT_THEME_COLOR = "#1f7a52";

/** Light / dark / system, persisted. Sets `data-theme` on <html> (absent =
 *  follow the OS) and keeps the browser theme-color meta in sync. */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => load<Theme>(KEYS.theme, "system"));

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    save(KEYS.theme, theme);

    const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? DARK_THEME_COLOR : LIGHT_THEME_COLOR);
  }, [theme]);

  return { theme, setTheme };
}
