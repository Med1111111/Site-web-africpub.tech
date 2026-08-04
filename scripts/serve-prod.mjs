#!/usr/bin/env node
/**
 * Sert le build de production localement (runtime Cloudflare/workerd via wrangler),
 * afin que les tests E2E observent les VRAIS en-têtes de sécurité posés par
 * `src/server.ts` — en développement la CSP est en mode report-only et ne bloque rien.
 *
 * Usage : node scripts/serve-prod.mjs [--port 4173]
 */

import { spawn } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");

const args = process.argv.slice(2);
const port = args.includes("--port") ? args[args.indexOf("--port") + 1] : (process.env.E2E_PORT ?? "4173");

if (!existsSync(path.join(DIST, "server", "index.mjs"))) {
  console.error("Build introuvable : lancez `bun run build` avant de servir la production.");
  process.exit(1);
}

// wrangler lit ses variables dans .dev.vars (et non .env) au niveau de son cwd.
const envFile = path.join(ROOT, ".env");
if (existsSync(envFile)) copyFileSync(envFile, path.join(DIST, ".dev.vars"));

const child = spawn(
  "npx",
  ["--yes", "wrangler@latest", "dev", "--local", "--port", String(port), "--ip", "127.0.0.1"],
  { cwd: DIST, stdio: "inherit", env: process.env },
);

const stop = () => child.kill("SIGTERM");
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
child.on("exit", (code) => process.exit(code ?? 0));
