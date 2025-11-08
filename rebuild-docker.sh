#!/bin/bash

# Script pour reconstruire Docker sans cache
# Ce script résout les problèmes de cache Docker qui empêchent les modifications d'être prises en compte

set -e

# Vérifier l'environnement d'abord
echo "Vérification de l'environnement..."
./check-env.sh || exit 1

echo "=========================================="
echo "Nettoyage complet Docker pour FelxPOS"
echo "=========================================="
echo ""

# 1. Arrêter tous les conteneurs et supprimer les volumes
echo "📦 Étape 1/5: Arrêt des conteneurs et suppression des volumes..."
docker compose down -v

# 2. Supprimer les images existantes de FelxPOS
echo "🗑️  Étape 2/5: Suppression des images Docker existantes..."
docker rmi felxpos-backend felxpos-frontend 2>/dev/null || echo "   (pas d'images à supprimer)"

# 3. Nettoyer le cache de build Docker
echo "🧹 Étape 3/5: Nettoyage du cache de build Docker..."
docker builder prune -af

# 4. Reconstruire sans cache
echo "🔨 Étape 4/5: Reconstruction des images sans cache..."
docker compose build --no-cache --progress=plain

# 5. Démarrer les services
echo "🚀 Étape 5/5: Démarrage des services..."
docker compose up -d

echo ""
echo "=========================================="
echo "✅ Reconstruction terminée!"
echo "=========================================="
echo ""
echo "Services disponibles:"
echo "  - Frontend:  http://localhost:3000"
echo "  - Backend:   http://localhost:3001"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis:     localhost:6379"
echo ""
echo "Vérifier les logs:"
echo "  docker compose logs -f backend"
echo "  docker compose logs -f frontend"
echo ""
echo "Vérifier le statut:"
echo "  docker compose ps"
