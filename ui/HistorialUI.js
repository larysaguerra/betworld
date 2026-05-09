/**
 * ui/HistorialUI.js
 * ─────────────────────────────────────────────
 * Renderiza el panel de historial de apuestas.
 * Permite filtrar por estado (todos/pendiente/ganada/perdida).
 */
class HistorialUI {
  /**
   * @param {SistemaApuestas} sistema
   */
  constructor(sistema) {
    this.sistema   = sistema;
    this.$panel    = document.getElementById('historialPanel');
    this.$items    = document.getElementById('historialItems');
    this.$filtros  = document.getElementById('historialFiltros');
    this._filtroActivo = 'todos';

    this.$filtros.addEventListener('click', e => {
      const btn = e.target.closest('.hfiltro');
      if (!btn) return;
      this.$filtros.querySelectorAll('.hfiltro').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this._filtroActivo = btn.dataset.estado;
      this.render();
    });
  }

  render() {
    this.$items.innerHTML = '';
    const lista = this.sistema.usuarioActivo.getHistorial(this._filtroActivo);

    if (lista.length === 0) {
      const empty = document.createElement('div');
      empty.classList.add('carrito-empty');
      empty.innerHTML = '<span class="empty-ico">📋</span>No hay apuestas en esta categoría.';
      this.$items.appendChild(empty);
      return;
    }

    [...lista].reverse().forEach(apuesta => {
      this.$items.appendChild(this._renderItem(apuesta));
    });
  }

  _renderItem(apuesta) {
    const item = document.createElement('div');
    item.classList.add('hist-item');

    const top = document.createElement('div');
    top.classList.add('hist-top');

    const partido = document.createElement('span');
    partido.classList.add('hist-partido');
    partido.textContent = apuesta.partido.getNombre();

    const estadoBadge = document.createElement('span');
    estadoBadge.classList.add('hist-estado', apuesta.estado);
    estadoBadge.textContent = apuesta.estado.toUpperCase();

    top.append(partido, estadoBadge);

    const bottom = document.createElement('div');
    bottom.classList.add('hist-bottom');

    const tipo = document.createElement('span');
    tipo.classList.add('hist-tipo');
    tipo.textContent = `${apuesta.getTipoLabel()} · ${apuesta.fecha}`;

    const montos = document.createElement('span');
    montos.classList.add('hist-montos');
    const gananciaTexto = apuesta.estado === 'ganada'
      ? `+$${apuesta.calcularGanancia().toLocaleString('es-CO')}`
      : `-$${apuesta.monto.toLocaleString('es-CO')}`;
    montos.textContent = `Apostado: $${apuesta.monto.toLocaleString('es-CO')} · ${gananciaTexto}`;

    bottom.append(tipo, montos);
    item.append(top, bottom);
    return item;
  }

  abrir() {
    this.render();
    this.$panel.classList.add('open');
    document.getElementById('overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  cerrar() {
    this.$panel.classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
    document.body.style.overflow = '';
  }
}
