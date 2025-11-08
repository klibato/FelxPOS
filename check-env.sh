#!/bin/bash

# Script de vérification de l'environnement avant le build Docker

set -e

echo "=========================================="
echo "Vérification de l'environnement FelxPOS"
echo "=========================================="
echo ""

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables requises
REQUIRED_VARS=(
  "DB_PASSWORD"
  "JWT_SECRET"
  "SIGNING_KEY"
  "SUPABASE_URL"
  "SUPABASE_ANON_KEY"
  "R2_ENDPOINT"
  "R2_ACCESS_KEY_ID"
  "R2_SECRET_ACCESS_KEY"
  "R2_BUCKET_NAME"
)

# Vérifier si le fichier .env existe
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ Erreur : Fichier .env manquant à la racine du projet${NC}"
  echo ""
  echo "Solution :"
  echo "  1. Copiez .env.example vers .env"
  echo "     cp .env.example .env"
  echo ""
  echo "  2. Éditez .env avec vos vraies valeurs"
  echo "     nano .env"
  echo ""
  exit 1
fi

echo -e "${GREEN}✓${NC} Fichier .env trouvé"
echo ""

# Charger le fichier .env
export $(cat .env | grep -v '^#' | xargs)

# Vérifier chaque variable requise
MISSING_VARS=()
PLACEHOLDER_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  value="${!var}"

  if [ -z "$value" ]; then
    MISSING_VARS+=("$var")
  elif [[ "$value" == *"your_"* ]] || [[ "$value" == *"xxxxx"* ]] || [[ "$value" == *"change_this"* ]]; then
    PLACEHOLDER_VARS+=("$var")
  fi
done

# Afficher les résultats
if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "${RED}❌ Variables manquantes dans .env :${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo "   - $var"
  done
  echo ""
fi

if [ ${#PLACEHOLDER_VARS[@]} -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Variables avec valeurs de placeholder :${NC}"
  for var in "${PLACEHOLDER_VARS[@]}"; do
    echo "   - $var=${!var}"
  done
  echo ""
  echo "Ces variables doivent être remplacées par de vraies valeurs."
  echo ""
fi

if [ ${#MISSING_VARS[@]} -gt 0 ] || [ ${#PLACEHOLDER_VARS[@]} -gt 0 ]; then
  echo -e "${RED}Veuillez corriger votre fichier .env avant de continuer.${NC}"
  exit 1
fi

echo -e "${GREEN}✓${NC} Toutes les variables d'environnement sont définies"
echo ""

# Vérifier la connexion Supabase (optionnel)
echo "Vérification de la connexion Supabase..."
if curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL" | grep -q "200\|404"; then
  echo -e "${GREEN}✓${NC} Supabase URL accessible"
else
  echo -e "${YELLOW}⚠️  Impossible de vérifier l'URL Supabase (peut être normal)${NC}"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Environnement prêt pour le build Docker${NC}"
echo "=========================================="
echo ""
echo "Vous pouvez maintenant lancer :"
echo "  ./rebuild-docker.sh"
echo ""
