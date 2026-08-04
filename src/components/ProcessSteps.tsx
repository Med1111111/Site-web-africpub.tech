import { ClipboardList, PenTool, Factory, ShieldCheck, type LucideIcon } from "lucide-react";

import { Reveal } from "@/components/Reveal";
import { process } from "@/lib/site-data";

const stepIcons: LucideIcon[] = [ClipboardList, PenTool, Factory, ShieldCheck];

/** Les 4 étapes de la méthodologie, avec badges à halo et connecteur en dégradé. */
export function ProcessSteps({ label = "Les étapes de notre processus" }: { label?: string }) {
  return (
    <ol aria-label={label} className="relative grid gap-4 lg:grid-cols-4">
      {process.map((p, i) => {
        const Icon = stepIcons[i] ?? ClipboardList;
        const isLast = i === process.length - 1;
        return (
          <Reveal as="li" key={p.step} delay={i * 80} className="relative h-full">
            {/* connecteur orange → rouge : vertical sur mobile, horizontal sur desktop */}
            {!isLast && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-[3.25rem] top-full bottom-[-1rem] w-px bg-gradient-to-b from-orange-400 to-primary/40 lg:bottom-auto lg:left-auto lg:right-[-1rem] lg:top-[3.25rem] lg:h-px lg:w-4 lg:bg-gradient-to-r lg:from-orange-400 lg:to-primary/40"
              />
            )}
            <div className="relative h-full rounded-3xl glass p-7">
              <div className="flex items-center gap-4">
                <span
                  aria-hidden="true"
                  className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-primary-foreground shadow-[0_0_30px_-6px_var(--color-primary)]"
                >
                  <span className="absolute inset-0 rounded-full bg-brand blur-lg opacity-60" />
                  <Icon className="relative h-6 w-6" strokeWidth={2} aria-hidden="true" focusable="false" />
                </span>
                <span className="text-sm font-semibold text-primary">
                  <span className="sr-only">Étape {i + 1} sur {process.length} : </span>
                  <span aria-hidden="true">{p.step}</span>
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          </Reveal>
        );
      })}
    </ol>
  );

}

export default ProcessSteps;
