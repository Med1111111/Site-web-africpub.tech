import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPortfolioItems from "./tools/list-portfolio-items";
import createPortfolioItem from "./tools/create-portfolio-item";
import updatePortfolioItem from "./tools/update-portfolio-item";
import listTestimonials from "./tools/list-testimonials";
import createTestimonial from "./tools/create-testimonial";
import listContactMessages from "./tools/list-contact-messages";
import getSiteSettings from "./tools/get-site-settings";
import updateSiteSettings from "./tools/update-site-settings";

// L'émetteur OAuth doit être l'hôte Supabase direct : la référence projet est
// la seule valeur inchangée après publication (inlinée par Vite au build).
const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

export default defineMcp({
  name: "afric-brilliance",
  title: "Afric Brilliance",
  version: "0.1.0",
  instructions:
    "Outils du site Afric Pub (communication visuelle, Algérie). Lecture du portfolio, des témoignages, des réglages du site et des demandes de contact ; création et mise à jour de contenu pour les administrateurs signés.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listPortfolioItems,
    createPortfolioItem,
    updatePortfolioItem,
    listTestimonials,
    createTestimonial,
    listContactMessages,
    getSiteSettings,
    updateSiteSettings,
  ],
});
