# FelxPOS - SaaS de Caisse Enregistreuse Conforme NF525

[![NF525](https://img.shields.io/badge/NF525-Conforme-green)](https://certification.afnor.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-red)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

## 📋 Vue d'ensemble

FelxPOS est un SaaS moderne de caisse enregistreuse 100% conforme à la norme française NF525, garantissant l'inaltérabilité, la sécurisation, la conservation et l'archivage des données de transaction.

### 🎯 Fonctionnalités principales

- ✅ **Conformité NF525 totale** avec certification anti-fraude fiscale
- 🔒 **Inaltérabilité des données** via hash chain cryptographique (SHA-256)
- 📊 **Clôtures journalières automatiques** avec archivage sécurisé
- 📄 **Export FEC** (Fichier des Écritures Comptables) pour l'administration fiscale
- 🧾 **Génération de reçus PDF** avec QR Code de vérification
- 📦 **Archivage WORM** sur Cloudflare R2 (6 ans minimum)
- 🔍 **Audit trail complet** de toutes les opérations
- 🏢 **Multi-tenant** avec isolation des données
- ⚡ **Temps réel** via WebSocket pour les mises à jour live

## 🏗️ Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Next.js 14     │────▶│   NestJS API     │────▶│  PostgreSQL 15  │
│  (Frontend)     │     │   (Backend)      │     │  (Supabase)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
│                          │
▼                          ▼
┌──────────────┐          ┌──────────────┐
│ Cloudflare R2│          │  Redis Cache │
│  (Archives)  │          │  + BullMQ    │
└──────────────┘          └──────────────┘
```

### Stack technique

**Backend:**
- NestJS 10.3 avec TypeORM
- PostgreSQL 15 (triggers NF525)
- BullMQ pour tâches asynchrones
- Cloudflare R2 pour archivage
- PDFKit pour génération de reçus

**Frontend:**
- Next.js 14 (App Router)
- TypeScript 5.3
- Tailwind CSS
- Supabase Auth

**Infrastructure:**
- Docker & Docker Compose
- Redis pour cache et queues
- Vercel (Frontend)
- Render (Backend)

## 📦 Installation

### Prérequis

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+ (ou utiliser Docker)
- Compte Supabase
- Compte Cloudflare R2 (pour archivage)

### Installation rapide avec Docker

1. **Cloner le projet**
```bash
git clone https://github.com/klibato/FelxPOS.git
cd FelxPOS
```

2. **Configurer les variables d'environnement**
```bash
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos configurations
```

3. **Démarrer les services**
```bash
docker-compose up -d
```

4. **Initialiser la base de données**
```bash
# La base de données sera automatiquement initialisée avec:
# - Schéma (schema.sql)
# - Triggers NF525 (triggers.sql)
# - Données de test (seed.sql)
```

5. **Accéder aux applications**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Documentation API: http://localhost:3001/api/docs
- PgAdmin: http://localhost:5050 (avec profile tools)

### Installation manuelle

#### Backend

```bash
cd backend
npm install
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🚀 Utilisation

### Créer une transaction

```typescript
POST /api/v1/transactions

{
  "items": [
    {
      "name": "Café Expresso",
      "quantity": 2,
      "price": 3.50,
      "vatRate": "intermediate"
    }
  ],
  "paymentMethod": "card",
  "customerEmail": "client@example.com"
}
```

**Réponse:**
```json
{
  "id": "1",
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "receiptNumber": "1234-2024-0000000001",
  "totalTtc": 7.00,
  "currentHash": "a3b2c1d4e5f6...",
  "previousHash": "9f8e7d6c5b4a...",
  "transactionDate": "2024-11-08T12:30:00Z"
}
```

### Effectuer une clôture journalière

```typescript
POST /api/v1/closures

{
  "date": "2024-11-08",
  "registerId": "ca111111-1111-1111-1111-111111111111"
}
```

### Générer un export FEC

```typescript
POST /api/v1/exports/fec

{
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

## 🔒 Sécurité NF525

### Inaltérabilité

Chaque transaction est protégée par un hash SHA-256 chaîné :

```
TX1: hash(GENESIS | data1) → H1
TX2: hash(H1 | data2) → H2
TX3: hash(H2 | data3) → H3
```

**Triggers PostgreSQL** empêchent toute modification ou suppression :

```sql
CREATE TRIGGER trg_prevent_update
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION prevent_transaction_modification();
```

### Vérification d'intégrité

```typescript
GET /api/v1/transactions/verify-hash-chain
```

Vérifie l'intégrité complète de la chaîne de hash.

### Archivage WORM

Toutes les clôtures sont archivées sur Cloudflare R2 avec:
- Protection WORM (Write Once Read Many)
- Rétention de 6 ans minimum
- Signature numérique HMAC-SHA256
- Horodatage certifié

## 📊 Base de données

### Tables principales

- `tenants` - Entreprises multi-tenant
- `cash_registers` - Caisses enregistreuses
- `operators` - Opérateurs/caissiers
- `transactions` - **IMMUABLE** - Transactions de vente
- `daily_closures` - **IMMUABLE** - Clôtures journalières
- `audit_logs` - **IMMUABLE** - Logs d'audit
- `products` - Catalogue produits
- `fec_exports` - Exports FEC

### Triggers NF525

- `calculate_transaction_hash()` - Calcul automatique du hash
- `prevent_transaction_modification()` - Bloquer modifications
- `prevent_transaction_deletion()` - Bloquer suppressions
- `calculate_closure_hash()` - Hash de clôture
- `verify_hash_chain()` - Vérification d'intégrité

## 🧪 Tests

### Tests unitaires

```bash
cd backend
npm run test
```

### Tests de conformité NF525

```bash
npm run test:nf525
```

Ces tests vérifient:
- ✅ Impossibilité de modifier les transactions
- ✅ Intégrité de la chaîne de hash
- ✅ Unicité des clôtures journalières
- ✅ Archivage immuable
- ✅ Équilibre des exports FEC

### Tests E2E

```bash
npm run test:e2e
```

## 📚 Documentation

- [Exigences NF525](./docs/NF525-REQUIREMENTS.md)
- [API Documentation](http://localhost:3001/api/docs) (Swagger)
- [Architecture Database](./database/schema.sql)
- [Guide de déploiement](./docs/DEPLOYMENT.md)

## 🔧 Scripts utiles

```bash
# Développement
npm run start:dev

# Build production
npm run build
npm run start:prod

# Vérifier la conformité
npm run test:nf525

# Générer une migration
npm run migration:generate -- MigrationName

# Exécuter les migrations
npm run migration:run
```

## 📋 Checklist de conformité NF525

- [x] Transactions inaltérables (triggers DB)
- [x] Hash SHA-256 avec chaînage
- [x] Clôtures journalières obligatoires
- [x] Conservation 6 ans minimum
- [x] Archive immuable (WORM)
- [x] Export FEC conforme
- [x] Tickets avec hash de sécurité
- [x] Audit log complet
- [x] Tests de vérification d'intégrité
- [ ] Certification par organisme agréé (AFNOR/LNE)

## 🚀 Déploiement

### Production

**Backend (Render):**
```bash
# Déploiement automatique via Git
git push origin main
```

**Frontend (Vercel):**
```bash
vercel --prod
```

**Base de données:**
- Utiliser Supabase en production
- Configurer les backups automatiques
- Activer Row Level Security (RLS)

## 📝 Licence

Proprietary - Tous droits réservés

## 🤝 Support

- Email: support@felxpos.com
- Documentation: https://docs.felxpos.com
- Issues: https://github.com/klibato/FelxPOS/issues

## ⚠️ Avertissement légal

Ce logiciel est conçu pour être conforme à la norme NF525. Cependant, la certification officielle par un organisme agréé (AFNOR, LNE, INFOCERT) est obligatoire à partir du 1er septembre 2026.

L'utilisation de ce logiciel sans certification en production engage la responsabilité de l'utilisateur.

## 🎯 Roadmap

- [ ] Interface d'administration complète
- [ ] Module de gestion de stock
- [ ] Facturation récurrente
- [ ] Application mobile (caissier)
- [ ] Intégrations comptables (Sage, Cegid)
- [ ] Support multi-devises
- [ ] Mode hors-ligne avec synchronisation
- [ ] Certification NF525 officielle

---

**Développé avec ❤️ pour respecter la réglementation française**
