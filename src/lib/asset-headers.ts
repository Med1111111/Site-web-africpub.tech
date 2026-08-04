/**
 * Cache / compression negotiation headers for static assets (images, fonts, JS/CSS).
 *
 * - Hashed build assets (/_build/, /assets/, or a `?v=`/content hash) → immutable, 1 year.
 * - Modern image formats (WebP/AVIF and friends) → 30 days public cache + SWR.
 * - Everything static → weak ETag when the upstream response has none, so returning
 *   visitors can revalidate with a cheap 304 instead of re-downloading.
 * - `Vary: Accept-Encoding` so gzip/brotli variants are cached separately by the CDN.
 */

const IMAGE_EXT = /\.(avif|webp|png|jpe?g|gif|svg|ico)$/i;
const FONT_EXT = /\.(woff2?|ttf|otf|eot)$/i;
const CODE_EXT = /\.(js|mjs|css|map)$/i;
const HASHED = /(^\/(_build|assets|_serverFn)\/)|(\.[0-9a-f]{8,}\.[a-z0-9]+$)/i;

const IMMUTABLE = "public, max-age=31536000, immutable";
const IMAGE_CACHE = "public, max-age=2592000, stale-while-revalidate=86400";
const STATIC_CACHE = "public, max-age=604800, stale-while-revalidate=86400";

export function cacheControlForPath(pathname: string): string | undefined {
  if (HASHED.test(pathname)) return IMMUTABLE;
  if (IMAGE_EXT.test(pathname)) return IMAGE_CACHE;
  if (FONT_EXT.test(pathname)) return IMMUTABLE;
  if (CODE_EXT.test(pathname)) return STATIC_CACHE;
  return undefined;
}

function isCompressible(contentType: string): boolean {
  return (
    contentType.startsWith("text/") ||
    /(javascript|json|xml|svg|wasm|font\/(ttf|otf))/i.test(contentType)
  );
}

/** Cheap, stable 32-bit hash used to build a weak ETag. */
function weakEtag(input: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < input.length; i += 1) {
    const c = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 + c + i, 2246822519) >>> 0;
  }
  return `W/"${h1.toString(16)}${h2.toString(16)}"`;
}

/**
 * Applies cache/compression headers to a static asset response and answers
 * conditional requests (If-None-Match) with 304 when possible.
 */
export async function withAssetHeaders(request: Request, response: Response): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") return response;
  if (!response.ok || response.status === 206) return response;

  const { pathname } = new URL(request.url);
  const cacheControl = cacheControlForPath(pathname);
  if (!cacheControl) return response;

  const headers = new Headers(response.headers);
  const contentType = headers.get("content-type") ?? "";

  headers.set("cache-control", cacheControl);
  if (isCompressible(contentType) || headers.has("content-encoding")) {
    const vary = headers.get("vary");
    if (!vary) headers.set("vary", "Accept-Encoding");
    else if (!/accept-encoding/i.test(vary)) headers.set("vary", `${vary}, Accept-Encoding`);
  }

  let body: ArrayBuffer | null = null;
  if (!headers.has("etag")) {
    body = await response.clone().arrayBuffer();
    headers.set("etag", weakEtag(`${pathname}:${body.byteLength}:${contentType}`));
  }

  const etag = headers.get("etag");
  const ifNoneMatch = request.headers.get("if-none-match");
  if (etag && ifNoneMatch && ifNoneMatch.split(",").some((tag) => tag.trim() === etag)) {
    return new Response(null, { status: 304, headers });
  }

  return new Response(body ?? response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
