import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageHeader from "@/components/PageHeader";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — Espace admin Afric Pub" },
      {
        name: "description",
        content: "Définissez un nouveau mot de passe pour votre compte administrateur Afric Pub.",
      },
      { property: "og:title", content: "Nouveau mot de passe — Afric Pub" },
      { property: "og:description", content: "Réinitialisation sécurisée du mot de passe administrateur." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Mot de passe mis à jour.");
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de la mise à jour du mot de passe");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-3 sm:px-6">
      <PageHeader
        eyebrow="Espace réservé"
        title="Nouveau mot de passe"
        sub="Choisissez un mot de passe long et unique pour votre compte administrateur."
      />

      <section className="mx-auto mt-12 max-w-md rounded-3xl glass p-8">
        {!ready ? (
          <p className="text-sm text-muted-foreground">
            Ouvrez cette page depuis le lien reçu par e-mail pour définir un nouveau mot de passe. Le lien est valable
            une seule fois et pour une durée limitée.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-sm text-muted-foreground">
                Nouveau mot de passe
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-11 w-full rounded-2xl glass-soft px-4 text-sm outline-none focus:ring-2 focus:ring-brand/60"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm text-muted-foreground">
                Confirmer le mot de passe
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="min-h-11 w-full rounded-2xl glass-soft px-4 text-sm outline-none focus:ring-2 focus:ring-brand/60"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="min-h-11 w-full rounded-full bg-brand px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {loading ? "Patientez…" : "Enregistrer le mot de passe"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
