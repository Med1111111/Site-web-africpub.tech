import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "@/assets/logo.png.asset.json";
import { useApp, type Lang } from "@/lib/app-context";

const links = [
  { to: "/", key: "nav.home" },
  { to: "/services", key: "nav.services" },
  { to: "/portfolio", key: "nav.portfolio" },
  { to: "/a-propos", key: "nav.about" },
  { to: "/faq", key: "nav.faq" },
  { to: "/contact", key: "nav.contact" },
] as const;

const langs: Lang[] = ["fr", "ar", "en"];

export default function Navbar() {
  const { t, lang, setLang, theme, toggleTheme } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "py-2" : "py-4"}`}
      >
        <nav
          aria-label="Navigation principale"
          className={`mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-500 sm:px-6 lg:grid-cols-[auto_1fr_auto] ${
            scrolled ? "glass mx-3 sm:mx-6" : "mx-3 sm:mx-6 border border-transparent"
          }`}
        >
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="Afric Pub — accueil">
            <img src={logo.url} alt="Afric Pub" className="h-9 w-auto shrink-0" width={120} height={36} />
          </Link>

          <ul className="hidden items-center justify-center gap-1 lg:flex">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-glass hover:text-foreground data-[status=active]:text-foreground"
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            <div className="hidden items-center rounded-full border border-glass-border p-0.5 sm:flex">
              {langs.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  aria-pressed={lang === l}
                  className={`rounded-full px-2.5 py-1 text-xs uppercase transition-colors ${
                    lang === l ? "bg-brand text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
              className="grid size-11 place-items-center rounded-full glass-soft text-foreground transition-transform hover:scale-105"
            >
              {theme === "dark" ? "☾" : "☀"}
            </button>

            <Link
              to="/contact"
              className="hidden rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.03] lg:inline-flex"
            >
              {t("cta.quote")}
            </Link>

            <button
              onClick={() => setOpen((o) => !o)}
              aria-label="Ouvrir le menu"
              aria-expanded={open}
              className="grid size-11 place-items-center rounded-full glass-soft lg:hidden"
            >
              <span className="text-lg">{open ? "✕" : "☰"}</span>
            </button>
          </div>
        </nav>

        {open && (
          <div className="mx-3 mt-2 rounded-2xl glass p-4 lg:hidden sm:mx-6">
            <ul className="grid gap-1">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="block rounded-xl px-4 py-3 text-base hover:bg-glass">
                    {t(l.key)}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2">
              {langs.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-full px-3 py-2 text-xs uppercase ${
                    lang === l ? "bg-brand text-primary-foreground" : "glass-soft text-muted-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Barre de navigation basse (mobile) */}
      <nav
        aria-label="Navigation mobile"
        className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-4 gap-1 rounded-2xl glass p-2 lg:hidden"
      >
        {[links[0], links[1], links[2], links[5]].map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="grid min-h-11 place-items-center rounded-xl px-2 py-2 text-center text-xs text-muted-foreground transition-colors data-[status=active]:bg-brand data-[status=active]:text-primary-foreground"
          >
            {t(l.key)}
          </Link>
        ))}
      </nav>
    </>
  );
}
