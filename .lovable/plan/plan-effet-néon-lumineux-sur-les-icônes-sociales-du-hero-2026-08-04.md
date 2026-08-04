# Plan — Effet néon lumineux sur les icônes sociales du Hero

## Objectif
Donner aux icônes sociales du Hero (Facebook, Instagram, YouTube, WhatsApp, Maps) un effet néon rouge-orange cohérent avec le thème « nous donnons de la lumière à votre marque », assorti au dégradé déjà utilisé sur le bouton « Démarrer un projet ».

## État actuel (vérifié)
- `src/styles.css` définit les tokens :
  - `--gradient-brand: linear-gradient(120deg, oklch(0.573 0.234 27.5), oklch(0.74 0.19 55))` (rouge → orange)
  - `--shadow-glow: 0 0 60px -12px oklch(0.573 0.234 27.5 / 55%)`
  - utilitaires `glass-soft`, `glow`, `bg-brand`
- `src/routes/index.tsx` (lignes 69-111) :
  - Bouton CTA « Démarrer un projet » : `bg-brand ... shadow-[var(--shadow-glow)]`
  - Boutons WhatsApp & Maps : `glass px-7 py-3.5`, `hover:scale-[1.04]`
  - 3 icônes sociales (FB, IG, YT) : `size-11 rounded-full glass-soft`, `hover:scale-[1.08]`

## Changements

### 1. `src/styles.css` — nouvel utilitaire `neon-social`
Ajouter dans la section Glassmorphism, après `@utility glow` :
```css
@utility neon-social {
  border: 1px solid oklch(0.573 0.234 27.5 / 35%);
  box-shadow:
    0 0 0 1px oklch(0.573 0.234 27.5 / 20%),
    0 0 18px -2px oklch(0.573 0.234 27.5 / 55%),
    0 0 40px -8px oklch(0.74 0.19 55 / 40%);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  &:hover {
    transform: scale(1.12);
    border-color: oklch(0.74 0.19 55 / 70%);
    box-shadow:
      0 0 0 1px oklch(0.573 0.234 27.5 / 40%),
      0 0 28px -1px oklch(0.573 0.234 27.5 / 75%),
      0 0 60px -6px oklch(0.74 0.19 55 / 65%);
  }
}
```
Variante pour les boutons-pill (WhatsApp, Maps) : `neon-social-pill` — même logique mais scale(1.05) et halo un peu plus large pour s'adapter aux boutons allongés.

### 2. `src/routes/index.tsx` — appliquer les utilitaires
- Icônes sociales (ligne ~105) : remplacer `glass-soft transition-transform hover:scale-[1.08]` par `neon-social` (garder la couleur d'icône `size-5`).
- Boutons WhatsApp & Maps (lignes ~80, ~89) : remplacer `glass ... hover:scale-[1.04]` par `neon-social-pill`, garder l'icône + texte.
- Conserver les attributs `target="_blank" rel="noopener noreferrer"` et `aria-label`.

## Non concerné
- Aucun changement de logique, de routes, de contenu ni de données.
- Pas de modification des autres pages (Services, Portfolio, etc.).

## Vérification
- Typecheck (`tsgo`) après édition.
- Capture d'écran Playwright desktop + mobile du Hero pour confirmer le glow et le hover.
