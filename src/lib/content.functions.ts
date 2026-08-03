import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

export type PortfolioItem = Database["public"]["Tables"]["portfolio_items"]["Row"];
export type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];


function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/* ---------- Lectures publiques (site vitrine) ---------- */

export const listPublicPortfolio = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("portfolio_items")
    .select("id, title, category, city, description, image_url, sort_order, published, created_at, updated_at")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data as PortfolioItem[];
});

export const listPublicTestimonials = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("testimonials")
    .select("id, quote, name, role, rating, sort_order, published, created_at, updated_at")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Testimonial[];
});

/* ---------- Espace admin ---------- */

export const getMyAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error) throw new Error(error.message);
    return { isAdmin: Boolean(data), userId: context.userId };
  });

export const listAllPortfolio = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("portfolio_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  });

export const listAllTestimonials = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data;
  });

const portfolioInput = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2).max(120),
  category: z.string().min(2).max(60),
  city: z.string().max(60).default(""),
  description: z.string().max(600).default(""),
  image_url: z.string().max(500).default(""),
  sort_order: z.number().int().min(0).max(999).default(0),
  published: z.boolean().default(true),
});

const testimonialInput = z.object({
  id: z.string().uuid().optional(),
  quote: z.string().min(5).max(600),
  name: z.string().min(2).max(120),
  role: z.string().max(120).default(""),
  rating: z.number().int().min(1).max(5).default(5),
  sort_order: z.number().int().min(0).max(999).default(0),
  published: z.boolean().default(true),
});

export const savePortfolioItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => portfolioInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...values } = data;
    const query = id
      ? context.supabase.from("portfolio_items").update(values).eq("id", id).select().single()
      : context.supabase.from("portfolio_items").insert(values).select().single();
    const { data: row, error } = await query;
    if (error) throw new Error(error.message);
    return row;
  });

export const deletePortfolioItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("portfolio_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => testimonialInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...values } = data;
    const query = id
      ? context.supabase.from("testimonials").update(values).eq("id", id).select().single()
      : context.supabase.from("testimonials").insert(values).select().single();
    const { data: row, error } = await query;
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteTestimonial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("testimonials").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------- Réglages globaux du site ---------- */

export const getPublicSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as SiteSettings | null;
});

const settingsInput = z.object({
  id: z.string().uuid(),
  site_title: z.string().max(120).default(""),
  site_description: z.string().max(400).default(""),
  hero_badge: z.string().max(160).default(""),
  cta_title: z.string().max(160).default(""),
  cta_sub: z.string().max(300).default(""),
  cta_label: z.string().max(60).default(""),
  whatsapp_number: z.string().max(20).default(""),
  stats: z
    .array(z.object({ value: z.string().max(20), label: z.string().max(60) }))
    .max(8)
    .default([]),
});

export const saveSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsInput.parse(input))
  .handler(async ({ data, context }) => {
    const { id, ...values } = data;
    const { data: row, error } = await context.supabase
      .from("site_settings")
      .update(values)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
