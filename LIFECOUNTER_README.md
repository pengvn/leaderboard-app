# 🎮 MTG Lifecounter - Documentación

## Descripción General

Aplicación web responsiva de pantalla completa para rastrear vidas en partidas de Magic: The Gathering. Diseñada especialmente para modos multijugador (1v1, 2v2, Commander).

## ✨ Características Principales

### 🚪 Pantalla de Bienvenida
- Interfaz limpia con botón de inicio
- Diseño moderno con gradientes

### ⚔️ Modos de Juego
- **1v1 (Standard)**: 2 jugadores, 20 vidas
- **2v2 (Equipos)**: 4 jugadores, 20 vidas
- **Commander**: 4 jugadores, 40 vidas

### 👥 Jugadores Predefinidos
- Pengvn
- Rekatria
- Hwan
- Emi

### 🎨 Personalización de Jugadores
Cada jugador puede configurar:
- Color del panel
- Imagen de fondo personalizada
- Nombre del mazo
- Colores de maná utilizados (W, U, B, R, G, C)

### 🎯 Tablero de Juego
- **Contador de Vidas**:
  - Click normal: ±1 vida
  - Long Press (500ms): ±10 vidas continuamente
- **Indicador de turno**: Resalta al jugador activo
- **Contadores adicionales**:
  - ☠️ Veneno
  - ⚡ Energía
  - ⚔️ Comandante
  - ⭐ Experiencia

### ⏳ Seguimiento de Rondas
- Contador global de rondas
- Indicador de jugador activo
- Botón "Siguiente Turno"

### 🏁 Finalización de Partida
- **Automática**: Cuando solo queda un jugador con vida
- **Manual**: Botón "Finalizar partida"
- **Resumen final**:
  - Clasificación por vidas finales
  - Muestra mazo utilizado
  - Colores de maná
  - Opción para guardar datos (preparado para leaderboard)

## 🛠️ Tecnologías Utilizadas

- **React 19.2.0**
- **React Router DOM 7.13.0**
- **Vite** (con Rolldown)
- **CSS Modules**

## 📱 Características Técnicas

### Responsive Design
- Mobile-first approach
- Adaptación a orientación landscape
- Touch-friendly (botones grandes, long press)
- Sin zoom en dispositivos móviles

### Optimizaciones Touch
- Long press para cambios rápidos de vida
- Prevención de scroll no deseado
- Feedback visual en interacciones

### Estructura de Datos

#### Jugador
```javascript
{
  "id": 0,
  "nombre": "Pengvn",
  "life": 27,
  "color": "#1e3a8a",
  "background": "azul_oscuro.jpg",
  "deck": "Azorius Control",
  "manaColors": ["W", "U"],
  "position": 0,
  "counters": {
    "poison": 0,
    "energy": 2,
    "commander": 0,
    "experience": 0
  }
}
```

#### Datos de Partida
```javascript
{
  "mode": "Commander",
  "date": "2026-02-09T12:00:00.000Z",
  "turnNumber": 7,
  "players": [...]
}
```

## 🚀 Uso

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

## 🎮 Flujo de Uso

1. **Inicio**: Click en "Jugar"
2. **Selección de Modo**: Elegir 1v1, 2v2 o Commander
3. **Configuración**: Personalizar cada jugador
4. **Juego**:
   - Usar +/- para cambiar vidas
   - Long press para cambios rápidos (±10)
   - Click en vida para configurar contadores
   - "Siguiente Turno" para avanzar
5. **Finalizar**:
   - Automático cuando queda 1 jugador
   - O usar menú para finalizar manualmente
6. **Resultados**: Ver estadísticas y opción de guardar

## 🔗 Integración con Leaderboard

La aplicación está integrada en el proyecto leaderboard existente:
- Ruta: `/lifecounter`
- Botón flotante ⚡ en la página principal del leaderboard
- Datos preparados para envío futuro a tabla de posiciones

## 📂 Estructura de Archivos

```
src/
├── pages/
│   ├── Lifecounter.jsx      # Componente principal
│   └── Lifecounter.css      # Estilos del lifecounter
├── App.jsx                  # Routing (incluye ruta /lifecounter)
└── index.html              # Meta tags para móvil
```

## 🎨 Paleta de Colores

### Colores de Panel
- Azul Oscuro: `#1e3a8a`
- Rojo Oscuro: `#7f1d1d`
- Verde Oscuro: `#14532d`
- Morado: `#581c87`
- Negro: `#171717`
- Naranja: `#9a3412`

### Colores de Maná
- W (Blanco): `#f9fafb`
- U (Azul): `#3b82f6`
- B (Negro): `#1f2937`
- R (Rojo): `#ef4444`
- G (Verde): `#22c55e`
- C (Incoloro): `#9ca3af`

## 💡 Funcionalidades Futuras

- [ ] Historial de cambios de vida
- [ ] Gráfico de progreso de partida
- [ ] Guardado automático en localStorage
- [ ] Exportar/Importar partidas
- [ ] Modo oscuro/claro
- [ ] Sonidos de feedback
- [ ] Temas personalizados
- [ ] Integración completa con leaderboard backend

## 📝 Notas de Desarrollo

- La aplicación usa hooks de React para manejo de estado
- Long press implementado con setTimeout/setInterval
- Detección automática de ganador
- Preparado para PWA (Progressive Web App)
- Compatible con gestos táctiles

## 🐛 Debugging

Para ver los datos de la partida en consola:
1. Finalizar partida
2. Click en "Cargar Información"
3. Abrir DevTools → Console
4. Buscar: "Datos de la partida:"

## 📞 Soporte

Para reportar bugs o sugerir mejoras, contactar al equipo de desarrollo.

---

**Versión**: 1.0.0
**Fecha**: 2026-02-09
**Autor**: Claude Code
