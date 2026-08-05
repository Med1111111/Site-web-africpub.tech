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

export type UploadErrorCode =
  | "offline"
  | "network"
  | "timeout"
  | "too-large"
  | "rejected"
  | "server"
  | "unknown";

/** Erreur d'upload typée, pour produire un message clair et actionnable. */
export class UploadError extends Error {
  code: UploadErrorCode;
  status?: number;
  constructor(code: UploadErrorCode, message: string, status?: number) {
    super(message);
    this.name = "UploadError";
    this.code = code;
    this.status = status;
  }
}

/** Message lisible + action conseillée pour l'utilisateur. */
export function describeUploadError(err: unknown): { message: string; hint: string; canRetry: boolean } {
  const code: UploadErrorCode =
    err instanceof UploadError
      ? err.code
      : typeof navigator !== "undefined" && navigator.onLine === false
        ? "offline"
        : "unknown";

  switch (code) {
    case "offline":
      return {
        message: "Connexion Internet perdue pendant l'envoi du fichier.",
        hint: "Vérifiez votre connexion (Wi-Fi ou données mobiles), puis cliquez sur « Réessayer l'envoi ».",
        canRetry: true,
      };
    case "network":
      return {
        message: "L'envoi du fichier a été interrompu.",
        hint: "Réseau instable ou trop lent : rapprochez-vous du Wi-Fi ou réessayez dans quelques instants.",
        canRetry: true,
      };
    case "timeout":
      return {
        message: "L'envoi du fichier a pris trop de temps.",
        hint: "Votre connexion est lente : réessayez, ou envoyez la demande sans le fichier et transmettez-le ensuite par WhatsApp.",
        canRetry: true,
      };
    case "too-large":
      return {
        message: "Le fichier a été refusé car il est trop volumineux.",
        hint: "Compressez-le ou choisissez un fichier de moins de 10 Mo, puis réessayez.",
        canRetry: false,
      };
    case "rejected":
      return {
        message: "Le fichier a été refusé par le serveur.",
        hint: "Le lien d'envoi a peut-être expiré : retirez le fichier, resélectionnez-le puis réessayez.",
        canRetry: true,
      };
    case "server":
      return {
        message: "Le service de stockage est momentanément indisponible.",
        hint: "Réessayez dans une minute, ou envoyez la demande sans le fichier — nous vous recontacterons pour le récupérer.",
        canRetry: true,
      };
    default:
      return {
        message: "L'envoi du fichier a échoué.",
        hint: "Vérifiez votre connexion puis réessayez. Vous pouvez aussi envoyer la demande sans le fichier.",
        canRetry: true,
      };
  }
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

