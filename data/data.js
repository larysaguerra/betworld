/**
 * data/data.js
 * Fuente de datos: partidos del Mundial 2026.
 * Cada objeto se convertirá en una instancia de Partido en app.js.
 */

const PARTIDOS_DATA = [
  // ── FASE DE GRUPOS ──────────────────────────────
  {
    id: 'g01',
    equipoLocal:     { nombre: 'Brasil',    emoji: '🇧🇷' },
    equipoVisitante: { nombre: 'México',    emoji: '🇲🇽' },
    fecha: '15 Jun 2026 · 18:00',
    fase: 'grupo',
    cuotas: { local: 1.85, empate: 3.40, visitante: 4.50 },
    estado: 'proximo',
    resultado: null,
  },
  {
    id: 'g02',
    equipoLocal:     { nombre: 'Argentina', emoji: '🇦🇷' },
    equipoVisitante: { nombre: 'Colombia',  emoji: '🇨🇴' },
    fecha: '16 Jun 2026 · 21:00',
    fase: 'grupo',
    cuotas: { local: 1.75, empate: 3.60, visitante: 5.00 },
    estado: 'proximo',
    resultado: null,
  },
  {
    id: 'g03',
    equipoLocal:     { nombre: 'Francia',   emoji: '🇫🇷' },
    equipoVisitante: { nombre: 'Alemania',  emoji: '🇩🇪' },
    fecha: '17 Jun 2026 · 20:00',
    fase: 'grupo',
    cuotas: { local: 2.10, empate: 3.20, visitante: 3.80 },
    estado: 'proximo',
    resultado: null,
  },
  {
    id: 'g04',
    equipoLocal:     { nombre: 'España',    emoji: '🇪🇸' },
    equipoVisitante: { nombre: 'Portugal',  emoji: '🇵🇹' },
    fecha: '18 Jun 2026 · 18:00',
    fase: 'grupo',
    cuotas: { local: 2.30, empate: 3.10, visitante: 3.20 },
    estado: 'proximo',
    resultado: null,
  },
  {
    id: 'g05',
    equipoLocal:     { nombre: 'Inglaterra', emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    equipoVisitante: { nombre: 'EE.UU.',     emoji: '🇺🇸' },
    fecha: '19 Jun 2026 · 21:00',
    fase: 'grupo',
    cuotas: { local: 2.00, empate: 3.30, visitante: 4.10 },
    estado: 'en-vivo',
    resultado: '1 - 0',
  },
  {
    id: 'g06',
    equipoLocal:     { nombre: 'Japón',     emoji: '🇯🇵' },
    equipoVisitante: { nombre: 'Marruecos', emoji: '🇲🇦' },
    fecha: '14 Jun 2026 · 15:00',
    fase: 'grupo',
    cuotas: { local: 2.80, empate: 3.00, visitante: 2.90 },
    estado: 'finalizado',
    resultado: '2 - 1',
  },

  // ── OCTAVOS ─────────────────────────────────────
  {
    id: 'o01',
    equipoLocal:     { nombre: 'Brasil',    emoji: '🇧🇷' },
    equipoVisitante: { nombre: 'Japón',     emoji: '🇯🇵' },
    fecha: '30 Jun 2026 · 20:00',
    fase: 'octavos',
    cuotas: { local: 1.55, empate: 4.00, visitante: 6.50 },
    estado: 'proximo',
    resultado: null,
  },
  {
    id: 'o02',
    equipoLocal:     { nombre: 'Francia',   emoji: '🇫🇷' },
    equipoVisitante: { nombre: 'Colombia',  emoji: '🇨🇴' },
    fecha: '01 Jul 2026 · 18:00',
    fase: 'octavos',
    cuotas: { local: 1.80, empate: 3.50, visitante: 4.80 },
    estado: 'proximo',
    resultado: null,
  },

  // ── CUARTOS ─────────────────────────────────────
  {
    id: 'c01',
    equipoLocal:     { nombre: 'Argentina', emoji: '🇦🇷' },
    equipoVisitante: { nombre: 'España',    emoji: '🇪🇸' },
    fecha: '06 Jul 2026 · 20:00',
    fase: 'cuartos',
    cuotas: { local: 2.20, empate: 3.15, visitante: 3.40 },
    estado: 'proximo',
    resultado: null,
  },

  // ── SEMIS ────────────────────────────────────────
  {
    id: 's01',
    equipoLocal:     { nombre: 'Brasil',    emoji: '🇧🇷' },
    equipoVisitante: { nombre: 'Francia',   emoji: '🇫🇷' },
    fecha: '10 Jul 2026 · 21:00',
    fase: 'semis',
    cuotas: { local: 2.00, empate: 3.25, visitante: 3.75 },
    estado: 'proximo',
    resultado: null,
  },

  // ── FINAL ────────────────────────────────────────
  {
    id: 'f01',
    equipoLocal:     { nombre: 'Por definir', emoji: '🏆' },
    equipoVisitante: { nombre: 'Por definir', emoji: '🥇' },
    fecha: '19 Jul 2026 · 20:00',
    fase: 'final',
    cuotas: { local: 2.00, empate: 3.50, visitante: 2.00 },
    estado: 'proximo',
    resultado: null,
  },
];
