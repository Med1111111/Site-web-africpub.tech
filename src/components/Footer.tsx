import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png.asset.json";
import { useApp } from "@/lib/app-context";
import { services } from "@/lib/site-data";

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="mt-24 px-3 pb-24 sm:px-6 lg:pb-10">
      <div className="mx-auto max-w-7xl rounded-3xl glass p-8 sm:p-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <img src={logo.url} alt="Afric Pub" className="h-11 w-auto" width={150} height={44} />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Agence de communication globale. Enseignes, signalétique et impression grand format en Algérie.
            </p>
          </div>

          <nav aria-label="Services">
            <h2 className="text-sm font-semibold">Services</h2>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
              {services.slice(0, 5).map((s) => (
                <li key={s.slug}>
                  <Link to="/services" className="transition-colors hover:text-foreground">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Pages">
            <h2 className="text-sm font-semibold">Agence</h2>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
              <li><Link to="/a-propos" className="hover:text-foreground">{t("nav.about")}</Link></li>
              <li><Link to="/portfolio" className="hover:text-foreground">{t("nav.portfolio")}</Link></li>
              <li><Link to="/faq" className="hover:text-foreground">{t("nav.faq")}</Link></li>
              <li><Link to="/confidentialite" className="hover:text-foreground">Confidentialité</Link></li>
              <li><Link to="/conditions" className="hover:text-foreground">Conditions</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold">Contact</h2>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
              <li>Bouismail, Tipaza, Algérie</li>
              <li>
                <a href="mailto:contact@africpub.tech" className="hover:text-foreground">contact@africpub.tech</a>
              </li>
              <li>
                <a href="tel:+213540481810" className="hover:text-foreground">+213 540 48 18 10{"\n\n"}</a>
              </li>
            </ul>
            <Link
              to="/contact"
              className="mt-5 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              {t("cta.quote")}
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-glass-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Afric Pub. {t("footer.rights")}</p>
          <p>Communication Globale — Algérie</p>
        </div>
      </div>
    </footer>
  );
}
