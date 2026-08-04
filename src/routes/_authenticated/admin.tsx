import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";
import {
  deletePortfolioItem,
  deleteTestimonial,
  getMyAdminStatus,
  listAllPortfolio,
  listAllTestimonials,
  getPublicSiteSettings,
  savePortfolioItem,
  saveSiteSettings,
  saveTestimonial,
  type PortfolioItem,
  type Testimonial,
} from "@/lib/content.functions";
import LeadsManager from "@/components/admin/LeadsManager";
import { listContactMessages } from "@/lib/leads.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Administration — Afric Pub" },
      { name: "description", content: "Tableau de bord d'administration : gestion du portfolio et des témoignages Afric Pub." },
      { property: "og:title", content: "Administration — Afric Pub" },
      { property: "og:description", content: "Gestion du contenu du site Afric Pub." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const field = "min-h-11 w-full rounded-2xl glass-soft px-4 text-sm outline-none focus:ring-2 focus:ring-brand/60";
const btn = "min-h-11 rounded-full bg-brand px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60";
const btnGhost = "min-h-11 rounded-full glass-soft px-4 text-sm font-medium";

type PortfolioDraft = Omit<PortfolioItem, "created_at" | "updated_at" | "id"> & { id?: string };
type TestimonialDraft = Omit<Testimonial, "created_at" | "updated_at" | "id"> & { id?: string };

const emptyPortfolio: PortfolioDraft = {
  title: "",
  category: "Enseignes",
  city: "",
  description: "",
  image_url: "",
  sort_order: 0,
  published: true,
};

const emptyTestimonial: TestimonialDraft = {
  quote: "",
  name: "",
  role: "",
  rating: 5,
  sort_order: 0,
  published: true,
};

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"leads" | "portfolio" | "testimonials" | "settings">("leads");

  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => getMyAdminStatus() });
  const leads = useQuery({
    queryKey: ["admin-leads"],
    queryFn: () => listContactMessages(),
    enabled: Boolean(status.data?.isAdmin),
  });
  const newLeads = (leads.data ?? []).filter((m) => m.status === "nouveau").length;


  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (status.isLoading) {
    return <p className="py-32 text-center text-sm text-muted-foreground">Chargement…</p>;
  }

  if (!status.data?.isAdmin) {
    return (
      <div className="px-3 sm:px-6">
        <PageHeader eyebrow="Accès restreint" title="Compte non administrateur" sub="Votre compte n'a pas encore le rôle administrateur." />
        <div className="mx-auto mt-10 max-w-md rounded-3xl glass p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Identifiant du compte : <span className="font-mono text-xs">{status.data?.userId}</span>
          </p>
          <button onClick={signOut} className={`mt-6 ${btnGhost}`}>
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-6">
      <PageHeader eyebrow="Administration" title="Tableau de bord" sub="Suivez les demandes de devis et gérez le contenu du site." />

      <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Sections" className="flex gap-2">
          {(["leads", "portfolio", "testimonials", "settings"] as const).map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`min-h-11 rounded-full px-5 text-sm transition-colors ${
                tab === k ? "bg-brand text-primary-foreground" : "glass-soft text-muted-foreground hover:text-foreground"
              }`}
            >
              {k === "leads" ? (
                <>
                  Demandes
                  {newLeads > 0 && (
                    <span className="ml-2 rounded-full bg-primary-foreground/20 px-2 py-0.5 text-xs">{newLeads}</span>
                  )}
                </>
              ) : k === "portfolio" ? (
                "Portfolio"
              ) : k === "testimonials" ? (
                "Témoignages"
              ) : (
                "Réglages"
              )}
            </button>
          ))}
        </div>
        <button onClick={signOut} className={btnGhost}>
          Se déconnecter
        </button>
      </div>

      <div className="mx-auto mt-8 max-w-5xl pb-24">
        {tab === "leads" ? (
          <LeadsManager />
        ) : tab === "portfolio" ? (
          <PortfolioManager />
        ) : tab === "testimonials" ? (
          <TestimonialManager />
        ) : (
          <SettingsManager />
        )}
      </div>

    </div>
  );
}

