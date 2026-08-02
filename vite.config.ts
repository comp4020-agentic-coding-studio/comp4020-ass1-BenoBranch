import { readdirSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "vite";

// Every .html file in the repo is a page and a build entry, so a multi-page
// hand-written site needs no build config: add pages, link them, ship.
// (Vite's default would build only the root index.html and silently drop the
// rest from dist/ — fine locally, 404s deployed.)
const SKIP = new Set(["node_modules", "dist", "spec", "scripts", "reflections"]);

function htmlEntries(dir = "."): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith(".") || SKIP.has(entry.name)) return [];
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlEntries(path);
    return entry.name.endsWith(".html") ? [path] : [];
  });
}

// `base: "./"` makes built asset URLs relative, so the site works under any
// GitHub Pages path (username.github.io/your-repo/) without further config.
export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      input: htmlEntries(),
    },
  },
  // maplibre-gl ships its own worker as a separate file; Vite's dep
  // optimizer tries to pre-bundle it as a regular module and can't find it
  // afterwards, logging a spurious "file does not exist" warning on every
  // dev-server start. Doesn't affect the production build, only dev noise.
  optimizeDeps: {
    exclude: ["maplibre-gl"],
  },
});
