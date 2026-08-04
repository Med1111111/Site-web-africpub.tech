import { expect, test, type Page, type Response } from "@playwright/test";

import { CSP_DIRECTIVES } from "../../src/lib/security-headers";

/** Routes publiques couvertes par l'audit CSP. */
const ROUTES = ["/", "/services", "/portfolio", "/a-propos", "/contact", "/recherche", "/faq", "/auth"];

/** Directives dont l'absence rendrait la politique inopérante. */
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

type Violation = { directive: string; blockedURI: string };

/** Parse un en-tête CSP en dictionnaire directive -> sources. */
function parsePolicy(header: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const part of header.split(";")) {
    const [directive, ...sources] = part.trim().split(/\s+/);
    if (directive) out[directive] = sources;
  }
  return out;
}

/** Collecte les violations CSP déclenchées dans la page. */
async function collectViolations(page: Page): Promise<Violation[]> {
  const violations: Violation[] = [];
  await page.exposeFunction("__reportCspViolation", (v: Violation) => {
    violations.push(v);
  });
  await page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (event) => {
      (window as unknown as Record<string, (v: Violation) => void>)["__reportCspViolation"]?.({
        directive: event.effectiveDirective || event.violatedDirective,
        blockedURI: event.blockedURI,
      });
    });
  });
  return violations;
}

async function gotoRoute(page: Page, route: string): Promise<Response> {
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response, `aucune réponse pour ${route}`).not.toBeNull();
  return response!;
}

/**
 * Injecte un script dans le document servi par le serveur, en conservant ses
 * en-têtes (donc la CSP). Nécessaire car `page.evaluate` passe par le protocole
 * de débogage, qui contourne les restrictions CSP sur `eval`.
 */
async function injectIntoDocument(page: Page, route: string, snippet: string): Promise<void> {
  const pathname = new URL(route, "http://127.0.0.1").pathname;
  await page.route(
    (url) => url.pathname === pathname,

    async (routeHandler) => {
      const fetched = await routeHandler.fetch();
      const body = await fetched.text();
      await routeHandler.fulfill({
        response: fetched,
        body: body.replace("</head>", `<script>${snippet}</script></head>`),
      });
    },
  );
}


test.describe("CSP — en-têtes envoyés par le serveur", () => {
  for (const route of ROUTES) {
    test(`${route} renvoie une CSP appliquée (non report-only)`, async ({ page }) => {
      const response = await gotoRoute(page, route);
      const headers = response.headers();

      const policy = headers["content-security-policy"];
      expect(policy, `content-security-policy absent sur ${route}`).toBeTruthy();
      expect(
        headers["content-security-policy-report-only"],
        "la politique ne doit pas être seulement en report-only en production",
      ).toBeUndefined();

      const parsed = parsePolicy(policy);
      for (const directive of REQUIRED_DIRECTIVES) {
        expect(parsed, `${directive} manquante sur ${route}`).toHaveProperty(directive);
      }

      // La politique servie doit rester alignée sur la source de vérité du code.
      for (const [directive, sources] of Object.entries(CSP_DIRECTIVES)) {
        expect(parsed[directive] ?? [], `${directive} divergente sur ${route}`).toEqual(sources);
      }

      expect(parsed["script-src"]).not.toContain("'unsafe-eval'");
      expect(parsed["object-src"]).toEqual(["'none'"]);
      expect(parsed["base-uri"]).toEqual(["'self'"]);
      expect(parsed["form-action"]).toEqual(["'self'"]);
      expect(parsed["frame-ancestors"]).not.toContain("*");
      expect(parsed["default-src"]).toEqual(["'self'"]);

      // En-têtes de durcissement complémentaires.
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["referrer-policy"]).toMatch(/strict-origin|no-referrer/);
      expect(headers["strict-transport-security"]).toMatch(/max-age=\d{7,}/);
      expect(headers["x-powered-by"]).toBeUndefined();
    });
  }
});

