import { useEffect, useRef } from "react";

/**
 * Effet "bouton magnétique" : le bouton suit légèrement le curseur au survol,
 * puis revient à sa position avec un ressort doux. Désactivé sur tactile et
 * si prefers-reduced-motion (respecte le système déjà en place ailleurs).
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.35, max = 10) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let frame = 0;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      const x = Math.max(-max, Math.min(max, relX * strength));
      const y = Math.max(-max, Math.min(max, relY * strength));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(frame);
      el.style.transform = "translate(0, 0)";
    };

    el.style.transition = "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)";
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [strength, max]);

  return ref;
}
