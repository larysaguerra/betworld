/**
 * classes/Partido.js
 * ─────────────────────────────────────────────
 * Representa un partido del Mundial 2026.
 * Encapsula equipos, cuotas, estado y resultado.
 */
class Partido {
  /**
   * @param {Object} data - Objeto plano desde data.js
   */
  constructor(data) {
    this.id             = data.id;
    this.equipoLocal    = data.equipoLocal;      // { nombre, emoji }
    this.equipoVisitante= data.equipoVisitante;  // { nombre, emoji }
    this.fecha          = data.fecha;
    this.fase           = data.fase;             // 'grupo'|'octavos'|'cuartos'|'semis'|'final'
    this.cuotas         = data.cuotas;           // { local, empate, visitante }
    this.estado         = data.estado;           // 'proximo'|'en-vivo'|'finalizado'
    this.resultado      = data.resultado;        // null | '2 - 1'
  }

  /**
   * Devuelve la cuota según el tipo de apuesta.
   * @param {'local'|'empate'|'visitante'} tipo
   * @returns {number}
   */
  getCuota(tipo) {
    if (!this.cuotas[tipo]) throw new Error(`Tipo de cuota inválido: ${tipo}`);
    return this.cuotas[tipo];
  }

  /**
   * Registra el resultado y cambia el estado a finalizado.
   * @param {string} resultado - Ej: '2 - 1'
   */
  setResultado(resultado) {
    this.resultado = resultado;
    this.estado    = 'finalizado';
  }

  /**
   * Devuelve el nombre completo del partido.
   * @returns {string}
   */
  getNombre() {
    return `${this.equipoLocal.nombre} vs ${this.equipoVisitante.nombre}`;
  }

  /**
   * Indica si el partido puede recibir apuestas.
   * @returns {boolean}
   */
  estaDisponible() {
    return this.estado === 'proximo';
  }
}
