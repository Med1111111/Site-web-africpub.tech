# Chargement différé du canvas Three.js (réduction du TBT)

Objectif : garder le fond animé, mais ne plus exécuter Three.js pendant le chargement initial. Le dégradé CSS reste visible immédiatement, le canvas prend le relais une fois la page libre.

## Comportement visé

1. Au premier rendu : seulement le fond CSS (dégradés radiaux rouge/orange). Aucun import de Three.js, aucun travail JS.
2. Après hydratation, le canvas ne démarre que lorsque l'un de ces déclencheurs survient :
   - navigateur inactif (`requestIdleCallback`, repli `setTimeout` ~2 s),
   - première interaction utilisateur (`pointermove`, `pointerdown`, `scroll`, `keydown`, `touchstart`).
3. Cas où le canvas ne démarre jamais (fond CSS seul, aucun coût) :
   - `prefers-reduced-motion: reduce`,
   - petits écrans / mobile (< 768 px),
   - appareils faibles : `navigator.hardwareConcurrency <= 4` ou `navigator.deviceMemory <= 4`,
   - `navigator.connection.saveData` actif,
   - WebGL indisponible.
4. Pause de la boucle d'animation quand l'onglet passe en arrière-plan (`visibilitychange`) et reprise au retour.

## Détails techniques

- `src/components/WebGLBackground.tsx` : le composant devient une coquille légère qui rend uniquement le dégradé CSS + un conteneur. La logique Three.js actuelle est extraite dans un module séparé (`src/components/webgl-scene.ts`) exportant une fonction `startScene(container): () => void` (setup + cleanup, code identique à l'existant).
- L'import de Three.js reste dynamique (`await import("three")`) mais n'est déclenché qu'après le gate idle/interaction, donc le chunk `three` sort du chemin critique et du TBT initial.
- Un seul démarrage garanti (drapeau `started`), tous les listeners du gate retirés au démarrage et au démontage.
- Aucune modification de `__root.tsx` nécessaire : même import, même emplacement.
- Fidélité visuelle : shader, particules, halos et couleurs inchangés.

## Vérification

- Build production, puis Lighthouse (desktop + mobile) sur l'accueil et le portfolio pour confirmer la baisse du TBT et le maintien de LCP/CLS.
- Contrôle Playwright : absence du chunk `three` dans les requêtes au chargement, puis apparition du `<canvas>` après un `pointermove`.
