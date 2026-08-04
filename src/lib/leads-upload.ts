/** Constantes partagées client/serveur pour la pièce jointe des demandes de devis. */

export const ATTACHMENT_BUCKET = "lead-attachments";

export const ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024; // 10 Mo

export const ATTACHMENT_EXTENSIONS = [
  "ai",
  "eps",
  "svg",
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "obj",
  "skp",
  "dwg",
] as const;

/** Liste pour l'attribut `accept` de l'input fichier. */
export const ATTACHMENT_ACCEPT = ATTACHMENT_EXTENSIONS.map((e) => `.${e}`).join(",");

export function attachmentExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? (parts.pop() as string) : "";
}

export function isAllowedAttachment(fileName: string): boolean {
  return (ATTACHMENT_EXTENSIONS as readonly string[]).includes(attachmentExtension(fileName));
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
