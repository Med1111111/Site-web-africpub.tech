import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CONTACT_STATUSES,
  deleteContactMessage,
  getLeadAttachmentUrl,
  listContactMessages,
  listNewsletterSubscribers,
  updateContactMessageNotes,
  updateContactMessageStatus,
} from "@/lib/leads.functions";


const btnGhost = "min-h-11 rounded-full glass-soft px-4 text-sm font-medium";

const waNumber = "213540481810";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export default function LeadsManager() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"tous" | (typeof CONTACT_STATUSES)[number]>("tous");
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const list = useQuery({ queryKey: ["admin-leads"], queryFn: () => listContactMessages() });
  const subs = useQuery({ queryKey: ["admin-newsletter"], queryFn: () => listNewsletterSubscribers() });

  const setStatus = useMutation({
    mutationFn: (v: { id: string; status: (typeof CONTACT_STATUSES)[number] }) =>
      updateContactMessageStatus({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveNotes = useMutation({
    mutationFn: (v: { id: string; notes: string }) => updateContactMessageNotes({ data: v }),
    onSuccess: () => {
      toast.success("Notes enregistrées");
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteContactMessage({ data: { id } }),
    onSuccess: () => {
      toast.success("Demande supprimée");
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const emails = (subs.data ?? []).map((s) => s.email).join(", ");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (list.data ?? []).filter((m) => {
      if (statusFilter !== "tous" && m.status !== statusFilter) return false;
      if (dateFrom && new Date(m.created_at) < new Date(dateFrom)) return false;
      if (!q) return true;
      return [
        m.name,
        m.email,
        m.phone,
        m.service,
        m.message,
        m.company_name,
        m.city_country,
        m.source,
      ].some((v) => (v ?? "").toLowerCase().includes(q));
    });
  }, [list.data, search, statusFilter, dateFrom]);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl glass p-5">
            <p className="text-xs text-muted-foreground">Total des contacts</p>
            <p className="mt-1 text-2xl font-semibold">{list.data?.length ?? 0}</p>
          </div>
          <div className="rounded-3xl glass p-5">
            <p className="text-xs text-muted-foreground">Nouveaux contacts</p>
            <p className="mt-1 text-2xl font-semibold text-brand">
              {(list.data ?? []).filter((m) => m.status === "nouveau").length}
            </p>
          </div>
          <div className="rounded-3xl glass p-5">
            <p className="text-xs text-muted-foreground">Traités</p>
            <p className="mt-1 text-2xl font-semibold">
              {(list.data ?? []).filter((m) => m.status === "traité").length}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            Demandes de devis{" "}
            <span className="text-sm text-muted-foreground">({filtered.length})</span>
          </h2>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher (nom, entreprise, email, ville…)"
              aria-label="Rechercher une demande"
              className="min-h-11 w-full flex-1 rounded-2xl glass-soft px-4 text-sm outline-none focus:ring-2 focus:ring-brand/60 sm:w-64"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              aria-label="Filtrer par statut"
              className="min-h-11 rounded-2xl glass-soft px-3 text-sm outline-none focus:ring-2 focus:ring-brand/60"
            >
              <option value="tous">Tous les statuts</option>
              {CONTACT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              aria-label="Afficher les demandes à partir de cette date"
              className="min-h-11 rounded-2xl glass-soft px-3 text-sm outline-none focus:ring-2 focus:ring-brand/60"
            />
          </div>
        </div>
        {list.isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
        {!list.isLoading && filtered.length === 0 && (
          <p className="rounded-3xl glass p-6 text-sm text-muted-foreground">
            {list.data?.length
              ? "Aucune demande ne correspond à votre recherche."
              : "Aucune demande pour le moment. Les soumissions du formulaire de contact apparaîtront ici."}
          </p>
        )}
        {filtered.map((m) => (
          <article key={m.id} className="rounded-3xl glass p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">
                  {m.name}
                  {m.company_name ? <span className="text-muted-foreground"> · {m.company_name}</span> : null}
                  {m.service ? <span className="text-muted-foreground"> — {m.service}</span> : null}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(m.created_at)}
                  {m.city_country ? ` · ${m.city_country}` : ""}
                  {m.source ? ` · source : ${m.source}` : ""}
                  {m.marketing_consent ? " · Consent. marketing ✓" : " · Consent. marketing ✕"}
                </p>
              </div>
              <span className="rounded-full glass-soft px-3 py-1 text-xs">{m.status}</span>
            </div>

            <p
              className={`mt-4 whitespace-pre-line text-sm text-muted-foreground ${
                openId === m.id ? "" : "line-clamp-3"
              }`}
            >
              {m.message}
            </p>
            <button
              type="button"
              className="mt-2 text-xs underline text-muted-foreground"
              onClick={() => setOpenId(openId === m.id ? null : m.id)}
            >
              {openId === m.id ? "Réduire" : "Voir le détail"}
            </button>

            {openId === m.id && (
              <div className="mt-4">
                <label className="text-xs text-muted-foreground" htmlFor={`notes-${m.id}`}>
                  Notes internes (visibles uniquement par l'administration)
                </label>
                <textarea
                  id={`notes-${m.id}`}
                  defaultValue={m.admin_notes}
                  rows={3}
                  maxLength={4000}
                  onBlur={(e) => {
                    if (e.target.value !== m.admin_notes)
                      saveNotes.mutate({ id: m.id, notes: e.target.value });
                  }}
                  className="mt-2 w-full rounded-2xl glass-soft px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand/60"
                  placeholder="Suivi, budget estimé, prochaine relance…"
                />
              </div>
            )}


            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <a className={`${btnGhost} inline-flex items-center`} href={`mailto:${m.email}`}>
                {m.email}
              </a>
              {m.phone && (
                <>
                  <a className={`${btnGhost} inline-flex items-center`} href={`tel:${m.phone.replace(/\s/g, "")}`}>
                    {m.phone}
                  </a>
                  <a
                    className={`${btnGhost} inline-flex items-center`}
                    href={`https://wa.me/${m.phone.replace(/\D/g, "") || waNumber}`}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    WhatsApp
                  </a>
                </>
              )}
              {m.attachment_path && (
                <button
                  type="button"
                  className={btnGhost}
                  onClick={async () => {
                    try {
                      const { url } = await getLeadAttachmentUrl({ data: { id: m.id } });
                      window.open(url, "_blank", "noopener,noreferrer");
                    } catch (e) {
                      toast.error((e as Error).message);
                    }
                  }}
                >
                  Pièce jointe{m.attachment_name ? ` — ${m.attachment_name}` : ""}
                </button>
              )}
            </div>


            <div className="mt-4 flex flex-wrap items-center gap-2">
              <label className="text-xs text-muted-foreground" htmlFor={`status-${m.id}`}>
                Statut
              </label>
              <select
                id={`status-${m.id}`}
                className="min-h-11 rounded-2xl glass-soft px-3 text-sm outline-none focus:ring-2 focus:ring-brand/60"
                value={m.status}
                onChange={(e) =>
                  setStatus.mutate({ id: m.id, status: e.target.value as (typeof CONTACT_STATUSES)[number] })
                }
              >
                {CONTACT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {m.status === "nouveau" && (
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => setStatus.mutate({ id: m.id, status: "lu" })}
                >
                  Marquer comme lue
                </button>
              )}
              {m.status !== "traité" && (
                <button
                  type="button"
                  className={btnGhost}
                  onClick={() => setStatus.mutate({ id: m.id, status: "traité" })}
                >
                  Marquer comme traitée
                </button>
              )}
              {confirmId === m.id ? (
                <span className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    className={`${btnGhost} text-brand`}
                    disabled={remove.isPending}
                    onClick={() => {
                      setConfirmId(null);
                      remove.mutate(m.id);
                    }}
                  >
                    {remove.isPending ? "Suppression…" : "Confirmer la suppression"}
                  </button>
                  <button type="button" className={btnGhost} onClick={() => setConfirmId(null)}>
                    Annuler
                  </button>
                </span>
              ) : (
                <button type="button" className={btnGhost} onClick={() => setConfirmId(m.id)}>
                  Supprimer
                </button>
              )}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-3xl glass p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            Newsletter <span className="text-sm text-muted-foreground">({subs.data?.length ?? 0} inscrits)</span>
          </h2>
          {emails && (
            <button
              type="button"
              className={btnGhost}
              onClick={async () => {
                await navigator.clipboard.writeText(emails);
                toast.success("Emails copiés");
              }}
            >
              Copier les emails
            </button>
          )}
        </div>
        <ul className="mt-4 grid gap-1 text-sm text-muted-foreground">
          {subs.data?.map((s) => (
            <li key={s.id}>
              {s.email} <span className="text-xs">· {formatDate(s.created_at)}</span>
            </li>
          ))}
          {subs.data?.length === 0 && <li>Aucun inscrit pour le moment.</li>}
        </ul>
      </section>
    </div>
  );
}
