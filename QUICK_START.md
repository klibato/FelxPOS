# Guide de Démarrage Rapide - FelxPOS

## Problème Résolu : Erreur de Cache Docker

Si vous rencontriez l'erreur TypeScript suivante lors du build Docker :
```
ERROR in ./src/modules/closures/closures.service.ts:118:9
TS2353: Object literal may only specify known properties, and 'eventType' does not exist
```

Cette erreur était due au **cache de build Docker** qui utilisait une ancienne version du code.

## Solution : Reconstruction Complète

### Option 1 : Utiliser le script automatique (Recommandé)

```bash
./rebuild-docker.sh
```

Ce script effectue automatiquement :
1. Arrêt des conteneurs et suppression des volumes
2. Suppression des images Docker existantes
3. Nettoyage complet du cache de build
4. Reconstruction sans cache
5. Démarrage des services

### Option 2 : Commandes manuelles

Si vous préférez exécuter les commandes une par une :

```bash
# 1. Arrêter et nettoyer
docker compose down -v

# 2. Supprimer les images FelxPOS
docker rmi felxpos-backend felxpos-frontend

# 3. Nettoyer le cache de build
docker builder prune -af

# 4. Reconstruire sans cache
docker compose build --no-cache

# 5. Démarrer
docker compose up -d
```

## Vérification de l'Installation

### Vérifier que tous les services sont démarrés

```bash
docker compose ps
```

Vous devriez voir :
- ✅ `felxpos-postgres` - running (healthy)
- ✅ `felxpos-redis` - running (healthy)
- ✅ `felxpos-backend` - running
- ✅ `felxpos-frontend` - running

### Vérifier les logs

```bash
# Logs du backend
docker compose logs -f backend

# Logs du frontend
docker compose logs -f frontend

# Logs de tous les services
docker compose logs -f
```

### Tester les endpoints

```bash
# Health check backend
curl http://localhost:3001/health

# Frontend
curl http://localhost:3000
```

## Accès aux Services

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Interface Next.js |
| **Backend API** | http://localhost:3001/api/v1 | API REST NestJS |
| **PostgreSQL** | localhost:5432 | Base de données |
| **Redis** | localhost:6379 | Cache et queues |
| **PgAdmin** | http://localhost:5050 | Interface PostgreSQL (optionnel) |
| **Redis Commander** | http://localhost:8081 | Interface Redis (optionnel) |

### Credentials par défaut

**PgAdmin** (si démarré avec `--profile tools`)
- Email: `admin@felxpos.com`
- Password: `admin123`

**PostgreSQL**
- User: `postgres`
- Password: Voir variable `DB_PASSWORD` dans `.env`
- Database: `felxpos_dev`

## Variables d'Environnement

Le fichier `.env` à la racine du projet doit contenir :

```env
# Database
DB_PASSWORD=your_password

# JWT & Signature
JWT_SECRET=your_jwt_secret
SIGNING_KEY=your_signing_key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Cloudflare R2
R2_ENDPOINT=https://your-endpoint.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket
```

⚠️ **Important** : Le fichier `.env` est dans `.gitignore` (c'est normal pour la sécurité). Chaque développeur doit créer son propre fichier `.env` localement.

## Commandes Utiles

### Développement

```bash
# Redémarrer un service spécifique
docker compose restart backend

# Reconstruire et redémarrer un service
docker compose up -d --build backend

# Voir les logs en temps réel
docker compose logs -f

# Exécuter une commande dans un conteneur
docker compose exec backend npm run migration:run
docker compose exec postgres psql -U postgres -d felxpos_dev
```

### Nettoyage

```bash
# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes (⚠️ perte de données)
docker compose down -v

# Nettoyer complètement Docker (libère de l'espace)
docker system prune -a --volumes
```

## Structure du Projet

```
FelxPOS/
├── backend/              # API NestJS
│   ├── src/
│   │   └── modules/
│   │       ├── transactions/   # Gestion transactions NF525
│   │       ├── closures/       # Clôtures journalières
│   │       ├── audit/          # Logs d'audit immuables
│   │       ├── archive/        # Archivage R2
│   │       └── ...
│   └── Dockerfile
├── frontend/             # Interface Next.js 14
│   ├── src/
│   │   ├── app/          # App Router
│   │   ├── components/   # Composants React
│   │   ├── hooks/        # React Query hooks
│   │   └── lib/          # Utilitaires
│   └── Dockerfile
├── database/             # Scripts SQL
│   ├── schema.sql        # Schéma complet
│   ├── triggers.sql      # Triggers NF525
│   └── seed.sql          # Données de test
├── docker-compose.yml    # Orchestration
├── .env                  # Variables d'environnement (à créer)
└── rebuild-docker.sh     # Script de reconstruction
```

## Conformité NF525

Le système implémente les 4 piliers NF525 :

1. **Inaltérabilité** : Hash chain SHA-256 sur chaque transaction
2. **Sécurisation** : Triggers PostgreSQL empêchant UPDATE/DELETE
3. **Conservation** : Clôtures journalières obligatoires
4. **Archivage** : Stockage 6 ans sur Cloudflare R2 (WORM)

## Prochaines Étapes

1. ✅ Vérifier que tous les services démarrent
2. ✅ Tester la création d'une transaction via l'API
3. ✅ Vérifier l'interface frontend
4. ⬜ Configurer Supabase Auth pour l'authentification
5. ⬜ Tester le workflow complet POS
6. ⬜ Effectuer une clôture journalière
7. ⬜ Vérifier l'archivage sur R2

## Support

En cas de problème :

1. Vérifier les logs : `docker compose logs -f`
2. Vérifier le statut : `docker compose ps`
3. Vérifier les variables d'environnement : `cat .env`
4. Reconstruire complètement : `./rebuild-docker.sh`

## Modifications Récentes

### Corrections Appliquées

1. ✅ **Dockerfiles** : Changement de `npm ci` vers `npm install`
2. ✅ **next.config.js** : Suppression de `experimental.appDir` (obsolète Next.js 14)
3. ✅ **next.config.js** : Ajout de `output: 'standalone'` pour Docker
4. ✅ **package.json** : Ajout de dépendances manquantes (`@tanstack/react-query-devtools`, `tailwindcss-animate`)
5. ✅ **closures.service.ts** : Correction TypeScript ligne 118 (suppression de `eventType`)
6. ✅ **docker-compose.yml** : Suppression du champ obsolète `version`
7. ✅ **.dockerignore** : Création pour optimiser le contexte de build
8. ✅ **.env** : Création à la racine pour Docker Compose

Toutes les corrections sont maintenant dans le code source. Le rebuild Docker va utiliser le code corrigé.
