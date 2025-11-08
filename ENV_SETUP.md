# Configuration de l'Environnement

## Problème : Variables d'environnement manquantes

Si vous obtenez l'erreur suivante lors du build Docker :
```
Error: either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables
or supabaseUrl and supabaseKey are required!
```

C'est que le fichier `.env` n'est pas correctement configuré.

## Solution Rapide

### 1. Créer le fichier .env

```bash
# Copier le template
cp .env.example .env
```

### 2. Éditer le fichier .env avec vos vraies valeurs

```bash
nano .env
# ou
vim .env
# ou
code .env
```

### 3. Remplir les valeurs requises

#### Variables Supabase (OBLIGATOIRE)

1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet
3. Settings > API
4. Copiez les valeurs :

```env
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Variables Cloudflare R2 (OBLIGATOIRE pour archivage NF525)

1. Allez sur https://dash.cloudflare.com
2. R2 > Overview
3. Manage R2 API Tokens > Create API Token
4. Créez un bucket pour l'archivage

```env
R2_ENDPOINT=https://account-id.r2.cloudflarestorage.com/nom-du-bucket
R2_ACCESS_KEY_ID=votre_access_key_id
R2_SECRET_ACCESS_KEY=votre_secret_access_key
R2_BUCKET_NAME=nom-du-bucket
```

#### Variables de Sécurité (OBLIGATOIRE)

Générez des secrets forts :

```bash
# Générer un secret JWT
openssl rand -base64 32

# Générer une clé de signature
openssl rand -base64 64
```

Puis dans `.env` :
```env
JWT_SECRET=votre_secret_jwt_généré
SIGNING_KEY=votre_clé_de_signature_générée
```

#### Variable Base de Données

```env
DB_PASSWORD=postgres123
```

### 4. Vérifier la configuration

```bash
./check-env.sh
```

Ce script vérifie :
- ✅ Présence du fichier `.env`
- ✅ Toutes les variables requises sont définies
- ✅ Aucune valeur de placeholder n'est utilisée
- ✅ Connexion Supabase accessible

### 5. Lancer le build

```bash
./rebuild-docker.sh
```

## Pourquoi ces variables sont requises ?

### Variables NEXT_PUBLIC_*

En Next.js, les variables commençant par `NEXT_PUBLIC_` sont :
- **Intégrées dans le bundle JavaScript** au moment du build
- **Accessibles côté client** dans le navigateur
- **Doivent être disponibles pendant `npm run build`**

C'est pourquoi elles doivent être passées comme `ARG` dans le Dockerfile, pas seulement comme variables d'environnement runtime.

### Architecture de Build

```
docker-compose.yml
  ↓ (passe les args au build)
Dockerfile (build stage)
  ↓ (reçoit ARG)
  ↓ (convertit en ENV)
npm run build
  ↓ (intègre NEXT_PUBLIC_* dans le bundle)
Bundle JavaScript final
```

## Dépannage

### Erreur : "variable is not set. Defaulting to a blank string"

**Cause** : Le fichier `.env` n'existe pas ou n'est pas à la racine du projet

**Solution** :
```bash
# Vérifier l'emplacement
ls -la .env

# Si absent, copier le template
cp .env.example .env
```

### Erreur : "NEXT_PUBLIC_SUPABASE_URL is required"

**Cause** : La variable n'est pas passée au build Docker

**Solution** : Vérifiée que `docker-compose.yml` contient :
```yaml
frontend:
  build:
    args:  # ← Important !
      NEXT_PUBLIC_SUPABASE_URL: ${SUPABASE_URL}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
```

### Erreur : "Cannot find module 'lucide-react'"

**Cause** : Dépendances npm non installées

**Solution** : Rebuild sans cache
```bash
./rebuild-docker.sh
```

## Fichiers Importants

- **`.env`** : Variables d'environnement (gitignored, à créer localement)
- **`.env.example`** : Template avec les variables requises
- **`check-env.sh`** : Script de vérification
- **`rebuild-docker.sh`** : Script de build complet
- **`docker-compose.yml`** : Orchestration des services

## Sécurité

⚠️ **IMPORTANT** :
- Le fichier `.env` est dans `.gitignore` (ne le committez JAMAIS)
- Changez les secrets par défaut en production
- Utilisez des secrets forts générés aléatoirement
- Ne partagez jamais vos credentials Supabase ou R2

## Prochaines Étapes

Une fois l'environnement configuré :

1. ✅ Vérifier : `./check-env.sh`
2. ✅ Builder : `./rebuild-docker.sh`
3. ✅ Tester : `docker compose ps`
4. ✅ Accéder : http://localhost:3000 (frontend) et http://localhost:3001 (backend)
