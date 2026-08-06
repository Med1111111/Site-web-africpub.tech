import { useEffect, useRef, useState } from "react";

const DIGIT_RE = /^(\D*)([\d\s]+)(\D*)$/;
// toLocaleString("fr-FR") separates thousands with a narrow no-break space (U+202F).
const NARROW_NBSP = " ";

function formatThousands(n: number): string {
  return n.toLocaleString("fr-FR").split(NARROW_NBSP).join(" ");
}

/**
 * Anime un chiffre-clé (ex. "1 200+", "97%") de 0 à sa valeur au moment où il
 * entre dans le viewport. Respecte prefers-reduced-motion (valeur finale
 * affichée immédiatement) et les valeurs non numériques (rendues telles quelles).
 */
export function CountUp({ value, durationMs = 1400 }: { value: string; durationMs?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const match = value.match(DIGIT_RE);
  const target = match ? Number(match[2].replace(/\s/g, "")) : null;
  const [display, setDisplay] = useState(target === null ? value : `${match![1]}0${match![3]}`);

  useEffect(() => {
    const node = ref.current;
    if (!node || target === null || !match) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        io.disconnect();

        const start = performance.now();
        const [prefix, , suffix] = match;
        const tick = (now: number) => {
          const progress = Math.min(1, (now - start) / durationMs);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(target * eased);
          setDisplay(`${prefix}${formatThousands(current)}${suffix}`);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [target, durationMs, value, match]);

  return <span ref={ref}>{display}</span>;
}
