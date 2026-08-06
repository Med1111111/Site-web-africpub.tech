import { useQuery } from "@tanstack/react-query";
import { getPublicSiteSettings } from "@/lib/content.functions";

const FALLBACK = "213540481810";

/** Bouton WhatsApp flottant en verre dépoli, lien direct vers la conversation. */
export default function WhatsAppButton() {
  const { data } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => getPublicSiteSettings(),
  });
  const number = (data?.whatsapp_number || FALLBACK).replace(/\D/g, "");
  const href = `https://wa.me/${number}?text=${encodeURIComponent("Bonjour Afric Pub, je souhaite un devis.")}`;

  return (
    <aside aria-label="Contact rapide">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discuter sur WhatsApp"
        className="fixed bottom-24 right-4 z-50 grid size-14 place-items-center rounded-full glass shadow-[var(--shadow-glow)] transition-transform hover:scale-110 sm:bottom-6"
      >
        <svg viewBox="0 0 32 32" className="size-7 fill-[#25D366]" aria-hidden="true">
          <path d="M16.04 3C9.4 3 4 8.4 4 15.04c0 2.13.56 4.2 1.62 6.03L4 29l8.13-1.57a12 12 0 0 0 3.9.65h.01C22.68 28.08 28.08 22.68 28.08 16.04 28.08 8.4 22.68 3 16.04 3Zm0 22.06h-.01c-1.2 0-2.38-.24-3.48-.72l-.25-.11-4.82.93.96-4.7-.16-.26a9.95 9.95 0 0 1-1.53-5.3c0-5.52 4.5-10.02 10.03-10.02 5.52 0 10.02 4.5 10.02 10.02 0 5.53-4.5 10.03-10.02 10.16Zm5.5-7.5c-.3-.15-1.78-.88-2.06-.98-.28-.1-.48-.15-.68.15s-.78.98-.96 1.18c-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51h-.58c-.2 0-.53.08-.8.38-.28.3-1.05 1.03-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.71.63.72.23 1.37.2 1.89.12.58-.09 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35Z" />
        </svg>
      </a>
    </aside>
  );
}
