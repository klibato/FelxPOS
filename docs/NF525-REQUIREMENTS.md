# Exigences NF525 - Certification de Caisse Enregistreuse

## Vue d'ensemble

La norme NF525 définit les critères de conformité pour les logiciels de caisse enregistreuse en France. Elle vise à lutter contre la fraude à la TVA en imposant des contraintes strictes sur les systèmes d'encaissement.

## Les 4 Piliers ISCA

### 1. Inaltérabilité (I)

**Obligations:**
- Les données de transaction ne peuvent JAMAIS être modifiées ou supprimées
- Toute correction génère une nouvelle écriture avec traçabilité complète
- Implémentation d'une chaîne de hash cryptographique (blockchain-like)
- Triggers PostgreSQL pour empêcher UPDATE/DELETE

**Implémentation technique:**
```sql
-- Trigger de prévention des modifications
CREATE TRIGGER prevent_update_transaction
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION prevent_transaction_modification();
```

### 2. Sécurisation (S)

**Obligations:**
- Hash SHA-256 pour chaque transaction
- Chaînage cryptographique (hash N dépend du hash N-1)
- Authentification forte des utilisateurs
- Audit log complet de toutes les actions
- Protection contre les injections et manipulations

**Hash chain:**
```
TX1: hash(GENESIS | data1) → H1
TX2: hash(H1 | data2) → H2
TX3: hash(H2 | data3) → H3
```

### 3. Conservation (C)

**Obligations:**
- **Durée minimale:** 6 ans à partir de la clôture de l'exercice
- Stockage sécurisé et accessible pour contrôle fiscal
- Format exploitable et lisible
- Horodatage certifié de toutes les opérations

**Données à conserver:**
- Toutes les transactions (ventes, remboursements, annulations)
- Clôtures journalières et mensuelles
- Journaux d'audit
- Certificats et signatures numériques

### 4. Archivage (A)

**Obligations:**
- Archive immuable (WORM - Write Once Read Many)
- Export FEC (Fichier des Écritures Comptables)
- Attestation de conformité
- Capacité de restitution complète

**Implémentation:**
- Cloudflare R2 avec Object Lock en mode COMPLIANCE
- Rétention obligatoire de 6 ans
- Signature numérique des archives

## Exigences Techniques Détaillées

### Format des Tickets

Mentions obligatoires sur chaque ticket:
- Numéro de ticket unique et séquentiel
- Date et heure de la transaction
- Identification du vendeur (SIRET, raison sociale)
- Numéro TVA intracommunautaire
- Détail des articles (libellé, quantité, prix unitaire)
- Montant HT par taux de TVA
- Montant de TVA par taux
- Total TTC
- Mode de paiement
- **Hash de sécurité (NF525)**

### Clôtures Journalières

**Obligations:**
- Clôture obligatoire avant minuit
- Impossible de rouvrir une journée clôturée
- Calcul des totaux par taux de TVA
- Vérification de l'intégrité de la chaîne de hash
- Archive automatique

**Données de clôture:**
```typescript
interface DailyClosure {
  date: Date;
  totalTransactions: number;
  totalHT: Decimal;
  totalTVA: Decimal;
  totalTTC: Decimal;
  vatBreakdown: Record<string, VatAmount>;
  firstTransactionHash: string;
  lastTransactionHash: string;
  closureHash: string; // Hash de contrôle de la clôture
}
```

### Export FEC

**Format obligatoire:**
- Fichier texte délimité par pipe (|)
- Encodage UTF-8
- 18 colonnes obligatoires
- Nomenclature comptable française
- Équilibre Débit = Crédit

**Colonnes FEC:**
1. JournalCode (VE pour ventes)
2. JournalLib
3. EcritureNum (numéro de transaction)
4. EcritureDate (AAAAMMJJ)
5. CompteNum (compte comptable)
6. CompteLib
7. CompAuxNum
8. CompAuxLib
9. PieceRef (numéro de ticket)
10. PieceDate
11. EcritureLib
12. Debit
13. Credit
14. EcritureLet
15. DateLet
16. ValidDate
17. Montantdevise
18. Idevise

### Taux de TVA en France (2024)

- **Standard:** 20% (produits et services courants)
- **Intermédiaire:** 10% (restauration, transport)
- **Réduit:** 5.5% (alimentation, livres)
- **Particulier:** 2.1% (médicaments, presse)

## Sanctions en cas de Non-Conformité

- **Amende:** 7 500 € par logiciel non conforme
- **Majoration:** Jusqu'à 80% des droits rappelés en cas de fraude avérée
- **Responsabilité:** L'entreprise utilisatrice ET l'éditeur du logiciel

## Échéances Réglementaires

- **Avant 1er janvier 2018:** Logiciel conforme (auto-déclaration)
- **1er janvier 2018 - 31 août 2026:** Période transitoire
- **À partir du 1er septembre 2026:** Certification obligatoire par organisme agréé (AFNOR, LNE, INFOCERT)

## Organismes Certificateurs

1. **AFNOR Certification**
2. **LNE (Laboratoire National de métrologie et d'Essais)**
3. **INFOCERT**

## Contrôles Fiscaux

**L'administration peut demander:**
- Accès immédiat aux données de caisse
- Export FEC sur demande
- Vérification de la chaîne de hash
- Attestation de conformité NF525
- Logs d'audit complets

**Délai de mise à disposition:** 24-48 heures maximum

## Références Légales

- **Article 88 de la loi de finances 2016**
- **BOI-TVA-DECLA-30-10-30** (Bulletin Officiel des Impôts)
- **Décret n° 2016-1551 du 17 novembre 2016**
- **Arrêté du 3 août 2017** (caractéristiques de sécurisation)

## Checklist de Conformité

- [ ] Transactions inaltérables (triggers DB)
- [ ] Hash SHA-256 avec chaînage
- [ ] Clôtures journalières automatiques
- [ ] Conservation 6 ans minimum
- [ ] Archive immuable (WORM)
- [ ] Export FEC conforme
- [ ] Tickets avec hash de sécurité
- [ ] Audit log complet
- [ ] Authentification sécurisée
- [ ] Tests de vérification d'intégrité
- [ ] Documentation technique complète
- [ ] Procédures de sauvegarde/restauration
- [ ] Plan de continuité d'activité

## Architecture Technique Recommandée

```
┌─────────────────────────────────────────────────┐
│          Conformité NF525 Garantie              │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   Inaltérabilité  Sécurisation  Conservation
        │             │             │
    PostgreSQL    Hash Chain    Cloudflare R2
    Triggers      SHA-256       Object Lock
    IMMUTABLE                   6 ans
```

## Ressources Complémentaires

- [Guide AFNOR NF525](https://certification.afnor.org/logiciels-de-caisse/logiciels-de-caisse-nf525)
- [Documentation LNE](https://www.lne.fr/fr/certification/certification-nf525)
- [BOI Fiscal](https://bofip.impots.gouv.fr/)
