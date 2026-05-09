/**
 * classes/SistemaApuestas.js
 * ─────────────────────────────────────────────
 * Controlador central de la aplicación.
 * Orquesta usuarios, partidos y apuestas.
 * Aplica el patrón Facade sobre las clases de dominio.
 */
class SistemaApuestas {
  /**
   * @param {Usuario}  usuario  - Usuario activo en sesión
   * @param {Partido[]} partidos - Catálogo de partidos cargado
   */
  constructor(usuario, partidos) {
    this.usuarioActivo = usuario;
    this.partidos      = partidos;
    this.apuestas      = [];       // Apuestas pendientes (boleto actual)
    this._listeners    = {};       // Suscriptores de eventos internos
  }

  // ─── GESTIÓN DE PARTIDOS ─────────────────────

  /**
   * Devuelve partidos filtrados por fase y búsqueda.
   * @param {string} fase   - 'all' | 'grupo' | 'octavos' …
   * @param {string} query  - Texto de búsqueda
   * @returns {Partido[]}
   */
  getPartidos(fase = 'all', query = '') {
    return this.partidos.filter(p => {
      const matchFase  = fase === 'all' || p.fase === fase;
      const haystack   = (p.getNombre() + p.fase).toLowerCase();
      const matchQuery = haystack.includes(query.toLowerCase().trim());
      return matchFase && matchQuery;
    });
  }

  /**
   * Registra el resultado de un partido y resuelve sus apuestas.
   * @param {string} partidoId
   * @param {'local'|'empate'|'visitante'} resultadoTipo
   * @param {string} resultadoTexto - Ej: '2 - 1'
   */
  resolverPartido(partidoId, resultadoTipo, resultadoTexto) {
    const partido = this.partidos.find(p => p.id === partidoId);
    if (!partido) return;
    partido.setResultado(resultadoTexto);

    const apuestasPartido = this.usuarioActivo.historial
      .filter(a => a.partido.id === partidoId);

    apuestasPartido.forEach(a => {
      a.resolver(resultadoTipo);
      if (a.estado === 'ganada') {
        this.usuarioActivo.acreditarGanancia(a);
      }
    });

    this._emit('saldoActualizado');
    this._emit('historialActualizado');
    this._emit('catalogoActualizado');
  }

  // ─── GESTIÓN DEL BOLETO (carrito) ────────────

  /**
   * Agrega una apuesta al boleto actual.
   * @param {Partido}                        partido
   * @param {'local'|'empate'|'visitante'}   tipo
   * @param {number}                         monto
   * @returns {{ ok: boolean, mensaje: string }}
   */
  agregarAlBoleto(partido, tipo, monto) {
    if (this.usuarioActivo.id === 'guest') {
      return { ok: false, mensaje: 'Debes iniciar sesión para apostar.' };
    }
    if (!partido.estaDisponible()) {
      return { ok: false, mensaje: 'Este partido no acepta apuestas.' };
    }
    if (monto <= 0 || isNaN(monto)) {
      return { ok: false, mensaje: 'El monto debe ser mayor a $0.' };
    }
    if (monto > this.usuarioActivo.saldo) {
      return { ok: false, mensaje: 'Saldo insuficiente para esta apuesta.' };
    }

    const existe = this.apuestas.find(
      a => a.partido.id === partido.id && a.tipo === tipo
    );
    if (existe) {
      return { ok: false, mensaje: 'Ya tienes esta apuesta en el boleto.' };
    }

    const apuesta = new Apuesta(this.usuarioActivo, partido, tipo, monto);
    this.apuestas.push(apuesta);
    this._emit('boletoActualizado');
    return { ok: true, mensaje: 'Apuesta agregada al boleto.' };
  }

  /**
   * Elimina una apuesta del boleto por su ID.
   * @param {string} apuestaId
   */
  eliminarDelBoleto(apuestaId) {
    this.apuestas = this.apuestas.filter(a => a.id !== apuestaId);
    this._emit('boletoActualizado');
  }

  /**
   * Confirma todas las apuestas del boleto y las mueve al historial.
   * @returns {{ ok: boolean, mensaje: string, totalApostado: number }}
   */
  confirmarBoleto() {
    if (this.usuarioActivo.id === 'guest') {
      return { ok: false, mensaje: 'Debes iniciar sesión para confirmar tu boleto.' };
    }
    if (this.apuestas.length === 0) {
      return { ok: false, mensaje: 'El boleto está vacío.' };
    }

    const totalApostado = this.getTotalBoleto();

    if (totalApostado > this.usuarioActivo.saldo) {
      return { ok: false, mensaje: 'Saldo insuficiente para confirmar.' };
    }

    this.apuestas.forEach(a => {
      this.usuarioActivo.registrarApuesta(a);
    });

    const resumen = {
      ok: true,
      mensaje: `${this.apuestas.length} apuesta(s) confirmada(s).`,
      totalApostado,
    };

    this.apuestas = [];
    this._emit('boletoActualizado');
    this._emit('saldoActualizado');
    this._emit('historialActualizado');
    return resumen;
  }

  /**
   * Vacía el boleto sin confirmar.
   */
  vaciarBoleto() {
    this.apuestas = [];
    this._emit('boletoActualizado');
  }

  /**
   * Suma total del boleto actual.
   * @returns {number}
   */
  getTotalBoleto() {
    return this.apuestas.reduce((s, a) => s + a.monto, 0);
  }

  // ─── SISTEMA DE EVENTOS INTERNO ──────────────

  on(evento, callback) {
    if (!this._listeners[evento]) this._listeners[evento] = [];
    this._listeners[evento].push(callback);
  }

  _emit(evento) {
    (this._listeners[evento] || []).forEach(fn => fn());
  }
}
