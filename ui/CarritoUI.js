/**
 * ui/CarritoUI.js
 * ─────────────────────────────────────────────
 * Renderiza el panel lateral del Boleto.
 * Usa Event Delegation para botones de eliminar.
 */
class CarritoUI {
  /**
   * @param {SistemaApuestas} sistema
   */
  constructor(sistema) {
    this.sistema   = sistema;
    this.$panel    = document.getElementById('carritoPanel');
    this.$items    = document.getElementById('carritoItems');
    this.$total    = document.getElementById('carritoTotal');
    this.$badge    = document.getElementById('carritoBadge');

    this.$items.addEventListener('click', e => {
      const removeBtn = e.target.closest('.ci-remove');
      if (removeBtn) {
        this.sistema.eliminarDelBoleto(removeBtn.dataset.id);
      }
    });
  }

  render() {
    this.$items.innerHTML = '';
    const apuestas = this.sistema.apuestas;

    if (apuestas.length === 0) {
      const empty = document.createElement('div');
      empty.classList.add('carrito-empty');
      empty.innerHTML = '<span class="empty-ico">🎫</span>Tu boleto está vacío.<br/>Selecciona cuota y monto en un partido.';
      this.$items.appendChild(empty);
      this.$total.textContent = '$0';
      this.$badge.textContent = '0';
      return;
    }

    apuestas.forEach(apuesta => {
      this.$items.appendChild(this._renderItem(apuesta));
    });

    const total = this.sistema.getTotalBoleto().toLocaleString('es-CO');
    this.$total.textContent = `$${total}`;
    this.$badge.textContent = apuestas.length;
  }

  _renderItem(apuesta) {
    const item = document.createElement('div');
    item.classList.add('carrito-item');
    item.dataset.id = apuesta.id;

    const top = document.createElement('div');
    top.classList.add('ci-top');

    const info = document.createElement('div');

    const partido = document.createElement('div');
    partido.classList.add('ci-partido');
    partido.textContent = apuesta.partido.getNombre();

    const tipo = document.createElement('div');
    tipo.classList.add('ci-tipo');
    tipo.textContent = apuesta.getTipoLabel();

    info.append(partido, tipo);

    const monto = document.createElement('div');
    monto.classList.add('ci-monto');
    monto.textContent = `$${apuesta.monto.toLocaleString('es-CO')}`;

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('ci-remove');
    removeBtn.dataset.id = apuesta.id;
    removeBtn.title = 'Eliminar';
    removeBtn.textContent = '✕';

    top.append(info, monto, removeBtn);

    const bottom = document.createElement('div');
    bottom.classList.add('ci-bottom');

    const cuota = document.createElement('span');
    cuota.classList.add('ci-cuota');
    cuota.textContent = `Cuota ×${apuesta.cuota.toFixed(2)}`;

    const ganancia = document.createElement('span');
    ganancia.classList.add('ci-ganancia');
    ganancia.textContent = `💰 Ganarías $${apuesta.calcularGanancia().toLocaleString('es-CO')}`;

    bottom.append(cuota, ganancia);
    item.append(top, bottom);
    return item;
  }

  abrir() {
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
