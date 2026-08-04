import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_testimonial",
  title: "Ajouter un témoignage",
  description: "Ajoute un témoignage client au site Afric Pub. Réservé aux administrateurs.",
  inputSchema: {
    quote: z.string().trim().describe("Texte du témoignage."),
    name: z.string().trim().describe("Nom ou initiales du client."),
    role: z.string().trim().optional().describe("Fonction et ville du client."),
    rating: z.number().int().optional().describe("Note de 1 à 5 (défaut 5)."),
    sort_order: z.number().int().optional(),
    published: z.boolean().optional().describe("Publier immédiatement (défaut true)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    }
    if (!input.quote || !input.name) {
      return { content: [{ type: "text", text: "La citation et le nom sont obligatoires." }], isError: true };
    }
    const rating = Math.min(Math.max(input.rating ?? 5, 1), 5);
    const { data, error } = await supabaseForUser(ctx)
      .from("testimonials")
      .insert({
        quote: input.quote,
        name: input.name,
        role: input.role ?? "",
        rating,
        sort_order: input.sort_order ?? 0,
        published: input.published ?? true,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data) }], structuredContent: { item: data } };
  },
});
