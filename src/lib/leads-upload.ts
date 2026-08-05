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

/**
 * Upload vers une URL signée avec progression réelle (côté navigateur uniquement).
 * `uploadToSignedUrl` du SDK n'expose pas d'événement de progression : on passe
 * donc par XMLHttpRequest, qui permet aussi l'annulation.
 */
export function uploadWithProgress(options: {
  file: File;
  path: string;
  token: string;
  onProgress?: (loaded: number, total: number) => void;
  signal?: AbortSignal;
}): Promise<void> {
  const { file, path, token, onProgress, signal } = options;
  const baseUrl = import.meta.env["VITE_SUPABASE_URL"] as string;
  const url = `${baseUrl}/storage/v1/object/upload/sign/${ATTACHMENT_BUCKET}/${path}?token=${encodeURIComponent(token)}`;

  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Upload annulé", "AbortError"));
      return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("x-upsert", "false");
    if (file.type) xhr.setRequestHeader("content-type", file.type);

    const onAbort = () => xhr.abort();
    signal?.addEventListener("abort", onAbort);
    const cleanup = () => signal?.removeEventListener("abort", onAbort);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded, e.total);
    };
    xhr.onload = () => {
      cleanup();
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(file.size, file.size);
        resolve();
      } else {
        reject(new Error(`Upload échoué (${xhr.status})`));
      }
    };
    xhr.onerror = () => {
      cleanup();
      reject(new Error("Upload échoué"));
    };
    xhr.onabort = () => {
      cleanup();
      reject(new DOMException("Upload annulé", "AbortError"));
    };
    xhr.send(file);
  });
}

