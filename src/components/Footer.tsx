import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png.asset.json";
import { useApp } from "@/lib/app-context";
import { services } from "@/lib/site-data";

const linkClass =
  "rounded-sm underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function Footer() {
  const { t } = useApp();

  return (
    <footer role="contentinfo" aria-label="Pied de page" className="mt-24 px-3 pb-24 sm:px-6 lg:pb-10">
      <div className="mx-auto max-w-7xl rounded-3xl glass p-8 sm:p-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <img
              src={logo.url}
              alt="Afric Pub — communication globale"
              className="h-11 w-auto"
              width={150}
              height={44}
            />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Agence de communication globale. Enseignes, signalétique et impression grand format en Algérie.
            </p>
          </div>

          <nav aria-labelledby="footer-services-heading">
            <h2 id="footer-services-heading" className="text-sm font-semibold text-foreground">
              Services
            </h2>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
              {services.slice(0, 5).map((s) => (
                <li key={s.slug}>
                  <Link to="/services" hash={s.slug} className={linkClass}>
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-agency-heading">
            <h2 id="footer-agency-heading" className="text-sm font-semibold text-foreground">
              Agence
            </h2>
            <ul className="mt-4 grid gap-2 text-sm text-muted-foreground">
              <li><Link to="/a-propos" className={linkClass}>{t("nav.about")}</Link></li>
              <li><Link to="/portfolio" className={linkClass}>{t("nav.portfolio")}</Link></li>
              <li><Link to="/faq" className={linkClass}>{t("nav.faq")}</Link></li>
              <li><Link to="/confidentialite" className={linkClass}>Confidentialité</Link></li>
              <li><Link to="/conditions" className={linkClass}>Conditions</Link></li>
            </ul>
          </nav>

          <div>
            <h2 id="footer-contact-heading" className="text-sm font-semibold text-foreground">
              Contact
            </h2>
            <address
              aria-labelledby="footer-contact-heading"
              className="mt-4 grid gap-2 text-sm not-italic text-muted-foreground"
            >
              <p>Bouismail, Tipaza, Algérie</p>
              <p>
                <a
                  href="mailto:contact@africpub.tech"
                  aria-label="Envoyer un e-mail à contact@africpub.tech"
                  className={linkClass}
                >
                  contact@africpub.tech
                </a>
              </p>
              <p>
                <a
                  href="tel:+213540481810"
                  aria-label="Appeler le +213 540 48 18 10"
                  className={linkClass}
                >
                  +213 540 48 18 10
                </a>
              </p>
            </address>
            <Link
              to="/contact"
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
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
