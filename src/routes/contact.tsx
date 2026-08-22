import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Phone, Mail, MapPin, Clock, ExternalLink, Paperclip, X, Loader2, Check, AlertTriangle, RotateCw } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { services } from "@/lib/site-data";
import { createLeadUploadUrl, submitContactMessage, subscribeNewsletter } from "@/lib/leads.functions";
import {
  ATTACHMENT_ACCEPT,
  ATTACHMENT_MAX_BYTES,
  describeUploadError,
  formatBytes,
  isAllowedAttachment,
  uploadWithProgress,
} from "@/lib/leads-upload";




export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact & devis gratuit — Afric Pub" },
      {
        name: "description",
        content:
          "Demandez votre devis gratuit pour une enseigne lumineuse, de la signalétique ou une impression grand format. Réponse sous 24h.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Contact — Afric Pub" },
      { property: "og:description", content: "Étude technique et devis gratuits sous 24 à 48h." },
      { property: "og:url", content: "https://premium-afric-vision.lovable.app/contact" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact — Afric Pub" },
      { name: "twitter:description", content: "Étude technique et devis gratuits sous 24 à 48h." },
    ],
    links: [{ rel: "canonical", href: "https://premium-afric-vision.lovable.app/contact" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "ContactPage",
              "@id": "https://premium-afric-vision.lovable.app/contact#webpage",
              url: "https://premium-afric-vision.lovable.app/contact",
              name: "Contact & devis gratuit — Afric Pub",
              description:
                "Demandez votre devis gratuit pour une enseigne lumineuse, de la signalétique ou une impression grand format. Réponse sous 24h.",
              inLanguage: "fr",
              isPartOf: { "@id": "https://premium-afric-vision.lovable.app/#website" },
              about: { "@id": "https://premium-afric-vision.lovable.app/#organization" },
              publisher: { "@id": "https://premium-afric-vision.lovable.app/#organization" },
            },
            {
              "@type": "BreadcrumbList",
              "@id": "https://premium-afric-vision.lovable.app/contact#breadcrumb",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Accueil", item: "https://premium-afric-vision.lovable.app/" },
                { "@type": "ListItem", position: 2, name: "Contact", item: "https://premium-afric-vision.lovable.app/contact" },
              ],
            },
          ],
        }),
      },
    ],
  }),

});

// Validation stricte côté client, sans dépendance externe (le build navigateur
// de la librairie de validation n'expose pas toujours les méthodes attendues).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateContact(data: Record<string, string>) {
  const errors: Record<string, string> = {};
  const name = data.name ?? "";
  const email = data.email ?? "";
  const phone = data.phone ?? "";
  const service = data.service ?? "";
  const message = data.message ?? "";
  const company = data.company ?? "";

  if (name.length < 2) errors.name = "Nom trop court";
  else if (name.length > 100) errors.name = "Nom trop long (100 caractères max.)";

  if (email.length > 255) errors.email = "Email trop long";
  else if (!EMAIL_RE.test(email)) errors.email = "Email invalide";

  if (phone.length > 30) errors.phone = "Téléphone trop long";
  if (service.length > 80) errors.service = "Service invalide";

  if (message.length < 10) errors.message = "Décrivez votre projet (10 caractères min.)";
  else if (message.length > 1500) errors.message = "Message trop long (1500 caractères max.)";

  if ((data.companyName ?? "").length > 120) errors.companyName = "Nom d'entreprise trop long (120 caractères max.)";

  if (company.length > 0) errors.company = "Champ invalide";

  return errors;
}



