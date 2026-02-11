#!/bin/bash
# Script de deployment para MTG Leaderboard

echo "🚀 Iniciando deployment..."

# Build del frontend
echo "📦 Construyendo frontend..."
npm run build

# Copiar al servidor
echo "📤 Copiando archivos al servidor..."
scp -r dist/* mtg-vm:/var/www/leaderboard/

# Si cambiaste el backend, copiar también
echo "🔧 ¿Actualizar backend? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "📤 Copiando backend..."
    scp src/context/LeaderboardContext.jsx mtg-vm:/tmp/
    scp src/api.js mtg-vm:/tmp/

    # Actualizar en la VM
    ssh mtg-vm "cp /tmp/LeaderboardContext.jsx /home/pengvn/leaderboard-backend/ 2>/dev/null; true"
    ssh mtg-vm "cp /tmp/api.js /home/pengvn/leaderboard-backend/ 2>/dev/null; true"

    echo "🔄 Reiniciando backend..."
    ssh mtg-vm "pm2 restart leaderboard-api"
fi

echo "✅ Deployment completo!"
echo "🌐 Verifica en: https://planeswalkers.online"
