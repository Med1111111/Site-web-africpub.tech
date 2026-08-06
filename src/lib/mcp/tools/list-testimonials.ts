import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_testimonials",
  title: "Lister les témoignages",
  description: "Liste les témoignages clients d'Afric Pub (citation, auteur, note, publication).",
  inputSchema: {
    published_only: z.boolean().optional().describe("Ne renvoyer que les témoignages publiés."),
    limit: z
      .number()
      .int()
      .optional()
      .describe("Nombre maximum de résultats (défaut 50, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ published_only, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    }
    const max = Math.min(Math.max(limit ?? 50, 1), 100);
    let query = supabaseForUser(ctx)
      .from("testimonials")
      .select("id, quote, name, role, rating, sort_order, published, updated_at")
      .order("sort_order", { ascending: true })
      .limit(max);
    if (published_only) query = query.eq("published", true);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
