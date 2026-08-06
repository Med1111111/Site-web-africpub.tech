/**
 * Synchronisation CRM Brevo : chaque prospect (formulaire contact ou newsletter)
 * est créé/mis à jour comme contact Brevo. Best-effort — une panne Brevo ne doit
 * jamais faire échouer la soumission du formulaire (la ligne Supabase reste la
 * source de vérité).
 */

const BREVO_API_URL = "https://api.brevo.com/v3/contacts";

export type BrevoContactInput = {
  email: string;
  name?: string;
  phone?: string;
  service?: string;
  message?: string;
  source: "contact" | "newsletter";
};

function splitName(name: string | undefined): { firstName: string; lastName: string } {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

/** Envoie le prospect à Brevo. N'échoue jamais bruyamment : log seulement. */
export async function syncBrevoContact(input: BrevoContactInput): Promise<void> {
  const apiKey = process.env["BREVO_API_KEY"];
  if (!apiKey) return; // Intégration désactivée tant que la clé n'est pas configurée.

  const { firstName, lastName } = splitName(input.name);
  const listId = process.env["BREVO_LIST_ID"];

  const body: Record<string, unknown> = {
    email: input.email,
    updateEnabled: true,
    attributes: {
      ...(firstName ? { FIRSTNAME: firstName } : {}),
      ...(lastName ? { LASTNAME: lastName } : {}),
      ...(input.phone ? { SMS: input.phone } : {}),
      ...(input.service ? { SERVICE_DEMANDE: input.service } : {}),
      ...(input.message ? { DERNIER_MESSAGE: input.message.slice(0, 500) } : {}),
      SOURCE_SITE: input.source === "contact" ? "Formulaire contact" : "Newsletter",
    },
    ...(listId ? { listIds: [Number(listId)] } : {}),
  };

  try {
    const res = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok && res.status !== 400) {
      // 400 le plus souvent = contact déjà existant avec les mêmes attributs, sans danger.
      const text = await res.text().catch(() => "");
      console.error(`[Brevo] Échec synchronisation contact (${res.status}): ${text.slice(0, 300)}`);
    }
  } catch (err) {
    console.error(
      "[Brevo] Erreur réseau lors de la synchronisation :",
      err instanceof Error ? err.message : err,
    );
  }
}
