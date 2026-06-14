import { useEffect, useState } from "react";

export const ROUTES = ["today", "week", "grocery", "more"] as const;
export type Route = (typeof ROUTES)[number];

function parse(): Route {
  const h = window.location.hash.replace(/^#\/?/, "");
  return (ROUTES as readonly string[]).includes(h) ? (h as Route) : "today";
}

/** Minimal hash router: each tab is a screen, the hardware/browser back button
 *  works, and deep links survive a refresh on GitHub Pages (no SPA 404). */
export function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(parse);

  useEffect(() => {
    const onHash = () => setRoute(parse());
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.replace("#/today");
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (r: Route) => {
    if (parse() !== r) window.location.hash = "#/" + r;
  };
  return [route, navigate];
}
