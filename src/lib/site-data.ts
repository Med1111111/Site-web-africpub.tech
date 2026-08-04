import enseigne from "@/assets/service-enseigne-lumineuse.jpg.asset.json";
import alucobond from "@/assets/service-alucobond-3d.jpg.asset.json";
import facade from "@/assets/service-facade-alucobond.jpg.asset.json";
import cnc from "@/assets/service-decoupe-cnc.jpg.asset.json";
import rollup from "@/assets/service-rollup-banniere.jpg.asset.json";
import petitFormat from "@/assets/service-impression-petit-format.jpg.asset.json";
import triFold from "@/assets/service-print-tri-fold.jpg.asset.json";
import packaging from "@/assets/service-packaging.jpg.asset.json";
import affichageLed from "@/assets/service-affichage-led.jpg.asset.json";
import stand from "@/assets/stand.jpg.asset.json";
import realEnseigne from "@/assets/realisation-enseigne-led.jpg";
import realSignaletique from "@/assets/realisation-signaletique.jpg";
import realCovering from "@/assets/realisation-covering.jpg";
import realImpression from "@/assets/realisation-impression.jpg";
import realTotem from "@/assets/realisation-totem.jpg";
import realPackaging from "@/assets/realisation-packaging.jpg";
// Variantes responsives AVIF/WebP générées au build (vite-imagetools).
import realEnseigneAvif from "@/assets/realisation-enseigne-led.jpg?w=480;768;1024&format=avif&as=srcset";
import realEnseigneWebp from "@/assets/realisation-enseigne-led.jpg?w=480;768;1024&format=webp&as=srcset";
import realSignaletiqueAvif from "@/assets/realisation-signaletique.jpg?w=480;768;1024&format=avif&as=srcset";
import realSignaletiqueWebp from "@/assets/realisation-signaletique.jpg?w=480;768;1024&format=webp&as=srcset";
import realCoveringAvif from "@/assets/realisation-covering.jpg?w=480;768;1024&format=avif&as=srcset";
import realCoveringWebp from "@/assets/realisation-covering.jpg?w=480;768;1024&format=webp&as=srcset";
import realImpressionAvif from "@/assets/realisation-impression.jpg?w=480;768;1024&format=avif&as=srcset";
import realImpressionWebp from "@/assets/realisation-impression.jpg?w=480;768;1024&format=webp&as=srcset";
import realTotemAvif from "@/assets/realisation-totem.jpg?w=480;768;1024&format=avif&as=srcset";
import realTotemWebp from "@/assets/realisation-totem.jpg?w=480;768;1024&format=webp&as=srcset";
import realPackagingAvif from "@/assets/realisation-packaging.jpg?w=480;768;1024&format=avif&as=srcset";
import realPackagingWebp from "@/assets/realisation-packaging.jpg?w=480;768;1024&format=webp&as=srcset";


export type Service = {
  slug: string;
  title: string;
  desc: string;
  icon: string;
  image: string;
  alt: string;
};

