import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_site_settings",
  title: "Lire les réglages du site",
  description:
    "Renvoie les réglages globaux du site Afric Pub : titre, description, accroche, textes d'appel à l'action, numéro WhatsApp et chiffres clés.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("site_settings")
      .select("id, site_title, site_description, hero_badge, cta_title, cta_sub, cta_label, whatsapp_number, stats, updated_at")
      .eq("singleton", true)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? {}) }],
      structuredContent: { settings: data ?? null },
    };
  },
});
