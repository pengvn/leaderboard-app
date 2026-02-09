#!/bin/bash

# Script de inicio rápido para MTG Leaderboard & Lifecounter
# Uso: ./start.sh

echo "🎮 Iniciando MTG Leaderboard & Lifecounter..."
echo ""

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias..."
    npm install
    echo ""
fi

# Iniciar servidor de desarrollo
echo "🚀 Iniciando servidor de desarrollo..."
echo ""
echo "📍 Rutas disponibles:"
echo "   - http://localhost:5173/             (Leaderboard)"
echo "   - http://localhost:5173/lifecounter   (MTG Lifecounter)"
echo "   - http://localhost:5173/admin         (Admin Panel)"
echo ""
echo "⚡ Presiona Ctrl+C para detener el servidor"
echo ""

npm run dev
