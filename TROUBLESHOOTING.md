# 🔧 Troubleshooting - MTG Leaderboard & Lifecounter

## Problema: Error "can't access property map, p.colors is undefined"

### Causa
Matches antiguos guardados con estructura incorrecta en localStorage.

### Solución Rápida

**Opción 1: Limpiar desde el Admin**
1. Ir a `/admin`
2. En la pestaña "Match Logging"
3. Buscar botón "Clear History" o similar
4. Confirmar

**Opción 2: Limpiar desde Console (DevTools)**
```javascript
// Abrir DevTools (F12)
// Ir a Console
// Ejecutar:
localStorage.removeItem('leaderboard_matches');
location.reload();
```

**Opción 3: Limpiar Todo (Reset completo)**
```javascript
// PRECAUCIÓN: Esto borra TODO
localStorage.clear();
location.reload();
```

### Prevención
- ✅ Código actualizado ya maneja colores opcionales
- ✅ Nuevas partidas no causarán este error
- ✅ Matches antiguos se pueden limpiar sin afectar scores

---

## Problema: Partida no se refleja en Leaderboard

### Verificar
1. ¿Se guardó la partida? → Ver console.log
2. ¿Están los nombres mapeados? → Pengvn, Rekatria, Hwan, Emi
3. ¿Se actualizaron los scores? → Ir a tabla de posiciones

### Puntos por Posición
- 🥇 1° lugar: 5 puntos
- 🥈 2° lugar: 2 puntos
- 🥉 3° lugar: 1 punto
- 4° lugar: 0 puntos

---

## Problema: Orientación no cambia

### Solución
1. Abrir menú durante partida (☰)
2. Ver sección de orientación
3. Click en 📱 Vertical o 📱 Horizontal
4. El cambio es inmediato

---

## Limpiar Datos de Desarrollo

```javascript
// Limpiar solo matches
localStorage.removeItem('leaderboard_matches');

// Limpiar solo usuarios/scores
localStorage.removeItem('leaderboard_users');

// Reset completo
localStorage.clear();

// Luego recargar
location.reload();
```

---

## Contacto

Para bugs o features: GitHub Issues
