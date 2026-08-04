import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import PageHeader from "@/components/PageHeader";

function safeNext(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: (s: Record<string, unknown>) => ({ next: safeNext(s['next']) ?? undefined }),
  head: () => ({
    meta: [
      { title: "Connexion — Espace admin Afric Pub" },
      { name: "description", content: "Connectez-vous à l'espace d'administration Afric Pub pour gérer le portfolio et les témoignages." },
      { property: "og:title", content: "Connexion — Espace admin Afric Pub" },
      { property: "og:description", content: "Accès réservé à l'équipe Afric Pub." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      if (next) window.location.replace(next);
      else navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (next) window.location.replace(next);
        else navigate({ to: "/admin", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${next ?? "/admin"}` },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Vérifiez votre boîte mail pour confirmer votre compte.");
        } else if (next) {
          window.location.replace(next);
        } else {
          navigate({ to: "/admin", replace: true });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Échec de l'authentification");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${next ?? "/"}`,
    });
    if (result.error) {
      toast.error("Connexion Google impossible pour le moment.");
      return;
    }
    if (result.redirected) return;
    if (next) window.location.replace(next);
    else navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="px-3 sm:px-6">
      <PageHeader eyebrow="Espace réservé" title="Connexion admin" sub="Gérez le portfolio et les témoignages du site." />

      <section className="mx-auto mt-12 max-w-md rounded-3xl glass p-8">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-11 w-full rounded-2xl glass-soft px-4 text-sm outline-none focus:ring-2 focus:ring-brand/60"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-muted-foreground">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="min-h-11 w-full rounded-2xl glass-soft px-4 text-sm outline-none focus:ring-2 focus:ring-brand/60"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="min-h-11 w-full rounded-full bg-brand px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading ? "Patientez…" : mode === "signin" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-white/10" /> ou <span className="h-px flex-1 bg-white/10" />
        </div>

        <button onClick={onGoogle} className="min-h-11 w-full rounded-full glass-soft px-5 text-sm font-medium">
          Continuer avec Google
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-medium text-foreground underline underline-offset-4"
          >
            {mode === "signin" ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
      </section>
    </div>
  );
}
