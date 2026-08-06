#!/usr/bin/env node
/**
 * Sert le build de production localement avec le vrai serveur Node (celui utilisé
 * en prod sur le VPS — preset Nitro `node-server`), afin que les tests E2E observent
 * les VRAIS en-têtes de sécurité posés par `src/server.ts` : en développement la CSP
 * est en mode report-only et ne bloque rien.
 *
 * Usage : node scripts/serve-prod.mjs [--port 4173]
 */

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SERVER_ENTRY = path.join(ROOT, ".output", "server", "index.mjs");

const args = process.argv.slice(2);
const port = args.includes("--port")
  ? args[args.indexOf("--port") + 1]
  : (process.env.E2E_PORT ?? "4173");

if (!existsSync(SERVER_ENTRY)) {
  console.error("Build introuvable : lancez `bun run build` avant de servir la production.");
  process.exit(1);
}

const nodeArgs = [SERVER_ENTRY];
const envFile = path.join(
  ROOT,
  existsSync(path.join(ROOT, ".env.production")) ? ".env.production" : ".env",
);
if (existsSync(envFile)) nodeArgs.unshift(`--env-file=${envFile}`);

const child = spawn("node", nodeArgs, {
  cwd: ROOT,
  stdio: "inherit",
  env: { ...process.env, PORT: String(port), HOST: "127.0.0.1" },
});

const stop = () => child.kill("SIGTERM");
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
child.on("exit", (code) => process.exit(code ?? 0));
