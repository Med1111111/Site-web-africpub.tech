import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_portfolio_items",
  title: "Lister les réalisations",
  description:
    "Liste les réalisations du portfolio Afric Pub (titre, catégorie, ville, description, image, publication).",
  inputSchema: {
    published_only: z.boolean().optional().describe("Ne renvoyer que les réalisations publiées."),
    category: z.string().optional().describe("Filtrer sur une catégorie exacte (Enseignes, Signalétique…)."),
    limit: z.number().int().optional().describe("Nombre maximum de résultats (défaut 50, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ published_only, category, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    }
    const max = Math.min(Math.max(limit ?? 50, 1), 100);
    let query = supabaseForUser(ctx)
      .from("portfolio_items")
      .select("id, title, category, city, description, image_url, sort_order, published, updated_at")
      .order("sort_order", { ascending: true })
      .limit(max);
    if (published_only) query = query.eq("published", true);
    if (category) query = query.eq("category", category);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
