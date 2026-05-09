/**
 * ui/PartidoCard.js
 * ─────────────────────────────────────────────
 * Genera y renderiza dinámicamente la tarjeta
 * de cada partido usando createElement.
 * Responsabilidad: solo presentación + eventos de card.
 */
class PartidoCard {
  /**
   * @param {Partido}        partido
   * @param {SistemaApuestas} sistema
   */
  constructor(partido, sistema) {
    this.partido = partido;
    this.sistema = sistema;
    this._tipoSeleccionado = null;
  }

  render() {
    const card = document.createElement('article');
    card.classList.add('partido-card');
    card.dataset.partidoId = this.partido.id;

    card.appendChild(this._renderHeader());
    card.appendChild(this._renderEquipos());
    card.appendChild(this._renderCuotas());
    card.appendChild(this._renderMonto());

    return card;
  }

  _renderHeader() {
    const header = document.createElement('div');
    header.classList.add('card-header');

    const fase = document.createElement('span');
    fase.classList.add('card-fase', `fase-${this.partido.fase}`);
    fase.textContent = this._labelFase(this.partido.fase);

    const fecha = document.createElement('span');
    fecha.classList.add('card-fecha');
    fecha.textContent = this.partido.fecha;

    const estado = document.createElement('span');
    estado.classList.add('card-estado', `estado-${this.partido.estado}`);
    estado.textContent = this._labelEstado(this.partido.estado);

    header.append(fase, fecha, estado);
    return header;
  }

  _renderEquipos() {
    const wrap = document.createElement('div');
    wrap.classList.add('card-equipos');

    const local     = this._crearEquipo(this.partido.equipoLocal);
    const visitante = this._crearEquipo(this.partido.equipoVisitante);

    const centro = document.createElement('div');
    if (this.partido.resultado) {
      centro.classList.add('resultado-badge');
      centro.textContent = this.partido.resultado;
    } else {
      centro.classList.add('vs-badge');
      centro.textContent = 'VS';
    }

    wrap.append(local, centro, visitante);
    return wrap;
  }

  _crearEquipo(equipo) {
    const div = document.createElement('div');
    div.classList.add('equipo');

    const emoji = document.createElement('span');
    emoji.classList.add('equipo-emoji');
    emoji.textContent = equipo.emoji;

    const nombre = document.createElement('span');
    nombre.classList.add('equipo-nombre');
    nombre.textContent = equipo.nombre;

    div.append(emoji, nombre);
    return div;
  }

  _renderCuotas() {
    const wrap = document.createElement('div');
    wrap.classList.add('card-cuotas');

    const tipos = [
      { key: 'local',     label: 'Local' },
      { key: 'empate',    label: 'Empate' },
      { key: 'visitante', label: 'Visitante' },
    ];

    tipos.forEach(({ key, label }) => {
      const btn = document.createElement('button');
      btn.classList.add('cuota-btn');
      btn.dataset.tipo = key;

      const tipoEl = document.createElement('span');
      tipoEl.classList.add('cuota-tipo');
      tipoEl.textContent = label;

      const valorEl = document.createElement('span');
      valorEl.classList.add('cuota-valor');
      valorEl.textContent = `×${this.partido.getCuota(key).toFixed(2)}`;

      btn.append(tipoEl, valorEl);

      if (!this.partido.estaDisponible()) {
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => this._seleccionarTipo(key, wrap));
      }

      wrap.appendChild(btn);
    });

    return wrap;
  }

  _renderMonto() {
    const input = document.createElement('input');
    input.type        = 'number';
    input.min         = '1000';
    input.step        = '1000';
    input.placeholder = 'Monto ($)';
    input.classList.add('monto-input');
    input.disabled    = !this.partido.estaDisponible();

    const preview = document.createElement('p');
    preview.classList.add('ganancia-preview');

    input.addEventListener('input', () => {
      const monto = parseInt(input.value, 10);
      if (this._tipoSeleccionado && monto > 0) {
        const cuota    = this.partido.getCuota(this._tipoSeleccionado);
        const ganancia = Math.round(monto * cuota).toLocaleString('es-CO');
        preview.textContent = `💰 Ganarías: $${ganancia}`;
      } else {
        preview.textContent = '';
      }
    });

    const btn = document.createElement('button');
    btn.classList.add('btn-apostar');
    btn.textContent = '+ Boleto';
    btn.disabled    = !this.partido.estaDisponible();

    btn.addEventListener('click', () => {
      const monto = parseInt(input.value, 10);
      if (!this._tipoSeleccionado) {
        preview.textContent = '⚠️ Elige Local, Empate o Visitante.';
        preview.style.color = 'var(--red)';
        return;
      }

      const resultado = this.sistema.agregarAlBoleto(
        this.partido, this._tipoSeleccionado, monto
      );

      if (resultado.ok) {
        btn.textContent = '✓ Agregado';
        btn.classList.add('agregado');
        preview.textContent = '';
        preview.style.color = '';
        input.value = '';
        this._tipoSeleccionado = null;

        const cuotasWrap = btn.closest('article').querySelector('.card-cuotas');
        if (cuotasWrap) cuotasWrap.querySelectorAll('.cuota-btn').forEach(b => b.classList.remove('selected'));

        setTimeout(() => {
          btn.textContent = '+ Boleto';
          btn.classList.remove('agregado');
        }, 1500);
      } else {
        preview.textContent = `⚠️ ${resultado.mensaje}`;
        preview.style.color = 'var(--red)';
      }
    });

    const wrap = document.createElement('div');
    wrap.classList.add('card-monto');
    wrap.append(input, btn);

    const outer = document.createElement('div');
    outer.appendChild(wrap);
    outer.appendChild(preview);
    return outer;
  }

  _seleccionarTipo(tipo, cuotasWrap) {
    this._tipoSeleccionado = tipo;
    cuotasWrap.querySelectorAll('.cuota-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.tipo === tipo);
    });
  }

  _labelFase(fase) {
    const map = {
      grupo: 'Fase de Grupos', octavos: 'Octavos',
      cuartos: 'Cuartos', semis: 'Semifinal', final: 'Gran Final',
    };
    return map[fase] || fase;
  }

  _labelEstado(estado) {
    const map = {
      proximo:    '📅 Próximo',
      'en-vivo':  '🔴 En Vivo',
      finalizado: '✅ Finalizado',
    };
    return map[estado] || estado;
  }
}
