import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import type { Database } from "@/integrations/supabase/types";

/** Client publishable côté serveur : insertions publiques (formulaire, newsletter). */
export function leadsPublicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/* ------------------------------------------------------------------ */
/* Anti-spam                                                           */
/* ------------------------------------------------------------------ */

/**
 * Empreinte anonyme du visiteur : hachage salé de l'IP + user-agent.
 * Aucune IP en clair n'est stockée en base.
 */
export function visitorFingerprint(): { fingerprint: string; userAgent: string } {
  const ip = getRequestIP({ xForwardedFor: true }) ?? "";
  const userAgent = getRequestHeader("user-agent") ?? "";
  const salt = process.env["SUPABASE_URL"] ?? "africpub";
  const fingerprint = createHash("sha256").update(`${salt}|${ip}|${userAgent}`).digest("hex");
  return { fingerprint, userAgent };
}

/**
 * Enregistre une tentative et indique si elle est autorisée.
 * Le comptage est fait en base (fonction `register_lead_attempt`), donc partagé
 * entre toutes les instances serveur.
 */
export async function allowLeadAttempt(
  fingerprint: string,
  kind: "contact" | "newsletter",
  maxAttempts: number,
  windowSeconds: number,
): Promise<boolean> {
  // Le compteur est une fonction SECURITY DEFINER privée : seul le service role
  // (côté serveur) peut l'exécuter, elle n'est pas exposée à l'API publique.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("register_lead_attempt", {
    _fingerprint: fingerprint,
    _kind: kind,
    _max_attempts: maxAttempts,
    _window_seconds: windowSeconds,
  });
  // En cas d'indisponibilité du compteur, on laisse passer (les autres filtres restent actifs).
  if (error) return true;
  return data !== false;
}

const SPAM_KEYWORDS = [
  "seo service",
  "backlink",
  "casino",
  "viagra",
  "cialis",
  "porn",
  "crypto investment",
  "bitcoin profit",
  "loan offer",
  "work from home",
  "click here now",
  "telegram.me",
  "bit.ly",
];

/** Heuristiques bot / spam sur le contenu soumis. */
export function looksLikeSpam(input: {
  name: string;
  email: string;
  message: string;
  userAgent: string;
  elapsedMs: number;
}): boolean {
  const { name, email, message, userAgent, elapsedMs } = input;
  const text = `${name} ${message}`.toLowerCase();

  // Formulaire rempli trop vite (< 2,5 s) : comportement automatisé.
  if (elapsedMs >= 0 && elapsedMs < 2500) return true;

  // User-agent absent ou signature d'outil automatisé.
  const ua = userAgent.toLowerCase();
  if (!ua) return true;
  if (/(curl|wget|python-requests|httpclient|scrapy|headlesschrome|bot\b|spider)/.test(ua))
    return true;

  // Trop de liens dans le message.
  const links = message.match(/https?:\/\/|www\.|\[url/gi) ?? [];
  if (links.length > 2) return true;

  // Balises HTML/BBCode.
  if (/<a\s|<script|\[\/?url\]/i.test(message)) return true;

  // Mots-clés de spam connus.
  if (SPAM_KEYWORDS.some((k) => text.includes(k))) return true;

  // Le nom contient une URL ou une adresse e-mail.
  if (/https?:\/\/|www\.|@/.test(name)) return true;

  // Alphabets non attendus (cyrillique / CJK) sur un site FR/AR/EN.
  if (/[\u0400-\u04FF\u4E00-\u9FFF]/.test(message)) return true;

  // Message répétitif (un même caractère répété 15 fois ou plus).
  if (/(.)\1{14,}/.test(message)) return true;

  // Adresses jetables les plus courantes.
  if (/@(mailinator|yopmail|guerrillamail|10minutemail|tempmail|trashmail)\./i.test(email))
    return true;

  return false;
}
