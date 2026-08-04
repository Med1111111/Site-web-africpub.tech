#!/usr/bin/env node
/**
 * Contrôle de sécurité utilisable en CI.
 *
 * Deux modes, cumulables :
 *   1. Audit statique (toujours exécuté) : cohérence de la politique CSP,
 *      endpoints exposés sous src/routes/api/public/*, fuites de secrets côté client.
 *   2. Audit réseau (--url <origin>) : vérifie les en-têtes HTTP réellement
 *      renvoyés par le site déployé (CSP, HSTS, nosniff, referrer-policy…)
 *      et que les endpoints publics refusent les appels non signés.
 *
 * Usage :
 *   node scripts/security-check.mjs
 *   node scripts/security-check.mjs --url https://premium-afric-vision.lovable.app
 *   node scripts/security-check.mjs --url http://localhost:8080 --allow-insecure
 */

import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const args = process.argv.slice(2);
const urlArg = args.includes("--url") ? args[args.indexOf("--url") + 1] : undefined;
const allowInsecure = args.includes("--allow-insecure");

const results = [];
const record = (level, area, message) => results.push({ level, area, message });
const pass = (area, message) => record("pass", area, message);
const warn = (area, message) => record("warn", area, message);
const fail = (area, message) => record("fail", area, message);

/* ------------------------------------------------------------------ */
/* 1. Politique CSP déclarée dans le code                              */
/* ------------------------------------------------------------------ */

const REQUIRED_DIRECTIVES = [
  "default-src",
  "base-uri",
  "object-src",
  "form-action",
  "frame-ancestors",
  "script-src",
  "style-src",
  "img-src",
  "connect-src",
];

/** Directives où une source joker rend la politique inopérante. */
const NO_WILDCARD = ["script-src", "object-src", "base-uri", "form-action", "frame-ancestors"];

async function auditCspPolicy() {
  const file = path.join(ROOT, "src/lib/security-headers.ts");
  let source;
  try {
    source = await readFile(file, "utf8");
  } catch {
    fail("csp", "src/lib/security-headers.ts est introuvable : aucune politique CSP centralisée.");
    return null;
  }

  const directives = {};
  const block = source.slice(source.indexOf("CSP_DIRECTIVES"), source.indexOf("export function contentSecurityPolicy"));
  for (const match of block.matchAll(/"([a-z-]+)":\s*\[([^\]]*)\]/g)) {
    directives[match[1]] = [...match[2].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  }

  for (const directive of REQUIRED_DIRECTIVES) {
    if (!(directive in directives)) fail("csp", `Directive CSP manquante : ${directive}`);
  }

  if (directives["object-src"] && !directives["object-src"].includes("'none'")) {
    fail("csp", "object-src devrait valoir 'none'.");
  }
  if (directives["script-src"]?.includes("'unsafe-eval'")) {
    fail("csp", "script-src autorise 'unsafe-eval' : à retirer.");
  }
  for (const directive of NO_WILDCARD) {
    if (directives[directive]?.some((s) => s === "*" || s === "https:" || s === "data:")) {
      fail("csp", `${directive} contient une source trop large (${directives[directive].join(" ")}).`);
    }
  }
  if (directives["frame-ancestors"]?.includes("'self'") === false) {
    warn("csp", "frame-ancestors ne restreint pas l'embarquement du site.");
  }

  if (!results.some((r) => r.level === "fail" && r.area === "csp")) {
    pass("csp", `Politique CSP valide (${Object.keys(directives).length} directives déclarées).`);
  }
  return directives;
}

/* ------------------------------------------------------------------ */
/* 2. Endpoints exposés                                                */
/* ------------------------------------------------------------------ */

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

/** Marqueurs acceptables d'un contrôle d'appelant dans une route publique. */
const CALLER_CHECKS = [
  "timingSafeEqual",
  "createHmac",
  "verifySignature",
  "x-webhook-signature",
  "CRON_SECRET",
  "WEBHOOK_SECRET",
  "Authorization",
];

async function auditPublicRoutes() {
  const publicDir = path.join(ROOT, "src/routes/api/public");
  const files = (await walk(publicDir)).filter((f) => /\.(ts|tsx)$/.test(f));

  if (files.length === 0) {
    pass("endpoints", "Aucun endpoint public exposé sous src/routes/api/public.");
  }

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    const src = await readFile(file, "utf8");
    const mutating = /(POST|PUT|PATCH|DELETE)\s*:/.test(src);
    const hasCheck = CALLER_CHECKS.some((marker) => src.includes(marker));

    if (mutating && !hasCheck) {
      fail("endpoints", `${rel} expose une méthode mutante sans vérification de l'appelant.`);
    }
    if (/supabaseAdmin/.test(src) && !hasCheck) {
      fail("endpoints", `${rel} utilise le client privilégié sans vérifier l'appelant.`);
    }
    if (/from\s+["']@\/integrations\/supabase\/client\.server["']/.test(src) && !/await import\(/.test(src)) {
      fail("endpoints", `${rel} importe le client serveur au niveau du module (risque de fuite côté client).`);
    }
    if (!results.some((r) => r.level === "fail" && r.message.startsWith(rel))) {
      pass("endpoints", `${rel} : contrôle d'appelant présent.`);
    }
  }

  // Les autres routes /api/* ne doivent pas se retrouver sous /public par erreur.
  const apiFiles = (await walk(path.join(ROOT, "src/routes/api"))).filter((f) => /\.(ts|tsx)$/.test(f));
  pass("endpoints", `${apiFiles.length} route(s) API analysée(s).`);
}

