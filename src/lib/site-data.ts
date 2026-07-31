export type Service = {
  slug: string;
  title: string;
  desc: string;
  icon: string;
};

export const services: Service[] = [
  {
    slug: "enseignes",
    title: "Enseignes lumineuses",
    desc: "Lettres boîtiers LED, néon flex, caissons double face. Étude photométrique, fabrication atelier et pose certifiée.",
    icon: "✦",
  },
  {
    slug: "signaletique",
    title: "Signalétique",
    desc: "Signalétique intérieure, directionnelle et de chantier. Totems, plaques, PMR et normes ISO 7010.",
    icon: "▤",
  },
  {
    slug: "impression",
    title: "Impression numérique",
    desc: "Impression UV, latex et éco-solvant sur tous supports. Colorimétrie calibrée et finitions professionnelles.",
    icon: "◈",
  },
  {
    slug: "vehicules",
    title: "Habillage de véhicules",
    desc: "Covering total ou partiel, flotte d'entreprise, vitres microperforées. Films certifiés 7 ans.",
    icon: "➤",
  },
  {
    slug: "branding",
    title: "Branding & identité",
    desc: "Plateforme de marque, logotype, charte graphique, déclinaisons print et digital.",
    icon: "◎",
  },
  {
    slug: "grand-format",
    title: "Impression grand format",
    desc: "Bâches, mesh, panneaux 4x3, habillage de façade et stands salons jusqu'à 5 m de laize.",
    icon: "▣",
  },
];

export const stats = [
  { value: "1 200+", label: "Projets livrés" },
  { value: "58", label: "Wilayas couvertes" },
  { value: "18", label: "Années d'expérience" },
  { value: "97%", label: "Clients fidélisés" },
];

export const projects = [
  { title: "Enseigne LED — Retail Alger", category: "Enseignes", city: "Alger" },
  { title: "Signalétique complète — Campus", category: "Signalétique", city: "Oran" },
  { title: "Covering flotte — Logistique", category: "Véhicules", city: "Blida" },
  { title: "Stand salon 120 m²", category: "Grand format", city: "Alger" },
  { title: "Totem lumineux — Station", category: "Enseignes", city: "Sétif" },
  { title: "Habillage façade — Banque", category: "Grand format", city: "Constantine" },
];

export const categories = ["Tous", "Enseignes", "Signalétique", "Véhicules", "Grand format"];

export const process = [
  { step: "01", title: "Brief & audit", desc: "Analyse du site, contraintes techniques et réglementaires." },
  { step: "02", title: "Conception 3D", desc: "Simulation photoréaliste et validation client." },
  { step: "03", title: "Fabrication", desc: "Atelier intégré : découpe, LED, assemblage, contrôle qualité." },
  { step: "04", title: "Pose & SAV", desc: "Installation par équipes certifiées et maintenance garantie." },
];

export const testimonials = [
  {
    quote: "Une enseigne posée en 12 jours, sans un seul retard. Le rendu nocturne dépasse la simulation 3D.",
    name: "Karim B.",
    role: "Directeur retail, Alger",
  },
  {
    quote: "La signalétique de nos trois sites a été harmonisée en une seule campagne. Travail rigoureux.",
    name: "Nadia M.",
    role: "Responsable communication",
  },
  {
    quote: "Le covering de notre flotte de 24 véhicules est impeccable après deux ans d'exploitation.",
    name: "Yacine T.",
    role: "Directeur logistique",
  },
];

export const clients = ["Ooredoo", "Cevital", "Naftal", "Djezzy", "Condor", "Air Algérie"];

export const faq = [
  {
    q: "Quels sont vos délais de fabrication ?",
    a: "Comptez 7 à 15 jours ouvrés selon la complexité de l'enseigne, hors autorisations administratives.",
  },
  {
    q: "Intervenez-vous dans toute l'Algérie ?",
    a: "Oui. Nos équipes de pose interviennent dans les 58 wilayas, avec un référent projet unique.",
  },
  {
    q: "Proposez-vous un devis gratuit ?",
    a: "Chaque demande donne lieu à une étude technique et un devis détaillé gratuits sous 24 à 48h.",
  },
  {
    q: "Quelle garantie sur les enseignes LED ?",
    a: "Garantie 3 ans sur les modules LED et alimentations, 2 ans sur la structure, maintenance optionnelle.",
  },
  {
    q: "Gérez-vous les autorisations de pose ?",
    a: "Oui, nous préparons les dossiers APC et accompagnons vos démarches d'affichage.",
  },
];
