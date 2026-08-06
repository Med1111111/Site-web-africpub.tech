import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_portfolio_item",
  title: "Créer une réalisation",
  description:
    "Ajoute une réalisation au portfolio Afric Pub. Réservé aux administrateurs de l'application.",
  inputSchema: {
    title: z.string().trim().describe("Titre de la réalisation."),
    category: z
      .string()
      .trim()
      .optional()
      .describe("Catégorie (Enseignes, Signalétique, Véhicules, Grand format…)."),
    city: z.string().trim().optional().describe("Ville ou wilaya du chantier."),
    description: z.string().trim().optional().describe("Description courte du projet."),
    image_url: z.string().trim().optional().describe("URL absolue du visuel."),
    sort_order: z.number().int().optional().describe("Position d'affichage."),
    published: z.boolean().optional().describe("Publier immédiatement (défaut true)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    }
    if (!input.title) {
      return { content: [{ type: "text", text: "Le titre est obligatoire." }], isError: true };
    }
    const { data, error } = await supabaseForUser(ctx)
      .from("portfolio_items")
      .insert({
        title: input.title,
        category: input.category ?? "Enseignes",
        city: input.city ?? "",
        description: input.description ?? "",
        image_url: input.image_url ?? "",
        sort_order: input.sort_order ?? 0,
        published: input.published ?? true,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { item: data },
    };
  },
});