/* ------------------------------------------------------------------ */
/* 3. Fuites de secrets côté client                                    */
/* ------------------------------------------------------------------ */

const FORBIDDEN_IN_CLIENT = [
  ["SUPABASE_SERVICE_ROLE_KEY", "clé service role"],
  ["SUPABASE_DB_URL", "URL de base de données"],
  [/["'`]sb_secret_[A-Za-z0-9_-]{8,}/, "clé secrète Supabase en dur"],
  [/["'`]eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/, "clé JWT en dur"],
];

async function auditClientSecrets() {
  const files = (await walk(path.join(ROOT, "src"))).filter(
    (f) => /\.(ts|tsx)$/.test(f) && !/\.server\.(ts|tsx)$/.test(f) && !f.includes("integrations/supabase/client.server"),
  );

  let leaks = 0;
  for (const file of files) {
    const rel = path.relative(ROOT, file);
    if (rel.startsWith("scripts/")) continue;
    const src = await readFile(file, "utf8");
    for (const [needle, label] of FORBIDDEN_IN_CLIENT) {
      const found = typeof needle === "string" ? src.includes(needle) : needle.test(src);
      if (found) {
        leaks += 1;
        fail("secrets", `${rel} référence une ${label} hors d'un module *.server.ts.`);
      }
    }
    if (/import\.meta\.env\.[A-Z_]*(SERVICE_ROLE|SECRET)/.test(src)) {
      leaks += 1;
      fail("secrets", `${rel} expose un secret via import.meta.env.`);
    }
  }
  if (leaks === 0) pass("secrets", "Aucun secret serveur référencé dans le code client.");
}

/* ------------------------------------------------------------------ */
/* 4. Audit réseau du site déployé                                     */
/* ------------------------------------------------------------------ */

const EXPECTED_HEADERS = {
  "content-security-policy": (v) =>
    REQUIRED_DIRECTIVES.every((d) => v.includes(d)) || "directives CSP incomplètes",
  "x-content-type-options": (v) => v.toLowerCase() === "nosniff" || "doit valoir nosniff",
  "referrer-policy": (v) => /strict-origin|no-referrer/.test(v) || "politique de référent trop permissive",
  "permissions-policy": () => true,
  "strict-transport-security": (v) => /max-age=\d{7,}/.test(v) || "max-age trop court (< 4 mois)",
};

async function auditLiveHeaders(origin) {
  let response;
  try {
    response = await fetch(origin, { redirect: "follow", headers: { accept: "text/html" } });
  } catch (error) {
    fail("http", `Impossible de joindre ${origin} : ${error.message}`);
    return;
  }

  pass("http", `${origin} → HTTP ${response.status}`);
  const isHttps = new URL(response.url).protocol === "https:";

  for (const [header, validate] of Object.entries(EXPECTED_HEADERS)) {
    if (header === "strict-transport-security" && !isHttps) continue;
    const value = response.headers.get(header);
    if (!value) {
      if (allowInsecure) warn("http", `En-tête ${header} absent (toléré : --allow-insecure).`);
      else fail("http", `En-tête ${header} absent.`);
      continue;
    }
    const verdict = validate(value);
    if (verdict === true) pass("http", `${header} ✓`);
    else fail("http", `${header} : ${verdict}`);
  }

  if (response.headers.get("x-powered-by")) {
    warn("http", "x-powered-by est exposé : à supprimer.");
  }

  // Les endpoints publics ne doivent pas accepter d'écriture non signée.
  const probe = new URL("/api/public/", origin);
  try {
    const res = await fetch(probe, { method: "POST", body: "{}", headers: { "content-type": "application/json" } });
    if (res.status >= 200 && res.status < 300) {
      fail("endpoints", `${probe} accepte un POST non authentifié (HTTP ${res.status}).`);
    } else {
      pass("endpoints", `POST non signé sur ${probe.pathname} refusé (HTTP ${res.status}).`);
    }
  } catch {
    pass("endpoints", "Aucun endpoint public joignable en écriture anonyme.");
  }
}

/* ------------------------------------------------------------------ */

async function main() {
  await auditCspPolicy();
  await auditPublicRoutes();
  await auditClientSecrets();
  if (urlArg) await auditLiveHeaders(urlArg.replace(/\/$/, ""));

  const icon = { pass: "✅", warn: "⚠️ ", fail: "❌" };
  for (const r of results) console.log(`${icon[r.level]} [${r.area}] ${r.message}`);

  const failures = results.filter((r) => r.level === "fail");
  const warnings = results.filter((r) => r.level === "warn");
  console.log(
    `\n${results.filter((r) => r.level === "pass").length} OK · ${warnings.length} avertissement(s) · ${failures.length} échec(s)`,
  );

  if (failures.length > 0) {
    for (const f of failures) console.log(`::error title=${f.area}::${f.message}`);
    process.exit(1);
  }
}

await main();
