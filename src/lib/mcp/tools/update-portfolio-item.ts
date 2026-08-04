import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";
import type { Database } from "@/integrations/supabase/types";

type PortfolioUpdate = Database["public"]["Tables"]["portfolio_items"]["Update"];

export default defineTool({
  name: "update_portfolio_item",
  title: "Modifier une réalisation",
  description:
    "Met à jour une réalisation existante du portfolio (titre, catégorie, description, visuel, publication). Réservé aux administrateurs.",
  inputSchema: {
    id: z.string().trim().describe("Identifiant UUID de la réalisation."),
    title: z.string().trim().optional(),
    category: z.string().trim().optional(),
    city: z.string().trim().optional(),
    description: z.string().trim().optional(),
    image_url: z.string().trim().optional(),
    sort_order: z.number().int().optional(),
    published: z.boolean().optional().describe("Publier ou dépublier la réalisation."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id, ...fields }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    }
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined),
    ) as PortfolioUpdate;
    if (!id || Object.keys(patch).length === 0) {
      return { content: [{ type: "text", text: "Fournir un id et au moins un champ à modifier." }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("portfolio_items")
      .update(patch)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) {
      return { content: [{ type: "text", text: "Réalisation introuvable ou accès refusé." }], isError: true };
    }
    return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { item: data } };
  },
});