test.describe("CSP — blocages effectifs dans le navigateur", () => {
  for (const route of ROUTES) {
    test(`${route} bloque eval() et new Function()`, async ({ page }) => {
      await injectIntoDocument(
        page,
        route,
        `window.__cspProbe = {};
         try { (0, eval)("1 + 1"); window.__cspProbe.eval = "executed"; }
         catch (error) { window.__cspProbe.eval = error.name; }
         try { new Function("return 1 + 1")(); window.__cspProbe.fn = "executed"; }
         catch (error) { window.__cspProbe.fn = error.name; }`,
      );
      await gotoRoute(page, route);

      const result = await page.evaluate(
        () => (window as unknown as Record<string, { eval: string; fn: string }>)["__cspProbe"],
      );

      expect(result?.eval, `eval() n'a pas été bloqué sur ${route}`).toBe("EvalError");
      expect(result?.fn, `new Function() n'a pas été bloqué sur ${route}`).toBe("EvalError");
    });



    test(`${route} bloque un script externe non autorisé`, async ({ page }) => {
      const violations = await collectViolations(page);
      await gotoRoute(page, route);

      const executed = await page.evaluate(async () => {
        (window as unknown as Record<string, unknown>)["__evilRan"] = false;
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = "https://evil.example.com/payload.js";
          script.onerror = () => resolve();
          script.onload = () => resolve();
          document.head.appendChild(script);
          setTimeout(resolve, 2000);
        });
        return (window as unknown as Record<string, unknown>)["__evilRan"] === true;
      });

      expect(executed, `un script d'origine non autorisée s'est exécuté sur ${route}`).toBe(false);
      expect(
        violations.some((v) => v.directive.startsWith("script-src")),
        `aucune violation script-src enregistrée sur ${route}`,
      ).toBe(true);
    });

    test(`${route} interdit les plugins et les iframes non autorisées`, async ({ page }) => {
      const violations = await collectViolations(page);
      await gotoRoute(page, route);

      await page.evaluate(async () => {
        const object = document.createElement("object");
        object.data = "https://evil.example.com/plugin.swf";
        document.body.appendChild(object);

        const frame = document.createElement("iframe");
        frame.src = "https://evil.example.com/frame.html";
        document.body.appendChild(frame);

        await new Promise((resolve) => setTimeout(resolve, 1000));
      });

      expect(
        violations.some((v) => v.directive.startsWith("object-src") || v.directive.startsWith("frame-src")),
        `object-src / frame-src ne bloquent rien sur ${route}`,
      ).toBe(true);
    });
  }
});

test.describe("CSP — le site reste fonctionnel", () => {
  for (const route of ROUTES) {
    test(`${route} ne déclenche aucune violation CSP de son propre fait`, async ({ page }) => {
      const violations = await collectViolations(page);
      const consoleErrors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });

      await gotoRoute(page, route);
      await page.waitForLoadState("load");
      await page.waitForTimeout(1500);

      expect(
        violations,
        `violations CSP provoquées par le site sur ${route} : ${JSON.stringify(violations)}`,
      ).toEqual([]);
      expect(
        consoleErrors.filter((text) => /Content Security Policy|Refused to/i.test(text)),
        `erreurs console liées à la CSP sur ${route}`,
      ).toEqual([]);

      // L'hydratation doit avoir eu lieu : la navigation client fonctionne.
      await expect(page.locator("body")).toBeVisible();
    });
  }
});

test.describe("CSP — exceptions connues (garde-fou de régression)", () => {
  test("script-src autorise encore 'unsafe-inline' (hydratation React SSR)", async ({ page }) => {
    const response = await gotoRoute(page, "/");
    const parsed = parsePolicy(response.headers()["content-security-policy"]);

    // Exception assumée aujourd'hui : les scripts inline générés par le SSR React
    // n'ont pas de nonce. Ce test échouera dès qu'un durcissement (nonces) sera
    // introduit — il faudra alors basculer l'assertion sur un blocage réel.
    expect(parsed["script-src"]).toContain("'unsafe-inline'");

    const inlineRan = await page.evaluate(async () => {
      const script = document.createElement("script");
      script.textContent = "window.__inlineRan = true";
      document.head.appendChild(script);
      await new Promise((resolve) => setTimeout(resolve, 200));
      return (window as unknown as Record<string, unknown>)["__inlineRan"] === true;
    });
    expect(inlineRan).toBe(true);
  });
});
