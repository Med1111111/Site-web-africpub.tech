import { useEffect, useRef } from "react";

/**
 * Fond WebGL interactif (Three.js) chargé de façon différée :
 * - au premier rendu, seul le dégradé CSS est affiché (aucun coût JS)
 * - la scène Three.js démarre après hydratation, à l'idle ou à la première
 *   interaction utilisateur, ce qui sort le chunk `three` du chemin critique
 * - désactivée si prefers-reduced-motion, mobile, appareil faible, save-data
 *   ou WebGL indisponible.
 */
function shouldSkipScene() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (window.innerWidth < 768) return true;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency <= 4) return true;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4) return true;
  if (nav.connection?.saveData) return true;

  try {
    const canvas = document.createElement("canvas");
    if (!canvas.getContext("webgl") && !canvas.getContext("experimental-webgl")) return true;
  } catch {
    return true;
  }
  return false;
}

export default function WebGLBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (shouldSkipScene()) return;

    let disposed = false;
    let started = false;
    let cleanupScene: (() => void) | null = null;

    const events = ["pointermove", "pointerdown", "scroll", "keydown", "touchstart"] as const;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const removeTriggers = () => {
      events.forEach((ev) => window.removeEventListener(ev, start));
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };

    function start() {
      if (started || disposed) return;
      started = true;
      removeTriggers();
      void import("./webgl-scene").then(async ({ startScene }) => {
        if (disposed || !el) return;
        const dispose = await startScene(el);
        if (disposed) {
          dispose();
          return;
        }
        cleanupScene = dispose;
      });
    }

    events.forEach((ev) => window.addEventListener(ev, start, { passive: true, once: true }));

    const ric = (window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    }).requestIdleCallback;
    if (ric) {
      idleId = ric(() => start(), { timeout: 3000 });
    } else {
      timeoutId = window.setTimeout(start, 2000);
    }

    return () => {
      disposed = true;
      removeTriggers();
      cleanupScene?.();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background opacity-100 [.light_&]:opacity-30"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(227,6,19,0.28),transparent_55%),radial-gradient(circle_at_85%_75%,rgba(255,110,40,0.18),transparent_55%)]" />
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
