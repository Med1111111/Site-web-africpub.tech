// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { imagetools } from "vite-imagetools";
import { VitePWA } from "vite-plugin-pwa";

const YEAR = 60 * 60 * 24 * 365;
const MONTH = 60 * 60 * 24 * 30;

// Visuels critiques hébergés sur le CDN (pointeurs .asset.json) : pré-cachés pour l'offline.
const HERO_ASSETS: string[] = [
  "/__l5e/assets-v1/1d42f71a-4db9-4c99-a505-9559f3adc35f/stand-cutout.png",
  "/__l5e/assets-v1/e7e509ce-512d-4ea7-879b-8a6e9f445341/enseigne-3d.png",
];


export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      imagetools(),
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null,
        filename: "sw.js",
        outDir: "dist/client",
        devOptions: { enabled: false },
        manifest: false,
        includeAssets: ["favicon.png", "manifest.webmanifest"],
        workbox: {
          globDirectory: "dist/client",
          // Pré-cache : app shell + visuels critiques du hero
          globPatterns: ["**/*.{js,css,html,webmanifest}"],
          additionalManifestEntries: HERO_ASSETS.map((url) => ({ url, revision: null })),
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,

          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/~oauth/, /^\/api\//, /^\/_serverFn\//],
          runtimeCaching: [
            {
              // Navigations HTML : toujours le réseau d'abord, repli cache hors-ligne
              urlPattern: ({ request }: { request: Request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "html-navigations",
                networkTimeoutSeconds: 3,
                expiration: { maxEntries: 30, maxAgeSeconds: MONTH },
              },
            },
            {
              // Vignettes portfolio et visuels AVIF/WebP générés par imagetools
              urlPattern: ({ request, url }: { request: Request; url: URL }) =>
                request.destination === "image" &&
                url.origin === self.location.origin &&
                /\.(avif|webp)$/i.test(url.pathname),
              handler: "CacheFirst",
              options: {
                cacheName: "images-modern",
                expiration: { maxEntries: 80, maxAgeSeconds: MONTH * 6, purgeOnQuotaError: true },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Repli JPEG/PNG/SVG (navigateurs sans AVIF/WebP)
              urlPattern: ({ request, url }: { request: Request; url: URL }) =>
                request.destination === "image" && url.origin === self.location.origin,
              handler: "StaleWhileRevalidate",
              options: {
                cacheName: "images-legacy",
                expiration: { maxEntries: 60, maxAgeSeconds: MONTH, purgeOnQuotaError: true },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
            {
              // Assets hashés (JS/CSS/polices) : immuables
              urlPattern: ({ request, url }: { request: Request; url: URL }) =>
                url.origin === self.location.origin &&
                (request.destination === "script" ||
                  request.destination === "style" ||
                  request.destination === "font"),
              handler: "CacheFirst",
              options: {
                cacheName: "static-assets",
                expiration: { maxEntries: 120, maxAgeSeconds: YEAR },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
  },
});
