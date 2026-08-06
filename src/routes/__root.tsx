import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppProvider } from "@/lib/app-context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WebGLBackground from "@/components/WebGLBackground";
import { Toaster } from "@/components/ui/sonner";
import WhatsAppButton from "@/components/WhatsAppButton";
import { services } from "@/lib/site-data";
import { registerServiceWorker } from "@/lib/register-sw";

function NotFoundComponent() {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md rounded-3xl glass p-10 text-center">
        <h1 className="text-7xl font-bold text-gradient">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="max-w-md rounded-3xl glass p-10 text-center">
        <h1 className="text-xl font-semibold">Cette page n'a pas pu être chargée</h1>
        <p className="mt-2 text-sm text-muted-foreground">Réessayez ou revenez à l'accueil.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Réessayer
          </button>
          <a href="/" className="rounded-full glass-soft px-5 py-2.5 text-sm font-medium">
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0B0B0B" },
      { property: "og:site_name", content: "Afric Pub" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Afric Pub — Enseignes lumineuses & signalétique en Algérie" },
      {
        property: "og:title",
        content: "Afric Pub — Enseignes lumineuses & signalétique en Algérie",
      },
      {
        name: "twitter:title",
        content: "Afric Pub — Enseignes lumineuses & signalétique en Algérie",
      },
      {
        name: "description",
        content:
          "Agence de communication globale : enseignes lumineuses, signalétique, impression grand format, habillage de véhicules et branding partout en Algérie.",
      },
      {
        property: "og:description",
        content:
          "Agence de communication globale : enseignes lumineuses, signalétique, impression grand format, habillage de véhicules et branding partout en Algérie.",
      },
      {
        name: "twitter:description",
        content:
          "Agence de communication globale : enseignes lumineuses, signalétique, impression grand format, habillage de véhicules et branding partout en Algérie.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/01667926-8ecd-4d55-8c9b-7df71a2bfb92",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/01667926-8ecd-4d55-8c9b-7df71a2bfb92",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@500;600;700;800&family=Tajawal:wght@400;500;700&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://africpub.tech/#organization",
          name: "Afric Pub",
          url: "https://africpub.tech",
          logo: {
            "@type": "ImageObject",
            url: "https://africpub.tech/__l5e/assets-v1/0ccd4f80-e125-4c61-b5a8-374f0e84bde0/logo.png",
          },
          image:
            "https://africpub.tech/__l5e/assets-v1/0ccd4f80-e125-4c61-b5a8-374f0e84bde0/logo.png",
          description:
            "Agence de communication globale : enseignes lumineuses, signalétique, impression grand format et branding en Algérie.",
          sameAs: [
            "https://web.facebook.com/AFRICPUB",
            "https://www.instagram.com/afric_pub/",
            "https://www.youtube.com/channel/UCCyWZb1m1H8CQJhh7FgmHlw",
            "https://wa.me/213540481810",
          ],
          address: { "@type": "PostalAddress", addressCountry: "DZ", addressLocality: "Alger" },
          email: "contact@africpub.dz",
          telephone: "+213540481810",

          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer service",
              telephone: "+213540481810",
              email: "contact@africpub.dz",
              areaServed: "DZ",
              availableLanguage: ["fr", "ar", "en"],
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://africpub.tech/#website",
          url: "https://africpub.tech",
          name: "Afric Pub",
          alternateName: "Afric Pub Communication Globale",
          description:
            "Agence de communication globale : enseignes lumineuses, signalétique, impression grand format et branding en Algérie.",
          inLanguage: "fr",
          publisher: { "@id": "https://africpub.tech/#organization" },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://africpub.tech/recherche?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "@id": "https://africpub.tech/#localbusiness",
          name: "Afric Pub",
          alternateName: "Afric Pub Communication Globale",
          url: "https://africpub.tech",
          logo: "https://africpub.tech/__l5e/assets-v1/0ccd4f80-e125-4c61-b5a8-374f0e84bde0/logo.png",
          image:
            "https://africpub.tech/__l5e/assets-v1/0ccd4f80-e125-4c61-b5a8-374f0e84bde0/logo.png",
          description:
            "Agence de communication globale à Alger : enseignes lumineuses LED, habillage Alucobond 3D, signalétique, découpe CNC, impression petit et grand format, packaging et stands d'exposition.",
          parentOrganization: { "@id": "https://africpub.tech/#organization" },
          isPartOf: { "@id": "https://africpub.tech/#website" },
          telephone: "+213540481810",
          email: "contact@africpub.dz",
          priceRange: "$$",
          currenciesAccepted: "DZD",
          paymentAccepted: "Espèces, Virement bancaire, Chèque",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Alger",
            addressRegion: "Alger",
            addressCountry: "DZ",
          },
          areaServed: { "@type": "Country", name: "Algérie" },
          knowsLanguage: ["fr", "ar", "en"],
          sameAs: [
            "https://web.facebook.com/AFRICPUB",
            "https://www.instagram.com/afric_pub/",
            "https://www.youtube.com/channel/UCCyWZb1m1H8CQJhh7FgmHlw",
            "https://wa.me/213540481810",
          ],
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
              opens: "08:30",
              closes: "17:30",
            },
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: "Saturday",
              opens: "09:00",
              closes: "14:00",
            },
          ],
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Services Afric Pub",
            itemListElement: services.map((s) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                "@id": `https://africpub.tech/services#${s.slug}`,
                name: s.title,
                description: s.desc,
                serviceType: s.title,
                areaServed: { "@type": "Country", name: "Algérie" },
                provider: { "@id": "https://africpub.tech/#localbusiness" },
              },
            })),
          },
        }),
      },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <WebGLBackground />
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Aller au contenu
        </a>
        <Navbar />
        <main id="contenu" className="min-h-dvh">
          {/* Les routes enfants s'affichent ici. */}
          <Outlet />
        </main>
        <Footer />
        <WhatsAppButton />
        <Toaster position="top-center" />
      </AppProvider>
    </QueryClientProvider>
  );
}
