/**
 * classes/Apuesta.js
 * ─────────────────────────────────────────────
 * Representa una apuesta realizada por un usuario
 * sobre un partido específico.
 */
class Apuesta {
  static #contador = 1; // ID autoincremental (campo privado)

  /**
   * @param {Usuario} usuario
   * @param {Partido} partido
   * @param {'local'|'empate'|'visitante'} tipo
   * @param {number} monto - Cantidad apostada en pesos
   */
  constructor(usuario, partido, tipo, monto) {
    this.id        = `AP-${String(Apuesta.#contador++).padStart(4, '0')}`;
    this.usuario   = usuario;
    this.partido   = partido;
    this.tipo      = tipo;
    this.monto     = monto;
    this.cuota     = partido.getCuota(tipo);
    this.estado    = 'pendiente';  // 'pendiente' | 'ganada' | 'perdida'
    this.fecha     = new Date().toLocaleString('es-CO');
  }

  /**
   * Ganancia potencial = monto × cuota.
   * @returns {number}
   */
  calcularGanancia() {
    return parseFloat((this.monto * this.cuota).toFixed(0));
  }

  /**
   * Devuelve el estado en texto legible con emoji.
   * @returns {string}
   */
  getEstadoLabel() {
    const map = {
      pendiente: '🕐 Pendiente',
      ganada:    '✅ Ganada',
      perdida:   '❌ Perdida',
    };
    return map[this.estado] || this.estado;
  }

  /**
   * Etiqueta del tipo de apuesta.
   * @returns {string}
   */
  getTipoLabel() {
    const labels = {
      local:     `${this.partido.equipoLocal.emoji} ${this.partido.equipoLocal.nombre} gana`,
      empate:    '🤝 Empate',
      visitante: `${this.partido.equipoVisitante.emoji} ${this.partido.equipoVisitante.nombre} gana`,
    };
    return labels[this.tipo] || this.tipo;
  }

  /**
   * Resuelve la apuesta según el resultado del partido.
   * @param {'local'|'empate'|'visitante'} resultadoReal
   */
  resolver(resultadoReal) {
    this.estado = this.tipo === resultadoReal ? 'ganada' : 'perdida';
  }
}
