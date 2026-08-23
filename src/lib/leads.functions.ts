import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { allowLeadAttempt, leadsPublicClient, looksLikeSpam, visitorFingerprint } from "./leads.server";
import {
  ATTACHMENT_BUCKET,
  ATTACHMENT_EXTENSIONS,
  ATTACHMENT_MAX_BYTES,
  attachmentExtension,
} from "./leads-upload";
import type { Database } from "@/integrations/supabase/types";

export type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"];
export type NewsletterSubscriber = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];

export const CONTACT_STATUSES = [
  "nouveau",
  "lu",
  "en cours",
  "contacté",
  "qualifié",
  "gagné",
  "perdu",
  "traité",
  "archivé",
] as const;

export type LeadResult = { ok: true } | { ok: false; reason: "throttled" };

/* ---------- Pièce jointe : URL d'upload signée ---------- */

export const createLeadUploadUrl = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        fileName: z.string().trim().min(1).max(200),
        size: z.number().int().min(1).max(ATTACHMENT_MAX_BYTES),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const ext = attachmentExtension(data.fileName);
    if (!(ATTACHMENT_EXTENSIONS as readonly string[]).includes(ext)) {
      throw new Error("Format de fichier non accepté.");
    }

    const { fingerprint } = visitorFingerprint();
    const allowed = await allowLeadAttempt(fingerprint, "contact", 8, 3600);
    if (!allowed) throw new Error("Trop de tentatives, réessayez plus tard.");

    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from(ATTACHMENT_BUCKET)
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message ?? "Upload indisponible.");
    return { path, token: signed.token };
  });

export const getLeadAttachmentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    // La lecture passe par le client de l'utilisateur : seuls les admins voient les demandes (RLS).
    const { data: row, error } = await context.supabase
      .from("contact_messages")
      .select("attachment_path")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row?.attachment_path) throw new Error("Aucune pièce jointe.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error: signError } = await supabaseAdmin.storage
      .from(ATTACHMENT_BUCKET)
      .createSignedUrl(row.attachment_path, 3600);
    if (signError || !signed) throw new Error(signError?.message ?? "Lien indisponible.");
    return { url: signed.signedUrl };
  });


/* ---------- Soumissions publiques ---------- */

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        name: z.string().trim().min(2).max(100),
        email: z.string().trim().email().max(255),
        phone: z.string().trim().max(30).optional().default(""),
        service: z.string().trim().max(80).optional().default(""),
        message: z.string().trim().min(10).max(1500),
        companyName: z.string().trim().max(120).optional().default(""),
        cityCountry: z.string().trim().max(120).optional().default(""),
        source: z.string().trim().max(80).optional().default("site-web"),
        marketingConsent: z.boolean().optional().default(false),
        company: z.string().max(0).optional().default(""), // honeypot
        elapsedMs: z.number().int().min(0).max(86_400_000).optional().default(-1),
        attachmentPath: z
          .string()
          .trim()
          .max(200)
          .regex(/^$|^\d{4}-\d{2}-\d{2}\/[a-f0-9-]{36}\.[a-z0-9]{2,5}$/i)
          .optional()
          .default(""),
        attachmentName: z.string().trim().max(200).optional().default(""),
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<LeadResult> => {
    // 1. Honeypot : succès silencieux, rien n'est enregistré.
    if (data.company) return { ok: true };

    const { fingerprint, userAgent } = visitorFingerprint();

    // 2. Throttling : 3 demandes par heure et par visiteur.
    const allowed = await allowLeadAttempt(fingerprint, "contact", 3, 3600);
    if (!allowed) return { ok: false, reason: "throttled" };

    // 3. Heuristiques bot / contenu : succès silencieux, rien n'est enregistré.
    if (
      looksLikeSpam({
        name: data.name,
        email: data.email,
        message: data.message,
        userAgent,
        elapsedMs: data.elapsedMs,
      })
    ) {
      return { ok: true };
    }

    const { error } = await leadsPublicClient().from("contact_messages").insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: data.service,
      message: data.message,
      company_name: data.companyName,
      marketing_consent: data.marketingConsent,
      attachment_path: data.attachmentPath,
      attachment_name: data.attachmentName,
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        company: z.string().max(0).optional().default(""), // honeypot
      })
      .parse(input),
  )
  .handler(async ({ data }): Promise<LeadResult> => {
    if (data.company) return { ok: true };

    const { fingerprint, userAgent } = visitorFingerprint();

    // 5 inscriptions par heure et par visiteur maximum.
    const allowed = await allowLeadAttempt(fingerprint, "newsletter", 5, 3600);
    if (!allowed) return { ok: false, reason: "throttled" };

    if (
      looksLikeSpam({
        name: "",
        email: data.email,
        message: "",
        userAgent,
        elapsedMs: -1,
      })
    ) {
      return { ok: true };
    }

    const { error } = await leadsPublicClient()
      .from("newsletter_subscribers")
      .insert({ email: data.email.toLowerCase() });
    // 23505 = déjà inscrit : succès silencieux
    if (error && error.code !== "23505") throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Espace admin ---------- */

export const listContactMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as ContactMessage[];
  });

export const updateContactMessageStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), status: z.enum(CONTACT_STATUSES) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("contact_messages")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteContactMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("contact_messages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const listNewsletterSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data as NewsletterSubscriber[];
  });
