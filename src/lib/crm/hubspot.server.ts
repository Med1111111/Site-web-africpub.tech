/**
 * Synchronisation CRM HubSpot (optionnelle). No-op tant que HUBSPOT_API_KEY
 * n'est pas configurée — voir .env.example. Best-effort comme Brevo : une
 * panne HubSpot ne doit jamais faire échouer la soumission du formulaire.
 *
 * Jeton attendu : "Clé API privée" HubSpot (format pat-na1-...), avec le
 * scope `crm.objects.contacts.write`.
 */

const HUBSPOT_CONTACTS_URL = "https://api.hubapi.com/crm/v3/objects/contacts";

export type HubspotContactInput = {
  email: string;
  name?: string;
  phone?: string;
  service?: string;
  message?: string;
};

function splitName(name: string | undefined): { firstname: string; lastname: string } {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstname: "", lastname: "" };
  if (parts.length === 1) return { firstname: parts[0], lastname: "" };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

export async function syncHubspotContact(input: HubspotContactInput): Promise<void> {
  const apiKey = process.env["HUBSPOT_API_KEY"];
  if (!apiKey) return; // Intégration désactivée tant que la clé n'est pas configurée.

  const { firstname, lastname } = splitName(input.name);
  const properties: Record<string, string> = {
    email: input.email,
    ...(firstname ? { firstname } : {}),
    ...(lastname ? { lastname } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
    ...(input.message ? { message: input.message.slice(0, 2000) } : {}),
    ...(input.service ? { service_demande: input.service } : {}),
  };

  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${apiKey}`,
  };

  try {
    const createRes = await fetch(HUBSPOT_CONTACTS_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ properties }),
    });
    if (createRes.ok) return;

    // 409 = contact déjà existant pour cet email : on met à jour à la place.
    if (createRes.status === 409) {
      const updateRes = await fetch(
        `${HUBSPOT_CONTACTS_URL}/${encodeURIComponent(input.email)}?idProperty=email`,
        { method: "PATCH", headers, body: JSON.stringify({ properties }) },
      );
      if (!updateRes.ok) {
        const text = await updateRes.text().catch(() => "");
        console.error(
          `[HubSpot] Échec mise à jour contact (${updateRes.status}): ${text.slice(0, 300)}`,
        );
      }
      return;
    }

    const text = await createRes.text().catch(() => "");
    console.error(`[HubSpot] Échec création contact (${createRes.status}): ${text.slice(0, 300)}`);
  } catch (err) {
    console.error(
      "[HubSpot] Erreur réseau lors de la synchronisation :",
      err instanceof Error ? err.message : err,
    );
  }
}
