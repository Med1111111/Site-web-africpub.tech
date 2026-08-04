# Tests E2E Playwright : validation de la CSP

## Objectif

Vérifier automatiquement, sur plusieurs routes du site, que la politique de sécurité (CSP) est bien envoyée et qu'elle bloque réellement l'exécution de scripts inline non autorisés et de `eval()`.

Point important constaté dans le code actuel : en développement, la CSP est envoyée en mode « report-only » (`src/lib/security-headers.ts`), donc elle n'applique aucun blocage. Les tests doivent donc s'exécuter contre un **build de production servi localement**, sinon ils ne prouveraient rien.

Autre point : la politique de production autorise aujourd'hui `'unsafe-inline'` pour `script-src` (nécessaire à l'hydratation React SSR actuelle). Les tests valideront donc ce qui est réellement garanti : `unsafe-eval` bloqué, `object-src 'none'`, `base-uri`/`form-action`/`frame-ancestors` verrouillés, et blocage effectif d'un script chargé depuis une origine externe non listée. Un test dédié documentera l'exception `'unsafe-inline'` afin qu'un renforcement futur (nonces) soit détecté.

## Ce qui sera mis en place

1. **Playwright** ajouté en dépendance de développement, avec un fichier de configuration dédié (`playwright.config.ts`) :
   - démarrage automatique du serveur de production local avant les tests,
   - navigateur Chromium, mode headless, rapport lisible en CI.

2. **Suite de tests CSP** (`tests/e2e/csp.spec.ts`) exécutée sur les routes : `/`, `/services`, `/portfolio`, `/a-propos`, `/contact`, `/recherche`, `/faq`, `/auth`.

   Pour chaque route :
   - l'en-tête `content-security-policy` est présent (et **pas** en report-only),
   - toutes les directives requises sont présentes et cohérentes avec `src/lib/security-headers.ts` (source de vérité unique, importée par le test),
   - `eval()` et `new Function()` déclenchent une erreur de sécurité,
   - un `<script src>` vers une origine non autorisée est bloqué (violation CSP observée, script non exécuté),
   - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors` restreints,
   - la page reste fonctionnelle : aucune violation CSP déclenchée par le site lui-même (React, Three.js, polices, Supabase) et aucune erreur console bloquante.

3. **Détection des violations** via l'écoute de l'événement `securitypolicyviolation` dans la page, plus les messages console — pour distinguer « bloqué comme prévu » de « le site casse ».

4. **Scripts npm** : `test:e2e` (et `test:e2e:ui` pour le débogage local).

5. **Intégration CI** : ajout d'un job Playwright dans `.github/workflows/security.yml`, à côté de l'audit statique existant, avec upload du rapport en cas d'échec.

## Détails techniques

- Serveur de test : build de production puis service local via le serveur Nitro/`vite preview` généré, afin que `src/server.ts` applique les vrais en-têtes.
- Les listes de directives attendues sont importées depuis `src/lib/security-headers.ts` : si la politique évolue, les tests suivent sans duplication.
- Le script externe de test pointe vers une origine factice non listée dans `connect-src`/`script-src` ; aucune requête réseau réelle sortante n'est nécessaire (interception locale).
- Les tests n'introduisent aucune modification du code applicatif ni de la politique CSP existante.
