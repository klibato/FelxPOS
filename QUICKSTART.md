# 🚀 Guide de Démarrage Rapide - FelxPOS

Ce guide vous permet de lancer l'application complète en 5 minutes.

## 📋 Prérequis

- Docker & Docker Compose
- Node.js 20+ (si vous ne voulez pas utiliser Docker)
- Un compte Supabase (gratuit)
- Un compte Cloudflare R2 (optionnel pour archivage)

## ⚡ Démarrage Ultra-Rapide (Docker)

### 1. Cloner le projet

```bash
git clone https://github.com/klibato/FelxPOS.git
cd FelxPOS
```

### 2. Configurer les variables d'environnement

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

**Éditez `backend/.env`:**
```env
DATABASE_URL=postgresql://postgres:postgres123@postgres:5432/felxpos_dev
JWT_SECRET=votre_secret_jwt_tres_securise
SIGNING_KEY=votre_cle_de_signature_nf525

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=votre_cle_anon

# Cloudflare R2 (optionnel)
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=votre_access_key
R2_SECRET_ACCESS_KEY=votre_secret_key
```

**Éditez `frontend/.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

### 3. Lancer avec Docker Compose

```bash
docker-compose up -d
```

**C'est tout ! 🎉**

L'application est maintenant accessible:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api/docs
- **PostgreSQL**: localhost:5432
- **PgAdmin**: http://localhost:5050 (email: admin@felxpos.com, password: admin123)

### 4. Initialiser la base de données

La base de données est automatiquement initialisée avec:
- Le schéma complet (tables, contraintes, index)
- Les triggers NF525 (inaltérabilité, hash chain)
- Des données de démonstration (restaurant, boulangerie)

### 5. Accéder à l'application

1. Ouvrir http://localhost:3000
2. Vous serez redirigé vers `/dashboard`
3. Cliquer sur **"Ouvrir la Caisse"** pour accéder au point de vente

## 🛠️ Démarrage Manuel (sans Docker)

### Backend

```bash
cd backend
npm install
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Base de données PostgreSQL

```bash
# Démarrer PostgreSQL
docker run -d \
  --name felxpos-postgres \
  -e POSTGRES_DB=felxpos_dev \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres123 \
  -p 5432:5432 \
  postgres:15-alpine

# Initialiser le schéma
psql -U postgres -h localhost -f database/schema.sql
psql -U postgres -h localhost -f database/triggers.sql
psql -U postgres -h localhost -f database/seed.sql
```

## 🎯 Utilisation

### 1. Point de Vente

1. Accéder à http://localhost:3000/pos
2. Cliquer sur des produits pour les ajouter au panier
3. Ajuster les quantités avec +/-
4. Choisir le mode de paiement (CB ou Espèces)
5. Cliquer sur **"Valider la vente"**
6. Une notification confirme l'enregistrement

### 2. Dashboard

1. Accéder à http://localhost:3000/dashboard
2. Voir les statistiques en temps réel:
   - Chiffre d'affaires du jour
   - Nombre de transactions
   - Répartition TVA
   - Moyens de paiement
3. Effectuer la clôture journalière (bouton en haut)

### 3. Clôture Journalière

⚠️ **Obligatoire avant minuit (conformité NF525)**

1. Sur le dashboard, cliquer sur **"Effectuer la clôture"**
2. Confirmer l'opération
3. Les données sont automatiquement:
   - Vérifiées (intégrité hash chain)
   - Archivées dans Cloudflare R2
   - Signées numériquement
   - Verrouillées (mode WORM)

### 4. Vérifier la Conformité

Le système surveille automatiquement:
- ✅ Intégrité de la chaîne de hash (toutes les 5 min)
- ✅ Clôture journalière en attente
- ✅ Anomalies détectées

Les alertes s'affichent en haut du dashboard.

## 📊 Données de Démonstration

Le fichier `database/seed.sql` crée automatiquement:

### Tenant 1: Restaurant "Le Petit Bistrot"
- SIRET: 12345678901234
- 2 caisses (principale + terrasse)
- 8 produits (plats, boissons, desserts)
- Quelques transactions d'exemple

### Tenant 2: Boulangerie "Pain d'Or"
- SIRET: 98765432109876
- 1 caisse
- 7 produits (pains, viennoiseries, pâtisseries)
- Stock activé

## 🔧 Commandes Utiles

### Docker

```bash
# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart backend

# Arrêter tout
docker-compose down

# Nettoyer et redémarrer
docker-compose down -v
docker-compose up -d
```

### Base de données

```bash
# Se connecter à PostgreSQL
docker exec -it felxpos-postgres psql -U postgres felxpos_dev

# Vérifier les transactions
SELECT count(*) FROM transactions;

# Vérifier l'intégrité
SELECT * FROM verify_hash_chain('tenant-id');

# Voir les clôtures
SELECT * FROM daily_closures ORDER BY closure_date DESC;
```

### Backend

```bash
# Tests
npm run test

# Tests NF525
npm run test:nf525

# Build
npm run build
```

### Frontend

```bash
# Développement
npm run dev

# Build production
npm run build
npm start

# Vérification des types
npm run type-check
```

## 🐛 Résolution de Problèmes

### Le frontend ne se connecte pas au backend

1. Vérifier que le backend est démarré: http://localhost:3001/api/docs
2. Vérifier la variable `NEXT_PUBLIC_API_URL` dans `frontend/.env.local`
3. Regarder les logs du backend: `docker-compose logs backend`

### Erreur "Transaction failed"

1. Vérifier que la base de données est initialisée
2. Vérifier les logs: `docker-compose logs postgres`
3. Tester manuellement: `psql -U postgres -h localhost felxpos_dev`

### Les produits ne s'affichent pas

1. Vérifier que les données de seed sont chargées:
   ```sql
   SELECT count(*) FROM products;
   ```
2. Vérifier l'authentification Supabase
3. Regarder la console du navigateur (F12)

### Erreur de hash chain

1. Ne jamais modifier directement la base de données
2. Vérifier l'intégrité:
   ```sql
   SELECT * FROM verify_hash_chain('tenant-id');
   ```
3. En cas de corruption, restaurer depuis une sauvegarde

## 🚀 Prochaines Étapes

1. **Configurer Supabase Auth**: Créer un projet et configurer l'authentification
2. **Ajouter des produits**: Via l'interface admin (à venir)
3. **Personnaliser**: Modifier les couleurs, logo, etc.
4. **Déployer**: Vercel (frontend) + Render (backend)
5. **Certification NF525**: Obtenir la certification officielle

## 📚 Documentation

- [README Principal](./README.md)
- [Documentation NF525](./docs/NF525-REQUIREMENTS.md)
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [API Documentation](http://localhost:3001/api/docs) (Swagger)

## 🆘 Support

- **Issues**: https://github.com/klibato/FelxPOS/issues
- **Email**: support@felxpos.com
- **Documentation**: https://docs.felxpos.com

## ⚠️ Important

**Ce logiciel est en développement actif.**

Pour une utilisation en production:
1. Changer tous les secrets et mots de passe
2. Activer HTTPS partout
3. Configurer les sauvegardes automatiques
4. Obtenir la certification NF525 officielle
5. Respecter le RGPD

---

**Prêt à démarrer ? 🚀**

```bash
docker-compose up -d
```

Puis ouvrir http://localhost:3000 et commencer à vendre ! 💰
