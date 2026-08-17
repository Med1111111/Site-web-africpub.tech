import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createElement } from "react";

export type Lang = "fr" | "ar" | "en";
export type Theme = "dark" | "light";

type Dict = Record<string, string>;

const fr: Dict = {
  "nav.home": "Accueil",
  "nav.about": "À propos",
  "nav.services": "Services",
  "nav.portfolio": "Portfolio",
  "nav.contact": "Contact",
  "nav.faq": "FAQ",
  "cta.quote": "Demander un devis",
  "hero.badge": "Agence de communication globale — Algérie",
  "hero.title1": "Nous donnons",
  "hero.title2": "de la lumière",
  "hero.title3": "à votre marque.",
  "hero.sub":
    "Enseignes lumineuses, signalétique, impression grand format, habillage de véhicules et branding. De la conception 3D à la pose, partout en Algérie.",
  "hero.cta1": "Démarrer un projet",
  "hero.cta2": "Voir nos réalisations",
  "section.services": "Nos services",
  "section.services.sub": "Une chaîne complète, du concept à l'installation.",
  "section.portfolio": "Réalisations",
  "section.portfolio.sub": "Des projets livrés pour des marques exigeantes.",
  "section.process": "Notre processus",
  "section.clients": "Ils nous font confiance",
  "section.testimonials": "Témoignages",
  "cta.title": "Un projet d'enseigne ou de signalétique ?",
  "cta.sub": "Réponse sous 24h. Étude et devis gratuits.",
  "footer.rights": "Tous les droits réservés.",
};

const en: Dict = {
  "nav.home": "Home",
  "nav.about": "About",
  "nav.services": "Services",
  "nav.portfolio": "Portfolio",
  "nav.contact": "Contact",
  "nav.faq": "FAQ",
  "cta.quote": "Request a quote",
  "hero.badge": "Global communication agency — Algeria",
  "hero.title1": "We bring",
  "hero.title2": "light",
  "hero.title3": "to your brand.",
  "hero.sub":
    "Illuminated signs, signage, large-format printing, vehicle wrapping and branding. From 3D design to installation, across Algeria.",
  "hero.cta1": "Start a project",
  "hero.cta2": "See our work",
  "section.services": "Our services",
  "section.services.sub": "A full chain, from concept to installation.",
  "section.portfolio": "Selected work",
  "section.portfolio.sub": "Projects delivered for demanding brands.",
  "section.process": "Our process",
  "section.clients": "Trusted by",
  "section.testimonials": "Testimonials",
  "cta.title": "Planning a sign or signage project?",
  "cta.sub": "Answer within 24h. Free study and quote.",
  "footer.rights": "All rights reserved.",
};

const ar: Dict = {
  "nav.home": "الرئيسية",
  "nav.about": "من نحن",
  "nav.services": "خدماتنا",
  "nav.portfolio": "أعمالنا",
  "nav.contact": "اتصل بنا",
  "nav.faq": "الأسئلة",
  "cta.quote": "اطلب عرض سعر",
  "hero.badge": "وكالة اتصال شاملة — الجزائر",
  "hero.title1": "نمنح",
  "hero.title2": "الضوء",
  "hero.title3": "لعلامتك التجارية.",
  "hero.sub":
    "لافتات مضيئة، لوحات إرشادية، طباعة بمقاسات كبيرة، تغليف المركبات والهوية البصرية. من التصميم إلى التركيب في كامل الجزائر.",
  "hero.cta1": "ابدأ مشروعك",
  "hero.cta2": "شاهد أعمالنا",
  "section.services": "خدماتنا",
  "section.services.sub": "سلسلة كاملة من الفكرة إلى التركيب.",
  "section.portfolio": "أعمالنا",
  "section.portfolio.sub": "مشاريع منجزة لعلامات مرموقة.",
  "section.process": "منهجية العمل",
  "section.clients": "يثقون بنا",
  "section.testimonials": "آراء العملاء",
  "cta.title": "لديك مشروع لافتة أو لوحة إرشادية؟",
  "cta.sub": "رد خلال 24 ساعة. دراسة وعرض سعر مجاني.",
  "footer.rights": "جميع الحقوق محفوظة.",
};

const dicts: Record<Lang, Dict> = { fr, en, ar };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
  theme: Theme;
  toggleTheme: () => void;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");
  const [theme, setTheme] = useState<Theme>("dark");

  // Restauration des préférences (localStorage + préférence système).
  useEffect(() => {
    const storedLang = localStorage.getItem("ap-lang") as Lang | null;
    if (storedLang && storedLang in dicts) setLangState(storedLang);
    const storedTheme = localStorage.getItem("ap-theme") as Theme | null;
    // Thème sombre par défaut (identité premium) ; le choix utilisateur prime.
    if (storedTheme) setTheme(storedTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("ap-lang", lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("ap-theme", theme);
  }, [theme]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang: setLangState,
      t: (k) => dicts[lang][k] ?? dicts.fr[k] ?? k,
      theme,
      toggleTheme: () => setTheme((p) => (p === "dark" ? "light" : "dark")),
    }),
    [lang, theme],
  );

  return createElement(AppContext.Provider, { value }, children);
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
