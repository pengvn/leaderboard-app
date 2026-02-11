#!/bin/bash
# Script para actualizar producción desde GitHub

echo "🚀 Actualizando producción desde GitHub..."

# 1. Clonar/actualizar repositorio en la VM
echo "📥 Descargando código actualizado..."
ssh mtg-vm "cd /home/pengvn && \
    if [ -d leaderboard-app-repo ]; then \
        cd leaderboard-app-repo && git pull; \
    else \
        git clone https://github.com/pengvn/leaderboard-app.git leaderboard-app-repo; \
    fi"

# 2. Instalar dependencias y hacer build
echo "📦 Instalando dependencias y construyendo..."
ssh mtg-vm "cd /home/pengvn/leaderboard-app-repo && \
    npm install && \
    npm run build"

# 3. Copiar frontend a nginx
echo "📤 Actualizando frontend..."
ssh mtg-vm "echo 'tigreel1' | sudo -S rm -rf /var/www/leaderboard/* && \
    echo 'tigreel1' | sudo -S cp -r /home/pengvn/leaderboard-app-repo/dist/* /var/www/leaderboard/ && \
    echo 'tigreel1' | sudo -S cp -r /home/pengvn/leaderboard-app-repo/public/* /var/www/leaderboard/"

# 4. Verificar si hay cambios en el backend (si existe)
if ssh mtg-vm "[ -f /home/pengvn/leaderboard-app-repo/server.js ]"; then
    echo "🔧 Actualizando backend..."
    ssh mtg-vm "cp /home/pengvn/leaderboard-app-repo/server.js /home/pengvn/leaderboard-backend/ 2>/dev/null || true && \
        cp /home/pengvn/leaderboard-app-repo/database.js /home/pengvn/leaderboard-backend/ 2>/dev/null || true && \
        pm2 restart leaderboard-api"
fi

echo "✅ Actualización completa!"
echo "🌐 Verifica: https://planeswalkers.online"