function ContactPage() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "uploading" | "sent" | "error" | "throttled">("idle");
  const [news, setNews] = useState<"idle" | "sending" | "sent" | "error" | "throttled">("idle");
  // Horodatage d'ouverture : un envoi en moins de 2,5 s est considéré comme automatisé.
  const [mountedAt] = useState(() => Date.now());
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadFailure, setUploadFailure] = useState<
    { message: string; hint: string; canRetry: boolean } | null
  >(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);


  const pickFile = (next: File | null) => {
    setUploadFailure(null);
    if (!next) {
      setFile(null);
      setFileError("");
      return;
    }
    if (!isAllowedAttachment(next.name)) {
      setFile(null);
      setFileError("Format non accepté. Formats autorisés : AI, EPS, SVG, PDF, JPG, PNG, WEBP, OBJ, SKP, DWG.");
      return;
    }
    if (next.size > ATTACHMENT_MAX_BYTES) {
      setFile(null);
      setFileError("Fichier trop lourd (max 10 Mo).");
      return;
    }
    setFileError("");
    setFile(next);
  };

  const clearFile = () => {
    setFile(null);
    setFileError("");
    setProgress(null);
    setUploadDone(false);
    setUploadFailure(null);
    if (fileInput.current) fileInput.current.value = "";
  };

  const cancelUpload = () => {
    abortRef.current?.abort();
  };

  const runSubmit = async (form: HTMLFormElement, opts?: { skipFile?: boolean }) => {
    const raw = Object.fromEntries(new FormData(form));
    const data = Object.fromEntries(
      Object.entries(raw).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]),
    ) as Record<string, string>;
    const parsed = { ...data, company: data.company ?? "" };
    const marketingConsent = form.querySelector<HTMLInputElement>("#marketingConsent")?.checked ?? false;
    const validationErrors = validateContact(parsed);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setUploadFailure(null);

    const withFile = file && !opts?.skipFile ? file : null;
    let attachmentPath = "";
    let attachmentName = "";
    try {
      if (withFile) {
        setState("uploading");
        setUploadDone(false);
        setFileError("");
        setProgress({ loaded: 0, total: withFile.size });
        const controller = new AbortController();
        abortRef.current = controller;
        const signed = await createLeadUploadUrl({
          data: { fileName: withFile.name, size: withFile.size },
        });
        await uploadWithProgress({
          file: withFile,
          path: signed.path,
          token: signed.token,
          signal: controller.signal,
          onProgress: (loaded, total) => setProgress({ loaded, total }),
        });
        abortRef.current = null;
        setUploadDone(true);
        attachmentPath = signed.path;
        attachmentName = withFile.name.slice(0, 200);
      }

      setState("sending");
      const res = await submitContactMessage({
        data: { ...parsed, marketingConsent, elapsedMs: Date.now() - mountedAt, attachmentPath, attachmentName },
      });
      if (!res.ok) {
        setState("throttled");
        return;
      }
      setState("sent");
      form.reset();
      clearFile();
    } catch (err) {
      abortRef.current = null;
      setProgress(null);
      setUploadDone(false);
      if (err instanceof DOMException && err.name === "AbortError") {
        setState("idle");
        setFileError("Envoi du fichier annulé. Vos informations sont conservées.");
        return;
      }
      if (withFile && !attachmentPath) {
        setState("idle");
        setUploadFailure(describeUploadError(err));
        return;
      }
      setState("error");
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    formRef.current = e.currentTarget;
    await runSubmit(e.currentTarget);
  };





  const onNewsletter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const email = String(fd.get("news") ?? "").trim();
    const company = String(fd.get("company_news") ?? "");
    if (!email) return;
    setNews("sending");
    try {
      const res = await subscribeNewsletter({ data: { email, company } });
      if (!res.ok) {
        setNews("throttled");
        return;
      }
      setNews("sent");
      form.reset();
    } catch {
      setNews("error");
    }
  };

  const field =
    "mt-2 w-full rounded-2xl glass-soft px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none";

  return (
    <div className="px-3 sm:px-6">
      <PageHeader
        eyebrow="Contact"
        title="Parlons de votre projet"
        sub="Étude technique et devis détaillé gratuits. Réponse sous 24 à 48h ouvrées."
      />

      <section className="mx-auto mt-14 grid max-w-7xl gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Reveal>
          <form onSubmit={onSubmit} noValidate className="rounded-3xl glass p-8">
            {state === "sent" && (
              <p role="status" className="mb-6 rounded-2xl bg-brand px-4 py-3 text-sm text-primary-foreground">
                Merci pour votre message. Nous vous répondrons dans les meilleurs délais.
              </p>
            )}
            {state === "throttled" && (
              <p role="alert" className="mb-6 rounded-2xl glass-soft px-4 py-3 text-sm text-destructive">
                Vous avez déjà envoyé plusieurs demandes récemment. Merci de patienter une heure, ou
                écrivez-nous sur{" "}
                <a href="https://wa.me/213540481810" target="_blank" rel="noreferrer noopener" className="underline">
                  WhatsApp
                </a>
                .
              </p>
            )}
            {state === "error" && (
              <div role="alert" className="mb-6 rounded-2xl glass-soft px-4 py-3 text-sm">
                <p className="flex items-start gap-2 font-medium text-destructive">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>L'enregistrement de votre demande a échoué.</span>
                </p>
                <p className="mt-1 pl-6 text-xs text-muted-foreground">
                  Vérifiez votre connexion Internet, puis réessayez — vos informations sont conservées.
                </p>
                <div className="mt-3 flex flex-wrap gap-2 pl-6">
                  <button
                    type="button"
                    onClick={() => formRef.current && runSubmit(formRef.current)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
                  >
                    <RotateCw className="size-3.5" aria-hidden="true" />
                    Réessayer
                  </button>
                  <a
                    href="https://wa.me/213540481810"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs text-muted-foreground underline transition-colors hover:text-foreground"
                  >
                    Nous écrire sur WhatsApp
                  </a>
                </div>
              </div>
            )}


            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-sm font-medium">Nom complet</label>
                <input id="name" name="name" required maxLength={100} className={field} placeholder="Votre nom" />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input id="email" name="email" type="email" required maxLength={255} className={field} placeholder="vous@entreprise.tech" />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium">Téléphone (optionnel)</label>
                <input id="phone" name="phone" type="tel" maxLength={30} className={field} placeholder="+213 …" />
              </div>
              <div>
                <label htmlFor="service" className="text-sm font-medium">Service souhaité</label>
                <select id="service" name="service" className={field}>
                  {services.map((s) => (
                    <option key={s.slug} value={s.title}>{s.title}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="companyName" className="text-sm font-medium">Entreprise (optionnel)</label>
                <input id="companyName" name="companyName" maxLength={120} className={field} placeholder="Nom de votre société" />
                {errors.companyName && <p className="mt-1 text-xs text-destructive">{errors.companyName}</p>}
              </div>
            </div>


            <div className="mt-5">
              <label htmlFor="message" className="text-sm font-medium">Votre projet</label>
              <textarea id="message" name="message" rows={5} required maxLength={1500} className={field} placeholder="Dimensions, lieu, délais…" />
              {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message}</p>}
            </div>

            <div className="mt-5">
              <label htmlFor="attachment" className="text-sm font-medium">
                Joindre votre logo / photo de la façade{" "}
                <span className="font-normal text-muted-foreground">(vectoriel, photo ou plan 3D)</span>
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  pickFile(e.dataTransfer.files?.[0] ?? null);
                }}
                className={`mt-2 rounded-2xl glass-soft px-4 py-4 transition-shadow focus-within:ring-2 focus-within:ring-brand/60 ${
                  dragging ? "ring-2 ring-brand/60" : ""
                }`}
              >
                <input
                  ref={fileInput}
                  id="attachment"
                  type="file"
                  accept={ATTACHMENT_ACCEPT}
                  className="sr-only"
                  onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                />
                {file ? (
                  <div className="grid gap-2">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <Paperclip className="size-4 shrink-0 text-brand" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {progress && state === "uploading"
                          ? `${formatBytes(progress.loaded)} / ${formatBytes(progress.total)}`
                          : formatBytes(file.size)}
                      </span>
                      {state === "uploading" ? (
                        <button
                          type="button"
                          onClick={cancelUpload}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <X className="size-3.5" aria-hidden="true" />
                          Annuler
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={clearFile}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <X className="size-3.5" aria-hidden="true" />
                          Retirer
                        </button>
                      )}
                    </div>

                    {(state === "uploading" || uploadDone) && progress && (
                      <div>
                        <div
                          role="progressbar"
                          aria-label="Progression de l'envoi du fichier"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={
                            uploadDone
                              ? 100
                              : Math.min(100, Math.round((progress.loaded / Math.max(1, progress.total)) * 100))
                          }
                          className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10"
                        >
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand to-orange-500 transition-[width] duration-200"
                            style={{
                              width: `${
                                uploadDone
                                  ? 100
                                  : Math.min(100, Math.round((progress.loaded / Math.max(1, progress.total)) * 100))
                              }%`,
                            }}
                          />
                        </div>
                        <p role="status" aria-live="polite" className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                          {uploadDone ? (
                            <>
                              <Check className="size-3.5 text-brand" aria-hidden="true" />
                              Fichier envoyé
                            </>
                          ) : (
                            <>
                              <Loader2 className="size-3.5 animate-spin text-brand" aria-hidden="true" />
                              Envoi du fichier…{" "}
                              {Math.min(100, Math.round((progress.loaded / Math.max(1, progress.total)) * 100))} %
                            </>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (

                  <label htmlFor="attachment" className="flex cursor-pointer items-center gap-3 text-sm text-muted-foreground">
                    <Paperclip className="size-4 shrink-0 text-brand" aria-hidden="true" />
                    <span>
                      Cliquez ou déposez un fichier ici — optionnel
                      <span className="block text-xs text-muted-foreground/80">
                        AI, EPS, SVG, PDF, JPG, PNG, WEBP, OBJ, SKP, DWG — 10 Mo max.
                      </span>
                    </span>
                  </label>
                )}
              </div>
              {fileError && <p role="alert" className="mt-1 text-xs text-destructive">{fileError}</p>}
              {uploadFailure && (
                <div
                  role="alert"
                  className="mt-3 rounded-2xl glass-soft px-4 py-3 text-sm"
                >
                  <p className="flex items-start gap-2 font-medium text-destructive">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>{uploadFailure.message}</span>
                  </p>
                  <p className="mt-1 pl-6 text-xs text-muted-foreground">{uploadFailure.hint}</p>
                  <div className="mt-3 flex flex-wrap gap-2 pl-6">
                    {uploadFailure.canRetry && (
                      <button
                        type="button"
                        onClick={() => formRef.current && runSubmit(formRef.current)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
                      >
                        <RotateCw className="size-3.5" aria-hidden="true" />
                        Réessayer l'envoi
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => formRef.current && runSubmit(formRef.current, { skipFile: true })}
                      className="inline-flex items-center gap-1.5 rounded-full glass-soft px-4 py-2 text-xs font-medium text-foreground transition-colors hover:text-brand"
                    >
                      Envoyer la demande sans le fichier
                    </button>
                    <a
                      href="https://wa.me/213540481810"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs text-muted-foreground underline transition-colors hover:text-foreground"
                    >
                      Nous l'envoyer par WhatsApp
                    </a>
                  </div>
                </div>
              )}

            </div>

            {/* Honeypot anti-spam, masqué aux utilisateurs et aux lecteurs d'écran */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

            <button
              type="submit"
              disabled={state === "sending" || state === "uploading"}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 sm:w-auto"
            >
              {(state === "uploading" || state === "sending") && (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              )}
              {state === "uploading"
                ? `Envoi du fichier… ${
                    progress ? Math.min(100, Math.round((progress.loaded / Math.max(1, progress.total)) * 100)) : 0
                  } %`
                : state === "sending"
                  ? file
                    ? "Enregistrement de la demande…"
                    : "Envoi en cours…"
                  : "Envoyer la demande"}
            </button>


          </form>
        </Reveal>

        <Reveal delay={100}>
          <div className="grid h-full content-start gap-4">
            <div className="rounded-3xl glass p-7">
              <h2 className="text-lg font-semibold">Coordonnées</h2>
              <ul className="mt-4 grid gap-4 text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <span>
                    Bouismail, Tipaza, Algérie
                    <span className="block text-xs text-muted-foreground/80">(Pose et intervention sur 58 Wilayas)</span>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <span>Dimanche - Jeudi : 08h30 - 17h00</span>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <span className="grid gap-1">
                    <a href="tel:+213540481810" className="hover:text-foreground">+213 540 48 18 10</a>
                    <a href="tel:+213559119888" className="hover:text-foreground">+213 559 11 98 88</a>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden="true" />
                  <a href="mailto:contact@africpub.tech" className="hover:text-foreground">contact@africpub.tech</a>
                </li>
              </ul>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Bouismail%2C+Tipaza%2C+Alg%C3%A9rie"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Voir sur Google Maps
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            </div>
            <div className="rounded-3xl glass p-7">
              <h2 className="text-lg font-semibold">Newsletter</h2>
              <p className="mt-2 text-sm text-muted-foreground">Nos réalisations et conseils, une fois par mois.</p>
              <form onSubmit={onNewsletter} className="mt-4 grid gap-2">
                <label htmlFor="news" className="sr-only">Votre email</label>
                <input id="news" name="news" type="email" required maxLength={255} className={field} placeholder="vous@entreprise.dz" />
                {/* Honeypot anti-spam */}
                <input type="text" name="company_news" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                <button disabled={news === "sending"} className="rounded-full glass-soft px-5 py-3 text-sm font-semibold disabled:opacity-60">
                  {news === "sending" ? "Inscription…" : "S'inscrire"}
                </button>
                {news === "sent" && (
                  <p role="status" className="text-xs text-muted-foreground">Merci, votre inscription est enregistrée.</p>
                )}
                {news === "throttled" && (
                  <p role="alert" className="text-xs text-destructive">Trop de tentatives, réessayez dans une heure.</p>
                )}
                {news === "error" && (
                  <p role="alert" className="text-xs text-destructive">Inscription impossible pour le moment.</p>
                )}
              </form>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
