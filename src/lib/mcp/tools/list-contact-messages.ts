import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_contact_messages",
  title: "Lister les demandes de contact",
  description:
    "Liste les demandes de devis et messages reçus via le formulaire de contact. Réservé aux administrateurs.",
  inputSchema: {
    status: z.string().trim().optional().describe("Filtrer par statut (nouveau, traité…)."),
    limit: z
      .number()
      .int()
      .optional()
      .describe("Nombre maximum de résultats (défaut 25, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Non authentifié." }], isError: true };
    }
    const max = Math.min(Math.max(limit ?? 25, 1), 100);
    let query = supabaseForUser(ctx)
      .from("contact_messages")
      .select("id, name, email, phone, service, message, status, created_at")
      .order("created_at", { ascending: false })
      .limit(max);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