function PortfolioManager() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<PortfolioDraft>(emptyPortfolio);
  const list = useQuery({ queryKey: ["admin-portfolio"], queryFn: () => listAllPortfolio() });

  const save = useMutation({
    mutationFn: (d: PortfolioDraft) => savePortfolioItem({ data: d }),
    onSuccess: () => {
      toast.success("Réalisation enregistrée");
      setDraft(emptyPortfolio);
      qc.invalidateQueries({ queryKey: ["admin-portfolio"] });
      qc.invalidateQueries({ queryKey: ["public-portfolio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deletePortfolioItem({ data: { id } }),
    onSuccess: () => {
      toast.success("Réalisation supprimée");
      qc.invalidateQueries({ queryKey: ["admin-portfolio"] });
      qc.invalidateQueries({ queryKey: ["public-portfolio"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(draft);
        }}
        className="h-fit space-y-3 rounded-3xl glass p-6"
      >
        <h2 className="text-lg font-semibold">{draft.id ? "Modifier la réalisation" : "Nouvelle réalisation"}</h2>
        <input className={field} placeholder="Titre" required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <input className={field} placeholder="Catégorie" required value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
        <input className={field} placeholder="Ville" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} />
        <input className={field} placeholder="URL de l'image" value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} />
        <textarea
          className="w-full rounded-2xl glass-soft p-4 text-sm outline-none focus:ring-2 focus:ring-brand/60"
          rows={3}
          placeholder="Description"
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        />
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            className={`${field} w-24`}
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
            aria-label="Ordre d'affichage"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
            Publié
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={save.isPending} className={`${btn} flex-1`}>
            {save.isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
          {draft.id && (
            <button type="button" className={btnGhost} onClick={() => setDraft(emptyPortfolio)}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-3">
        {list.data?.map((p) => (
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl glass p-5">
            <div>
              <p className="text-sm font-medium">{p.title}</p>
              <p className="text-xs text-muted-foreground">
                {p.category} · {p.city || "—"} · #{p.sort_order} · {p.published ? "publié" : "brouillon"}
              </p>
            </div>
            <div className="flex gap-2">
              <button className={btnGhost} onClick={() => setDraft({ ...p })}>
                Modifier
              </button>
              <button className={btnGhost} onClick={() => remove.mutate(p.id)}>
                Supprimer
              </button>
            </div>
          </li>
        ))}
        {list.data?.length === 0 && <li className="rounded-3xl glass p-6 text-sm text-muted-foreground">Aucune réalisation.</li>}
      </ul>
    </div>
  );
}

function TestimonialManager() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<TestimonialDraft>(emptyTestimonial);
  const list = useQuery({ queryKey: ["admin-testimonials"], queryFn: () => listAllTestimonials() });

  const save = useMutation({
    mutationFn: (d: TestimonialDraft) => saveTestimonial({ data: d }),
    onSuccess: () => {
      toast.success("Témoignage enregistré");
      setDraft(emptyTestimonial);
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      qc.invalidateQueries({ queryKey: ["public-testimonials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTestimonial({ data: { id } }),
    onSuccess: () => {
      toast.success("Témoignage supprimé");
      qc.invalidateQueries({ queryKey: ["admin-testimonials"] });
      qc.invalidateQueries({ queryKey: ["public-testimonials"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(draft);
        }}
        className="h-fit space-y-3 rounded-3xl glass p-6"
      >
        <h2 className="text-lg font-semibold">{draft.id ? "Modifier le témoignage" : "Nouveau témoignage"}</h2>
        <textarea
          className="w-full rounded-2xl glass-soft p-4 text-sm outline-none focus:ring-2 focus:ring-brand/60"
          rows={4}
          required
          placeholder="Citation"
          value={draft.quote}
          onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
        />
        <input className={field} placeholder="Nom" required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        <input className={field} placeholder="Fonction" value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} />
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={5}
            className={`${field} w-24`}
            value={draft.rating}
            onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })}
            aria-label="Note sur 5"
          />
          <input
            type="number"
            min={0}
            className={`${field} w-24`}
            value={draft.sort_order}
            onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
            aria-label="Ordre d'affichage"
          />
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
            Publié
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={save.isPending} className={`${btn} flex-1`}>
            {save.isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
          {draft.id && (
            <button type="button" className={btnGhost} onClick={() => setDraft(emptyTestimonial)}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <ul className="space-y-3">
        {list.data?.map((tm) => (
          <li key={tm.id} className="flex flex-wrap items-center justify-between gap-3 rounded-3xl glass p-5">
            <div className="max-w-md">
              <p className="text-sm">“{tm.quote}”</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {tm.name} · {tm.role || "—"} · {tm.rating}/5 · {tm.published ? "publié" : "brouillon"}
              </p>
            </div>
            <div className="flex gap-2">
              <button className={btnGhost} onClick={() => setDraft({ ...tm })}>
                Modifier
              </button>
              <button className={btnGhost} onClick={() => remove.mutate(tm.id)}>
                Supprimer
              </button>
            </div>
          </li>
        ))}
        {list.data?.length === 0 && <li className="rounded-3xl glass p-6 text-sm text-muted-foreground">Aucun témoignage.</li>}
      </ul>
    </div>
  );
}

type StatRow = { value: string; label: string };

function SettingsManager() {
  const qc = useQueryClient();
  const settings = useQuery({ queryKey: ["site-settings"], queryFn: () => getPublicSiteSettings() });
  const [draft, setDraft] = useState<null | {
    id: string;
    site_title: string;
    site_description: string;
    hero_badge: string;
    cta_title: string;
    cta_sub: string;
    cta_label: string;
    whatsapp_number: string;
    stats: StatRow[];
  }>(null);

  const current =
    draft ??
    (settings.data
      ? {
          id: settings.data.id,
          site_title: settings.data.site_title,
          site_description: settings.data.site_description,
          hero_badge: settings.data.hero_badge,
          cta_title: settings.data.cta_title,
          cta_sub: settings.data.cta_sub,
          cta_label: settings.data.cta_label,
          whatsapp_number: settings.data.whatsapp_number,
          stats: (Array.isArray(settings.data.stats) ? settings.data.stats : []) as unknown as StatRow[],
        }
      : null);

  const save = useMutation({
    mutationFn: (d: NonNullable<typeof current>) => saveSiteSettings({ data: d }),
    onSuccess: () => {
      toast.success("Réglages enregistrés");
      setDraft(null);
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (settings.isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!current) return <p className="text-sm text-muted-foreground">Aucun réglage disponible.</p>;

  const set = (patch: Partial<NonNullable<typeof current>>) => setDraft({ ...current, ...patch });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(current);
      }}
      className="space-y-4 rounded-3xl glass p-6 sm:p-8"
    >
      <h2 className="text-lg font-semibold">Contenu global du site</h2>

      <label className="block text-sm text-muted-foreground">
        Titre du site
        <input className={`${field} mt-1`} value={current.site_title} onChange={(e) => set({ site_title: e.target.value })} />
      </label>

      <label className="block text-sm text-muted-foreground">
        Description
        <textarea
          className="mt-1 w-full rounded-2xl glass-soft p-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand/60"
          rows={3}
          value={current.site_description}
          onChange={(e) => set({ site_description: e.target.value })}
        />
      </label>

      <label className="block text-sm text-muted-foreground">
        Badge d'accroche (hero)
        <input className={`${field} mt-1`} value={current.hero_badge} onChange={(e) => set({ hero_badge: e.target.value })} />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-muted-foreground">
          Titre CTA
          <input className={`${field} mt-1`} value={current.cta_title} onChange={(e) => set({ cta_title: e.target.value })} />
        </label>
        <label className="block text-sm text-muted-foreground">
          Libellé du bouton CTA
          <input className={`${field} mt-1`} value={current.cta_label} onChange={(e) => set({ cta_label: e.target.value })} />
        </label>
      </div>

      <label className="block text-sm text-muted-foreground">
        Sous-titre CTA
        <input className={`${field} mt-1`} value={current.cta_sub} onChange={(e) => set({ cta_sub: e.target.value })} />
      </label>

      <label className="block text-sm text-muted-foreground">
        Numéro WhatsApp (format international, ex. 213540481810)
        <input
          className={`${field} mt-1`}
          value={current.whatsapp_number}
          onChange={(e) => set({ whatsapp_number: e.target.value })}
        />
      </label>

      <fieldset className="rounded-2xl glass-soft p-4">
        <legend className="px-2 text-sm text-muted-foreground">Statistiques</legend>
        <div className="space-y-3">
          {current.stats.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                className={`${field} w-28`}
                value={s.value}
                aria-label={`Valeur ${i + 1}`}
                onChange={(e) => {
                  const stats = current.stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x));
                  set({ stats });
                }}
              />
              <input
                className={field}
                value={s.label}
                aria-label={`Libellé ${i + 1}`}
                onChange={(e) => {
                  const stats = current.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x));
                  set({ stats });
                }}
              />
              <button
                type="button"
                className={btnGhost}
                onClick={() => set({ stats: current.stats.filter((_, j) => j !== i) })}
              >
                ✕
              </button>
            </div>
          ))}
          {current.stats.length < 8 && (
            <button
              type="button"
              className={btnGhost}
              onClick={() => set({ stats: [...current.stats, { value: "", label: "" }] })}
            >
              + Ajouter une statistique
            </button>
          )}
        </div>
      </fieldset>

      <div className="flex gap-2">
        <button type="submit" disabled={save.isPending} className={btn}>
          {save.isPending ? "Enregistrement…" : "Enregistrer les réglages"}
        </button>
        {draft && (
          <button type="button" className={btnGhost} onClick={() => setDraft(null)}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}
