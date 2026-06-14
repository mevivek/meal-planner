import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Served from the /meal-planner/ subpath on GitHub Pages.
export default defineConfig({
  base: "/meal-planner/",
  plugins: [
    react(),
    // Offline-first: Workbox precaches the built shell + bundled data so the app
    // (recipes, ingredients, product nutrition) works with no network after first load.
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["icons/icon.svg"],
      manifest: {
        name: "Meal planner",
        short_name: "Meals",
        description: "A personalised vegetarian meal-planner PWA.",
        start_url: ".",
        scope: ".",
        display: "standalone",
        orientation: "portrait",
        background_color: "#f7f7f5",
        theme_color: "#1f7a52",
        icons: [{ src: "icons/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,webmanifest}"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: { outDir: "dist", sourcemap: true },
});
