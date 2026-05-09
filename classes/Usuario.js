/**
 * classes/Usuario.js
 * ─────────────────────────────────────────────
 * Representa al usuario de la plataforma.
 * Gestiona saldo virtual e historial de apuestas.
 */
class Usuario {
  /**
   * @param {string} id
   * @param {string} nombre
   * @param {number} saldoInicial
   */
  constructor(id, nombre, saldoInicial = 500000) {
    this.id        = id;
    this.nombre    = nombre;
    this.saldo     = saldoInicial;
    this.historial = []; // Array<Apuesta>
  }

  /**
   * Descuenta el monto del saldo y agrega la apuesta al historial.
   * @param {Apuesta} apuesta
   * @returns {boolean} true si la operación fue exitosa
   */
  registrarApuesta(apuesta) {
    if (apuesta.monto <= 0) {
      console.warn('El monto debe ser mayor a 0');
      return false;
    }
    if (apuesta.monto > this.saldo) {
      console.warn('Saldo insuficiente');
      return false;
    }
    this.saldo -= apuesta.monto;
    this.historial.push(apuesta);
    return true;
  }

  /**
   * Acredita la ganancia al saldo cuando una apuesta se gana.
   * @param {Apuesta} apuesta
   */
  acreditarGanancia(apuesta) {
    if (apuesta.estado !== 'ganada') return;
    this.saldo += apuesta.calcularGanancia();
  }

  /**
   * Devuelve el historial filtrado por estado.
   * @param {'todos'|'pendiente'|'ganada'|'perdida'} filtro
   * @returns {Apuesta[]}
   */
  getHistorial(filtro = 'todos') {
    if (filtro === 'todos') return [...this.historial];
    return this.historial.filter(a => a.estado === filtro);
  }

  /**
   * Saldo formateado en pesos colombianos.
   * @returns {string}
   */
  getSaldoFormateado() {
    return `$${this.saldo.toLocaleString('es-CO')}`;
  }

  /**
   * Estadísticas resumidas del historial.
   * @returns {{ total, ganadas, perdidas, pendientes }}
   */
  getEstadisticas() {
    return {
      total:     this.historial.length,
      ganadas:   this.historial.filter(a => a.estado === 'ganada').length,
      perdidas:  this.historial.filter(a => a.estado === 'perdida').length,
      pendientes:this.historial.filter(a => a.estado === 'pendiente').length,
    };
  }
}
