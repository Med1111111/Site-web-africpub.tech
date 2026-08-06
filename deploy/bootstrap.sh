#!/usr/bin/env bash
# Installation initiale — à exécuter UNE SEULE FOIS, en root, sur un VPS Ubuntu neuf.
# Usage : DOMAIN=africpub.tech REPO_URL=https://github.com/<owner>/<repo>.git bash deploy/bootstrap.sh
set -euo pipefail

DOMAIN="${DOMAIN:?Définissez DOMAIN=africpub.tech}"
REPO_URL="${REPO_URL:?Définissez REPO_URL=https://github.com/<owner>/<repo>.git}"
BRANCH="${BRANCH:-main}"
APP_DIR="${APP_DIR:-/var/www/africpub}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@$DOMAIN}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Ce script doit être lancé en root (sudo)." >&2
  exit 1
fi

echo "==> Mise à jour du système"
apt-get update -y
apt-get upgrade -y

echo "==> Installation Node.js 22"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

echo "==> Installation Nginx, Certbot, Git, UFW"
apt-get install -y nginx certbot python3-certbot-nginx git ufw

echo "==> Pare-feu"
ufw allow OpenSSH
ufw allow "Nginx Full"
ufw --force enable

echo "==> PM2"
npm install -g pm2

echo "==> Utilisateur applicatif non privilégié"
id -u deploy &>/dev/null || useradd -m -s /bin/bash deploy
DEPLOY_HOME=$(eval echo "~deploy")
mkdir -p "$DEPLOY_HOME/.ssh"
touch "$DEPLOY_HOME/.ssh/authorized_keys"
chmod 700 "$DEPLOY_HOME/.ssh"
chmod 600 "$DEPLOY_HOME/.ssh/authorized_keys"
chown -R deploy:deploy "$DEPLOY_HOME/.ssh"
echo "   Pour l'auto-déploiement GitHub Actions, ajoutez la clé publique dédiée dans :"
echo "   $DEPLOY_HOME/.ssh/authorized_keys (procédure complète : deploy/README.md)"

echo "==> Clonage du dépôt dans $APP_DIR"
mkdir -p "$APP_DIR"
chown deploy:deploy "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
  sudo -u deploy git -C "$APP_DIR" fetch origin "$BRANCH"
  sudo -u deploy git -C "$APP_DIR" checkout "$BRANCH"
  sudo -u deploy git -C "$APP_DIR" reset --hard "origin/$BRANCH"
else
  sudo -u deploy git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

echo "==> Fichier d'environnement"
if [ ! -f "$APP_DIR/.env.production" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env.production"
  chown deploy:deploy "$APP_DIR/.env.production"
  echo "!!! IMPORTANT : complétez $APP_DIR/.env.production avec vos vraies clés"
  echo "    (SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY, HUBSPOT_API_KEY) avant de continuer."
  echo "    Relancez ensuite : bash $APP_DIR/deploy/deploy.sh"
  exit 0
fi

echo "==> Installation des dépendances + build"
cd "$APP_DIR"
sudo -u deploy npm ci
sudo -u deploy npm run build

echo "==> Démarrage de l'application via PM2"
sudo -u deploy pm2 start deploy/ecosystem.config.cjs
sudo -u deploy pm2 save
PM2_STARTUP_CMD=$(sudo -u deploy pm2 startup systemd -u deploy --hp "$DEPLOY_HOME" | tail -n 1)
eval "$PM2_STARTUP_CMD"

echo "==> Configuration Nginx pour $DOMAIN"
sed "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" deploy/nginx.africpub.tech.conf > /etc/nginx/sites-available/"$DOMAIN"
ln -sf /etc/nginx/sites-available/"$DOMAIN" /etc/nginx/sites-enabled/"$DOMAIN"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "==> Certificat SSL (Let's Encrypt)"
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$ADMIN_EMAIL" --redirect

echo ""
echo "==> Terminé. Site disponible sur https://$DOMAIN"
echo "==> Pour les déploiements suivants : bash $APP_DIR/deploy/deploy.sh (ou push sur GitHub, voir deploy/README.md)"
