import { Reveal } from "@/components/Reveal";

/** En-tête de page réutilisable (glass + halo). */
export default function PageHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <header className="mx-auto max-w-4xl px-4 pt-36 text-center sm:pt-44">
      <Reveal>
        <p className="inline-flex rounded-full glass-soft px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="mt-6 text-4xl font-bold sm:text-6xl">
          <span className="text-gradient">{title}</span>
        </h1>
        {sub && (
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">{sub}</p>
        )}
      </Reveal>
    </header>
  );
}
