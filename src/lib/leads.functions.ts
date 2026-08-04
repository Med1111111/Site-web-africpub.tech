import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { leadsPublicClient } from "./leads.server";
import type { Database } from "@/integrations/supabase/types";

export type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"];
export type NewsletterSubscriber = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];

export const CONTACT_STATUSES = ["nouveau", "en cours", "traité", "archivé"] as const;

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
        company: z.string().max(0).optional().default(""), // honeypot
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    if (data.company) return { ok: true as const };
    const { error } = await leadsPublicClient().from("contact_messages").insert({
      name: data.name,
      email: data.email,
      phone: data.phone,
      service: data.service,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ email: z.string().trim().email().max(255) }).parse(input))
  .handler(async ({ data }) => {
    const { error } = await leadsPublicClient()
      .from("newsletter_subscribers")
      .insert({ email: data.email.toLowerCase() });
    // 23505 = déjà inscrit : succès silencieux
    if (error && error.code !== "23505") throw new Error(error.message);
    return { ok: true as const };
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
