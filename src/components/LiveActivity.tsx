import { useEffect, useRef, useState } from "react";
import { Eye, Heart, MessageCircle, Quote, Sparkles, TrendingUp } from "lucide-react";

/** Flux d'activité (illustratif) — donne vie à la page d'accueil. */
const feed = [
  { icon: Eye, text: "Un visiteur consulte « Enseignes lumineuses »", meta: "à l'instant" },
  { icon: MessageCircle, text: "Nouvelle demande de devis reçue depuis WhatsApp", meta: "il y a 2 min" },
  { icon: Heart, text: "Une réalisation « Totem lumineux » a été partagée", meta: "il y a 6 min" },
  { icon: Sparkles, text: "Étude technique lancée pour une façade Alucobond", meta: "il y a 11 min" },
  { icon: TrendingUp, text: "Pose terminée : enseigne LED sur mesure", meta: "il y a 18 min" },
  { icon: Quote, text: "Nouvel avis client 5★ ajouté au portfolio", meta: "il y a 24 min" },
];

const counters = [
  { label: "Visites cette semaine", value: 2480, suffix: "+" },
  { label: "Devis traités ce mois", value: 96, suffix: "" },
  { label: "Satisfaction client", value: 98, suffix: "%" },
];

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return value;
}

function Counter({ label, value, suffix, active }: { label: string; value: number; suffix: string; active: boolean }) {
  const n = useCountUp(value, active);
  return (
    <li className="rounded-2xl glass-soft p-5 text-center">
      <p className="text-3xl font-extrabold text-gradient sm:text-4xl tabular-nums">
        {n.toLocaleString("fr-FR")}
        {suffix}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </li>
  );
}

export function LiveActivity() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setOffset((o) => (o + 1) % feed.length), 2800);
    return () => window.clearInterval(id);
  }, [active]);

  const visible = [0, 1, 2, 3].map((i) => feed[(offset + i) % feed.length]);

  return (
    <div ref={ref} className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
        {counters.map((c) => (
          <Counter key={c.label} {...c} active={active} />
        ))}
      </ul>

      <div className="relative overflow-hidden rounded-3xl glass p-5">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-24 -z-10 opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse 50% 40% at 20% 20%, rgba(255,120,40,0.35), transparent 70%), radial-gradient(ellipse 50% 40% at 85% 80%, rgba(227,6,19,0.32), transparent 70%)",
          }}
        />
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Activité du site en direct</p>
          <span className="inline-flex items-center gap-2 rounded-full glass-soft px-3 py-1 text-xs text-muted-foreground">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            En ligne
          </span>
        </div>

        <ul className="mt-4 space-y-2" aria-live="polite">
          {visible.map((item, i) => (
            <li
              key={`${item.text}-${offset}-${i}`}
              className="flex items-center gap-3 rounded-2xl glass-soft px-4 py-3 animate-fade-in"
              style={{ animationDelay: `${i * 70}ms`, opacity: 1 - i * 0.14 }}
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full neon-social">
                <item.icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">{item.text}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{item.meta}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
