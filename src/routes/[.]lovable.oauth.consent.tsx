import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type OAuthClient = { name?: string; client_name?: string; redirect_uri?: string };
type AuthorizationDetails = {
  client?: OAuthClient | null;
  scope?: string | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
  user?: { email?: string | null } | null;
};
type OAuthResult = { data: AuthorizationDetails | null; error: { message: string } | null };
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
  approveAuthorization: (id: string) => Promise<OAuthResult>;
  denyAuthorization: (id: string) => Promise<OAuthResult>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

const SCOPE_LABELS: Record<string, string> = {
  openid: "Vérifier votre identité",
  email: "Consulter votre adresse e-mail",
  profile: "Consulter votre profil de base",
};

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s['authorization_id'] === "string" ? s['authorization_id'] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Paramètre authorization_id manquant.");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: ConsentPage,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Demande d'autorisation indisponible</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
  head: () => ({ meta: [{ title: "Autoriser une application — Afric Pub" }, { name: "robots", content: "noindex" }] }),
});

function ConsentPage() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "une application";
  const scopes = (details?.scope ?? "").split(/\s+/).filter(Boolean);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Aucune URL de redirection renvoyée par le serveur d'autorisation.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <section className="rounded-3xl glass p-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Connecter {clientName} à Afric Pub
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {clientName} pourra utiliser les outils activés de cette application en votre nom.
        </p>

        {details?.client?.redirect_uri && (
          <p className="mt-4 break-all text-xs text-muted-foreground">
            Redirection vers&nbsp;: <span className="text-foreground">{details.client.redirect_uri}</span>
          </p>
        )}

        {scopes.length > 0 && (
          <ul className="mt-6 space-y-2 text-sm">
            {scopes.map((scope) => (
              <li key={scope} className="rounded-2xl glass-soft px-4 py-2.5">
                {SCOPE_LABELS[scope] ?? `Autorisation supplémentaire demandée : ${scope}`}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Cela ne contourne pas les permissions de l'application ni les règles de sécurité de la base de données.
        </p>

        {error && (
          <p role="alert" className="mt-4 rounded-2xl bg-destructive/15 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="min-h-11 flex-1 rounded-full bg-brand px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Patientez…" : "Autoriser"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="min-h-11 flex-1 rounded-full glass-soft px-5 text-sm font-medium disabled:opacity-60"
          >
            Annuler la connexion
          </button>
        </div>
      </section>
    </main>
  );
}
