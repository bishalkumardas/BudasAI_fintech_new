// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      {
        name: "budasai-clean-urls",
        configureServer(server) {
          server.middlewares.use((req, _res, next) => {
            if (req.url && req.url.startsWith("/budasai/")) {
              const [path, query = ""] = req.url.split("?");
              // Strip trailing slash so "/budasai/research/" works too
              const clean = path.replace(/\/$/, "");
              // If no file extension, try serving folder's index.html
              if (!/\.[a-zA-Z0-9]+$/.test(clean)) {
                req.url = clean + "/index.html" + (query ? "?" + query : "");
              }
            }
            next();
          });
        },
      },
    ],
  },
});
