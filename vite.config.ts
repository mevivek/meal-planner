import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served from the /meal-planner/ subpath on GitHub Pages.
export default defineConfig({
  base: "/meal-planner/",
  plugins: [react()],
  build: { outDir: "dist", sourcemap: true },
});
