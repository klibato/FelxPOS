# FelxPOS Frontend - Next.js 14

Interface utilisateur moderne et tactile pour le SaaS de caisse enregistreuse conforme NF525.

## 🎯 Fonctionnalités

- **Point de Vente Tactile** : Interface optimisée pour écrans tactiles
- **Dashboard Temps Réel** : Statistiques actualisées automatiquement
- **Multi-activité** : Modules adaptés (Restaurant, Retail, Beauty, Event)
- **PWA** : Fonctionne hors-ligne avec synchronisation
- **NF525 Compliant** : Alertes de conformité et clôtures obligatoires

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 20+
- Backend NestJS en cours d'exécution
- Compte Supabase configuré

### Installation

```bash
cd frontend
npm install
```

### Configuration

Copier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Configurer les variables :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Build Production

```bash
npm run build
npm start
```

## 📱 Pages Principales

### Dashboard (`/dashboard`)

- Chiffre d'affaires du jour
- Statistiques de ventes
- Répartition TVA
- Alertes NF525
- Bouton de clôture journalière

### Point de Vente (`/pos`)

- Grille de produits
- Panier avec gestion des quantités
- Sélection mode de paiement
- Validation de transaction
- Génération de reçu PDF

### Administration

- `/admin/products` - Gestion des produits
- `/admin/operators` - Gestion des opérateurs
- `/admin/settings` - Configuration entreprise
- `/admin/fec` - Export FEC

## 🏗️ Architecture

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard principal
│   │   ├── pos/                # Point de vente
│   │   │   ├── BasePOS.tsx     # Composant de base
│   │   │   └── modules/        # Modules métier
│   │   └── admin/              # Espace admin
│   ├── components/
│   │   └── ui/                 # Composants UI (shadcn)
│   ├── hooks/                  # React Query hooks
│   ├── lib/                    # Utilitaires
│   │   ├── api.ts              # Client API Axios
│   │   ├── supabase.ts         # Client Supabase
│   │   ├── auth.ts             # Authentification
│   │   └── utils.ts            # Helpers
│   └── types/                  # Types TypeScript
└── public/
    └── manifest.json           # PWA manifest
```

## 🔧 Technologies

- **Next.js 14** - Framework React avec App Router
- **React Query** - Gestion d'état serveur
- **Tailwind CSS** - Styling utilitaire
- **shadcn/ui** - Composants UI
- **Supabase** - Authentification et base de données
- **Axios** - Client HTTP
- **Recharts** - Graphiques
- **Sonner** - Notifications toast

## 📊 Composants Clés

### BasePOS

Composant de base pour toutes les interfaces de point de vente :

```tsx
import { BasePOS } from '@/app/pos/BasePOS';

export default function CustomPOS() {
  return <BasePOS title="Ma Caisse" />;
}
```

### Hooks API

```tsx
// Transactions
const { data: transactions } = useTransactions();
const createTransaction = useCreateTransaction();

// Statistiques
const { data: stats } = useDailyStats();

// Clôtures
const createClosure = useCreateClosure();

// Produits
const { data: products } = useProducts();
const createProduct = useCreateProduct();
```

## 🔒 Conformité NF525

### Alertes Automatiques

Le frontend surveille en permanence :

- Intégrité de la chaîne de hash
- Clôture journalière en attente
- Anomalies détectées par l'API

### Restrictions

- ❌ Aucune modification de transaction possible
- ✅ Clôture obligatoire avant minuit
- ✅ Affichage du statut "Conforme NF525"
- ✅ Hash de sécurité sur tous les reçus

## 🎨 Thèmes

Le frontend supporte les thèmes clair/sombre via `next-themes` :

```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
```

## 📱 PWA

L'application est installable comme PWA :

- Mode hors-ligne avec cache
- Synchronisation automatique
- Icônes optimisées
- Manifest configuré

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Vérification de types
npm run type-check
```

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
vercel --prod
```

### Docker

```bash
docker build -t felxpos-frontend .
docker run -p 3000:3000 felxpos-frontend
```

## 📝 Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend | `http://localhost:3001/api/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase | `eyJ...` |

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Proprietary - Tous droits réservés

## 🎯 Roadmap

- [ ] Module Restaurant avec gestion des tables
- [ ] Module Retail avec scan code-barres
- [ ] Module Beauty avec rendez-vous
- [ ] Module Event avec caisse mobile
- [ ] Mode multi-caisses
- [ ] Synchronisation offline avancée
- [ ] Application mobile native
- [ ] Support multi-langues

---

**Développé avec ❤️ pour respecter la réglementation française NF525**
