# BETWORLD 2026 🏆

Aplicación web de apuestas para el Mundial 2026.  
Desarrollada con HTML, CSS y JavaScript Vanilla puro (sin frameworks).

## Cómo usar

1. Descomprime el ZIP
2. Abre `index.html` en tu navegador (doble clic)
3. ¡Listo! No necesita servidor ni instalación

## Estructura del proyecto

```
betworld/
├── index.html              ← Entrada principal
├── styles.css              ← Estilos (dark sport / Bet365)
├── app.js                  ← Orquestador principal
├── data/
│   └── data.js             ← Partidos del Mundial 2026
├── classes/
│   ├── Partido.js          ← Clase Partido
│   ├── Apuesta.js          ← Clase Apuesta
│   ├── Usuario.js          ← Clase Usuario
│   └── SistemaApuestas.js  ← Controlador central (Facade)
└── ui/
    ├── PartidoCard.js      ← Tarjeta de partido (createElement)
    ├── CarritoUI.js        ← Panel lateral boleto
    └── HistorialUI.js      ← Panel historial con filtros
```

## Funcionalidades

- ⚽ 11 partidos: Grupos, Octavos, Cuartos, Semis y Final
- 💰 Saldo virtual de $500.000
- 🎫 Boleto de apuestas con cuotas y ganancia estimada
- 📋 Historial filtrable por estado (Pendiente / Ganada / Perdida)
- 🔍 Búsqueda en tiempo real por equipo o fase
- 📱 Diseño responsive (móvil y escritorio)

## Arquitectura (POO)

| Clase | Responsabilidad |
|-------|----------------|
| `Partido` | Datos del partido, cuotas y estado |
| `Apuesta` | Apuesta individual con cálculo de ganancia |
| `Usuario` | Saldo virtual e historial personal |
| `SistemaApuestas` | Fachada central, patrón Observer para UI |
| `PartidoCard` | Renderizado dinámico con `createElement` |
| `CarritoUI` | Panel boleto con Event Delegation |
| `HistorialUI` | Panel historial con filtros |
