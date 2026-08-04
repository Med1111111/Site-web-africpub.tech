/**
 * En-têtes de sécurité HTTP appliqués aux réponses HTML (documents SSR).
 *
 * La politique est volontairement stricte sur les sources exécutables, tout en
 * restant compatible avec :
 *  - l'hydratation React 19 (scripts/styles inline générés par le SSR),
 *  - Supabase (API REST + realtime en websocket),
 *  - l'aperçu Lovable, qui affiche le site dans une iframe.
 *
 * Ce module est la source de vérité utilisée à la fois par le runtime serveur
 * (`src/server.ts`) et par le contrôle CI (`scripts/security-check.mjs`).
 */

export const CSP_DIRECTIVES: Record<string, string[]> = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  "form-action": ["'self'"],
  "frame-ancestors": ["'self'", "https://*.lovable.app", "https://lovable.dev"],
  "script-src": ["'self'", "'unsafe-inline'", "https://cdn.gpteng.co"],
  "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "media-src": ["'self'", "data:", "blob:"],
  "connect-src": [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://connector-gateway.lovable.dev",
    "https://*.lovable.app",
    "https://*.lovable.dev",
  ],
  "worker-src": ["'self'", "blob:"],
  "manifest-src": ["'self'"],
  "frame-src": ["'self'", "https://www.google.com"],
  "upgrade-insecure-requests": [],
};

export function contentSecurityPolicy(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => (sources.length ? `${directive} ${sources.join(" ")}` : directive))
    .join("; ");
}

/** En-têtes de sécurité attendus sur toute réponse HTML. */
export function securityHeaders(): Record<string, string> {
  return {
    "content-security-policy": contentSecurityPolicy(),
    "strict-transport-security": "max-age=31536000; includeSubDomains; preload",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "cross-origin-opener-policy": "same-origin-allow-popups",
    "cross-origin-resource-policy": "cross-origin",
    "x-permitted-cross-domain-policies": "none",
  };
}

/** Applique les en-têtes de sécurité aux documents HTML sans toucher aux assets. */
export function withSecurityHeaders(response: Response): Response {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;

  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(securityHeaders())) {
    if (!headers.has(name)) headers.set(name, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
