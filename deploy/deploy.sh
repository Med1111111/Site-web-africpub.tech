#!/usr/bin/env bash
# Redéploiement — exécuté sur le VPS (par GitHub Actions ou manuellement) à
# chaque mise à jour du code. Ne touche jamais à .env.production (gitignored,
# non affecté par `git reset --hard`).
set -euo pipefail
cd "$(dirname "$0")/.."

BRANCH="${BRANCH:-main}"

echo "==> git fetch + reset sur origin/$BRANCH"
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "==> npm ci"
npm ci

echo "==> Build de production"
npm run build

echo "==> Rechargement PM2"
pm2 reload deploy/ecosystem.config.cjs --update-env

echo "==> Déploiement terminé ($(git rev-parse --short HEAD))"
