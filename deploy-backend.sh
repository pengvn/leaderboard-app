#!/bin/bash
# Deploy solo del backend

echo "🔧 Actualizando backend..."

# Copiar archivos del backend
scp /home/erik/Escritorio/leaderboard-backend/server.js mtg-vm:/home/pengvn/leaderboard-backend/
scp /home/erik/Escritorio/leaderboard-backend/database.js mtg-vm:/home/pengvn/leaderboard-backend/

# Reinstalar dependencias si cambiaron
if [ "$1" == "--deps" ]; then
    echo "📦 Instalando dependencias..."
    scp /home/erik/Escritorio/leaderboard-backend/package.json mtg-vm:/home/pengvn/leaderboard-backend/
    ssh mtg-vm "cd /home/pengvn/leaderboard-backend && npm install --omit=dev"
fi

# Reiniciar backend
echo "🔄 Reiniciando backend..."
ssh mtg-vm "pm2 restart leaderboard-api"

echo "✅ Backend actualizado!"
ssh mtg-vm "pm2 status"