export const services: Service[] = [
  {
    slug: "enseignes",
    title: "Enseigne lumineuse",
    desc: "Lettres boîtiers LED, néon flex, caissons double face. Étude photométrique, fabrication atelier et pose certifiée.",
    icon: "✦",
    image: enseigne.url,
    alt: "Lettres boîtiers lumineuses à LED en cours de fabrication",
  },
  {
    slug: "alucobond-3d",
    title: "Habillage Alucobond 3D",
    desc: "Façades en panneaux composites aluminium, facettes 3D, pliage sur mesure et structure porteuse.",
    icon: "◧",
    image: alucobond.url,
    alt: "Habillage de façade en Alucobond à facettes 3D",
  },
  {
    slug: "facades",
    title: "Façades architecturales",
    desc: "Bardage composite grande hauteur, calepinage, intégration lumière et pose sur ossature.",
    icon: "▦",
    image: facade.url,
    alt: "Façade architecturale en panneaux composites gris à facettes",
  },
  {
    slug: "decoupe-cnc",
    title: "Découpe CNC",
    desc: "Usinage numérique du MDF, PVC, plexiglas et composites : claustras, lettrages et décors ajourés.",
    icon: "✕",
    image: cnc.url,
    alt: "Machine CNC usinant un panneau décoratif ajouré",
  },
  {
    slug: "roll-up",
    title: "Roll-up & bannières",
    desc: "Roll-up premium, X-banner, kakémonos et bannières salon. Impression haute définition et livraison rapide.",
    icon: "▮",
    image: rollup.url,
    alt: "Roll-up publicitaires alignés dans un hall d'accueil",
  },
  {
    slug: "stands",
    title: "Stand d'exposition",
    desc: "Conception et montage de stands sur mesure : structure, éclairage, écrans et mobilier.",
    icon: "◫",
    image: stand.url,
    alt: "Stand d'exposition Afric Pub illuminé en rouge",
  },
  {
    slug: "impression-petit-format",
    title: "Impression petit format",
    desc: "Cartes de visite, flyers, dépliants, brochures et papeterie. Colorimétrie calibrée et finitions pelliculées.",
    icon: "▤",
    image: petitFormat.url,
    alt: "Pile de brochures imprimées en quadrichromie sortant de presse",
  },
  {
    slug: "print-commercial",
    title: "Supports commerciaux",
    desc: "Dépliants 3 volets, catalogues, plaquettes et documents commerciaux entièrement conçus par notre studio.",
    icon: "◈",
    image: triFold.url,
    alt: "Dépliants commerciaux trois volets rouge et noir",
  },
  {
    slug: "packaging",
    title: "Packaging personnalisé",
    desc: "Création et production d'emballages : étuis, coffrets, étiquettes et vernis sélectif.",
    icon: "◱",
    image: packaging.url,
    alt: "Étuis de packaging personnalisés alignés en rangées",
  },
  {
    slug: "affichage-led",
    title: "Affichage LED & grand format",
    desc: "Écrans LED, bâches, mesh, panneaux 4x3 et habillage urbain jusqu'à 5 m de laize.",
    icon: "▣",
    image: affichageLed.url,
    alt: "Écrans LED publicitaires allumés dans une rue la nuit",
  },
];


export const stats = [
  { value: "1 200+", label: "Projets livrés" },
  { value: "58", label: "Wilayas couvertes" },
  { value: "18", label: "Années d'expérience" },
  { value: "97%", label: "Clients fidélisés" },
];

export const projects = [
  {
    title: "Enseigne LED sur mesure",
    category: "Enseignes",
    image: realEnseigne,
    avif: realEnseigneAvif,
    webp: realEnseigneWebp,
    alt: "Lettres boîtiers LED rouges rétroéclairées sur une façade de boutique la nuit",
  },
  {
    title: "Signalétique intérieure premium",
    category: "Signalétique",
    image: realSignaletique,
    avif: realSignaletiqueAvif,
    webp: realSignaletiqueWebp,
    alt: "Panneaux directionnels et totem lumineux dans un hall sombre",
  },
  {
    title: "Covering de flotte professionnelle",
    category: "Véhicules",
    image: realCovering,
    avif: realCoveringAvif,
    webp: realCoveringWebp,
    alt: "Flotte d'utilitaires floqués rouge et blanc alignés la nuit",
  },
  {
    title: "Stand d'exposition modulaire",
    category: "Grand format",
    image: realStand,
    avif: realStandAvif,
    webp: realStandWebp,
    alt: "Stand d'exposition noir souligné de LED rouges",
  },
  {
    title: "Totem lumineux extérieur",
    category: "Enseignes",
    image: realTotem,
    avif: realTotemAvif,
    webp: realTotemWebp,
    alt: "Totem publicitaire vertical à LED rouge et orange en extérieur",
  },
  {
    title: "Habillage de façade composite",
    category: "Grand format",
    image: realFacade,
    avif: realFacadeAvif,
    webp: realFacadeWebp,
    alt: "Façade en panneaux composites à facettes avec liserés lumineux rouges",
  },
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
