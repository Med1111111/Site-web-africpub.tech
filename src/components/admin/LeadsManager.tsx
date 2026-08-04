import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CONTACT_STATUSES,
  deleteContactMessage,
  getLeadAttachmentUrl,
  listContactMessages,
  listNewsletterSubscribers,
  updateContactMessageStatus,
} from "@/lib/leads.functions";


const btnGhost = "min-h-11 rounded-full glass-soft px-4 text-sm font-medium";

const waNumber = "213540481810";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export default function LeadsManager() {
  const qc = useQueryClient();
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

  const remove = useMutation({
    mutationFn: (id: string) => deleteContactMessage({ data: { id } }),
    onSuccess: () => {
      toast.success("Demande supprimée");
      qc.invalidateQueries({ queryKey: ["admin-leads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const emails = (subs.data ?? []).map((s) => s.email).join(", ");

  return (
    <div className="grid gap-6">
      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">Demandes de devis</h2>
        {list.isLoading && <p className="text-sm text-muted-foreground">Chargement…</p>}
        {list.data?.length === 0 && (
          <p className="rounded-3xl glass p-6 text-sm text-muted-foreground">
            Aucune demande pour le moment. Les soumissions du formulaire de contact apparaîtront ici.
          </p>
        )}
        {list.data?.map((m) => (
          <article key={m.id} className="rounded-3xl glass p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">
                  {m.name}
                  {m.service ? <span className="text-muted-foreground"> — {m.service}</span> : null}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(m.created_at)}</p>
              </div>
              <span className="rounded-full glass-soft px-3 py-1 text-xs">{m.status}</span>
            </div>

            <p className="mt-4 whitespace-pre-line text-sm text-muted-foreground">{m.message}</p>

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
              <button
                type="button"
                className={btnGhost}
                onClick={() => {
                  if (confirm("Supprimer cette demande ?")) remove.mutate(m.id);
                }}
              >
                Supprimer
              </button>
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
