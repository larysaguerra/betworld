/**
 * app.js
 * ─────────────────────────────────────────────
 * Punto de entrada de la aplicación BETWORLD 2026.
 * Inicializa instancias, conecta UI con lógica
 * y registra todos los event listeners globales.
 *
 * Separación de responsabilidades:
 *   · Clases de dominio → /classes/
 *   · Renderizado UI    → /ui/
 *   · Datos             → /data/data.js
 *   · Orquestación      → este archivo
 */

// ── 1. INICIALIZACIÓN ────────────────────────────────────────────────

const usuario = new Usuario('u001', 'BetPlayer', 500000);
const partidos = PARTIDOS_DATA.map(d => new Partido(d));
const sistema = new SistemaApuestas(usuario, partidos);

const carritoUI   = new CarritoUI(sistema);
const historialUI = new HistorialUI(sistema);

// ── 2. ESTADO DE LA VISTA ────────────────────────────────────────────
let filtroActivo  = 'all';
let queryBusqueda = '';

// ── 3. RENDERIZADO DEL CATÁLOGO ──────────────────────────────────────

function renderCatalogo() {
  const catalog  = document.getElementById('catalog');
  const lista    = sistema.getPartidos(filtroActivo, queryBusqueda);

  catalog.innerHTML = '';

  const searchCount = document.getElementById('searchCount');
  searchCount.textContent = lista.length > 0 ? `${lista.length} partido(s)` : '';

  if (lista.length === 0) {
    const empty = document.createElement('div');
    empty.classList.add('no-results');
    empty.innerHTML = '<span>🔍</span>No se encontraron partidos con esos filtros.';
    catalog.appendChild(empty);
    return;
  }

  lista.forEach((partido, idx) => {
    const card = new PartidoCard(partido, sistema);
    const el   = card.render();
    el.style.animationDelay = `${idx * 40}ms`;
    catalog.appendChild(el);
  });
}

// ── 4. ACTUALIZACIÓN DEL SALDO ───────────────────────────────────────

function actualizarSaldo() {
  const el = document.getElementById('saldoValor');
  el.textContent = usuario.getSaldoFormateado();
  el.classList.add('anim');
  el.addEventListener('animationend', () => el.classList.remove('anim'), { once: true });
}

// ── 5. MODAL ─────────────────────────────────────────────────────────

function mostrarModal(icono, titulo, mensaje) {
  document.getElementById('modalIcon').textContent   = icono;
  document.getElementById('modalTitulo').textContent = titulo;
  document.getElementById('modalMsg').innerHTML      = mensaje;
  document.getElementById('modal').classList.add('show');
}

function cerrarModal() {
  document.getElementById('modal').classList.remove('show');
}

// ── 6. SUSCRIPCIONES ─────────────────────────────────────────────────

sistema.on('boletoActualizado',    () => carritoUI.render());
sistema.on('saldoActualizado',     () => actualizarSaldo());
sistema.on('historialActualizado', () => historialUI.render());
sistema.on('catalogoActualizado',  () => renderCatalogo());

carritoUI.render();

// ── 7. EVENT LISTENERS ───────────────────────────────────────────────

document.getElementById('filterNav').addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  filtroActivo = btn.dataset.filter;
  renderCatalogo();
});

document.getElementById('searchInput').addEventListener('input', e => {
  queryBusqueda = e.target.value;
  renderCatalogo();
});

document.getElementById('btnCarrito').addEventListener('click',   () => carritoUI.abrir());
document.getElementById('carritoClose').addEventListener('click', () => carritoUI.cerrar());

document.getElementById('btnHistorial').addEventListener('click',   () => historialUI.abrir());
document.getElementById('historialClose').addEventListener('click', () => historialUI.cerrar());

document.getElementById('overlay').addEventListener('click', () => {
  carritoUI.cerrar();
  historialUI.cerrar();
});

document.getElementById('btnConfirmar').addEventListener('click', () => {
  const resultado = sistema.confirmarBoleto();
  if (!resultado.ok) {
    mostrarModal('⚠️', 'Atención', resultado.mensaje);
    return;
  }
  carritoUI.cerrar();
  mostrarModal(
    '🏆',
    '¡Apuesta confirmada!',
    `<strong>${resultado.totalApostado.toLocaleString('es-CO')}</strong> pesos apostados.<br/>
     Saldo actual: <strong>${usuario.getSaldoFormateado()}</strong><br/>
     ¡Buena suerte en el Mundial 2026! 🌍`
  );
});

document.getElementById('btnVaciar').addEventListener('click', () => {
  if (sistema.apuestas.length === 0) return;
  if (confirm('¿Seguro que quieres vaciar el boleto?')) {
    sistema.vaciarBoleto();
  }
});

document.getElementById('modalClose').addEventListener('click', cerrarModal);

// ── 8. ARRANQUE ──────────────────────────────────────────────────────
renderCatalogo();
console.log('🏆 BETWORLD 2026 iniciado correctamente.');
console.log('   Usuario:', usuario.nombre, '| Saldo:', usuario.getSaldoFormateado());
console.log('   Partidos cargados:', partidos.length);
