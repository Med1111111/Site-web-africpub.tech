import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import type { Database } from "@/integrations/supabase/types";

type SettingsUpdate = Database["public"]["Tables"]["site_settings"]["Update"];

export default defineTool({
  name: "update_site_settings",
  title: "Modifier les réglages du site",
  description:
    "Met à jour les réglages globaux du site Afric Pub (titre, description, accroche, appel à l'action, numéro WhatsApp). Réservé aux administrateurs.",
  inputSchema: {
    site_title: z.string().trim().optional(),
    site_description: z.string().trim().optional(),
    hero_badge: z.string().trim().optional(),
    cta_title: z.string().trim().optional(),
    cta_sub: z.string().trim().optional(),
    cta_label: z.string().trim().optional(),
    whatsapp_number: z.string().trim().optional().describe("Numéro WhatsApp au format international sans +, ex. 213540481810."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    }
    const patch = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined),
    ) as SettingsUpdate;
    if (Object.keys(patch).length === 0) {
      return { content: [{ type: "text", text: "Aucun champ à modifier." }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("site_settings")
      .update(patch)
      .eq("singleton", true)
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: "Réglages introuvables ou accès refusé." }], isError: true };
    }
    return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { settings: data } };
  },
});
