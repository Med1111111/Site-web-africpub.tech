# Déploiement — VPS Hostinger (africpub.tech)

Guide complet, du VPS vierge au site en ligne avec déploiement automatique.

## 0. Pré-requis

- Un VPS Hostinger sous **Ubuntu 22.04 ou 24.04**, avec l'IP notée (ex. `186.240.148.244`).
- Accès root en SSH (`ssh root@VOTRE_IP`).
- Le nom de domaine `africpub.tech` acheté et vous ayez accès à ses réglages DNS.
- Le code poussé sur un dépôt GitHub (public ou privé).

## 1. Pointer le domaine vers le VPS

Chez votre registrar (là où `africpub.tech` a été acheté), ajoutez ces enregistrements DNS :

| Type | Nom | Valeur          | TTL  |
| ---- | --- | --------------- | ---- |
| A    | @   | `VOTRE_IP_VPS`  | 3600 |
| A    | www | `VOTRE_IP_VPS`  | 3600 |

La propagation peut prendre de quelques minutes à quelques heures.

## 2. Installation initiale du serveur (une seule fois)

Connectez-vous en SSH au VPS en root, récupérez le code, puis lancez le script d'installation :

```bash
ssh root@VOTRE_IP_VPS

apt-get update -y && apt-get install -y git
git clone https://github.com/med1111111/Site-web-africpub.tech.git /tmp/africpub-bootstrap
cd /tmp/africpub-bootstrap

DOMAIN=africpub.tech \
REPO_URL=https://github.com/med1111111/Site-web-africpub.tech.git \
bash deploy/bootstrap.sh
```

Le script installe Node.js 22, Nginx, PM2, Certbot, configure le pare-feu, clone le
dépôt dans `/var/www/africpub`, puis **s'arrête** en vous demandant de compléter
`/var/www/africpub/.env.production` (clé secrète Supabase, clés CRM).

## 3. Compléter les clés secrètes

```bash
nano /var/www/africpub/.env.production
```

Renseignez au minimum :

- `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Réglages du projet → API → clé `service_role`
  (⚠️ jamais la clé publishable, une clé secrète différente).
- `BREVO_API_KEY` — déjà fournie, à reporter telle quelle.
- `HUBSPOT_API_KEY` — optionnel, laissez vide pour désactiver HubSpot (le CRM interne
  et Brevo continuent de fonctionner sans elle).

Puis relancez l'installation pour finir (build, démarrage PM2, Nginx, SSL) :

```bash
cd /var/www/africpub && bash deploy/bootstrap.sh
```

À la fin, le site est en ligne sur **https://africpub.tech** avec certificat SSL
auto-renouvelé (Let's Encrypt / Certbot).

## 4. Déploiement automatique à chaque `git push`

### a. Créer une paire de clés SSH dédiée (sur votre machine, pas sur le VPS)

```bash
ssh-keygen -t ed25519 -f deploy_key -N "" -C "github-actions-africpub"
```

Deux fichiers sont créés : `deploy_key` (privée) et `deploy_key.pub` (publique).

### b. Autoriser la clé publique sur le VPS

```bash
ssh root@VOTRE_IP_VPS "cat >> /home/deploy/.ssh/authorized_keys" < deploy_key.pub
```

### c. Ajouter les secrets dans GitHub

Sur GitHub : **Settings → Secrets and variables → Actions → New repository secret**

| Secret         | Valeur                                              |
| -------------- | ---------------------------------------------------- |
| `VPS_HOST`     | `186.240.148.244`                                    |
| `VPS_USER`     | `deploy`                                              |
| `VPS_SSH_KEY`  | Contenu complet du fichier `deploy_key` (privée)      |
| `VPS_PORT`     | Port SSH du VPS si différent de 22 (voir hPanel)      |
| `VPS_APP_DIR`  | `/var/www/africpub` (optionnel, c'est déjà le défaut) |

### d. C'est fait

À partir de maintenant, **chaque `git push` sur `main`** déclenche automatiquement
`.github/workflows/deploy.yml`, qui se connecte au VPS et exécute `deploy/deploy.sh`
(git pull, install, build, redémarrage PM2 sans coupure). Zéro geste manuel ensuite.

## Commandes utiles sur le VPS

```bash
pm2 status               # état du process
pm2 logs africpub         # logs en direct
pm2 restart africpub      # redémarrage manuel
sudo -u deploy bash deploy/deploy.sh   # redéploiement manuel (sans passer par GitHub)
```

## Sécurité

- L'application tourne en tant qu'utilisateur `deploy` (non root), écoute en local
  sur `127.0.0.1:3000` — seul Nginx (80/443) est exposé publiquement.
- `.env.production` n'est jamais commité (gitignored) et n'est jamais écrasé par
  `git reset --hard` lors des déploiements (fichier non suivi par git).
- Le pare-feu UFW n'autorise que SSH, HTTP et HTTPS.
