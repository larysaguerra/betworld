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

const USERS_STORAGE_KEY  = 'betworld_users';
const ACTIVE_USER_KEY    = 'betworld_active_user';

const partidos = PARTIDOS_DATA.map(d => new Partido(d));
const guestUsuario = new Usuario('guest', 'Invitado', 0);

let usuario = guestUsuario;
let sistema = new SistemaApuestas(usuario, partidos);

const carritoUI   = new CarritoUI(sistema);
const historialUI = new HistorialUI(sistema);

let filtroActivo  = 'all';
let queryBusqueda = '';

function obtenerUsuariosRegistrados() {
  return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '[]');
}

function guardarUsuariosRegistrados(usuarios) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usuarios));
}

function obtenerSesionActiva() {
  return localStorage.getItem(ACTIVE_USER_KEY);
}

function guardarSesionActiva(id) {
  if (id) localStorage.setItem(ACTIVE_USER_KEY, id);
  else localStorage.removeItem(ACTIVE_USER_KEY);
}

function crearSesion(usuarioData) {
  if (usuarioData && usuarioData.id !== 'guest') {
    usuario = Usuario.fromData(usuarioData);
  } else {
    usuario = guestUsuario;
  }

  sistema.usuarioActivo = usuario;
  sistema.vaciarBoleto();

  actualizarZonaUsuario();
  carritoUI.render();
  historialUI.render();
  actualizarSaldo();
}

function actualizarZonaUsuario() {
  const greeting = document.getElementById('userGreeting');
  const btnLogin = document.getElementById('btnLogin');
  const btnRegister = document.getElementById('btnRegister');
  const btnLogout = document.getElementById('btnLogout');

  greeting.textContent = usuario.id === 'guest'
    ? 'Invitado · inicia sesión para apostar'
    : `Hola, ${usuario.nombre}`;

  btnLogin.hidden = usuario.id !== 'guest';
  btnRegister.hidden = usuario.id !== 'guest';
  btnLogout.hidden = usuario.id === 'guest';
}

function mostrarAuthModal(tab = 'login') {
  document.getElementById('authModal').classList.add('show');
  document.getElementById('overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
  cambiarAuthTab(tab);
  mostrarAuthMessage('');
}

function cerrarAuthModal() {
  document.getElementById('authModal').classList.remove('show');
  if (!document.getElementById('carritoPanel').classList.contains('open') &&
      !document.getElementById('historialPanel').classList.contains('open')) {
    document.getElementById('overlay').classList.remove('show');
  }
  document.body.style.overflow = '';
}

function cambiarAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(button => {
    button.classList.toggle('active', button.dataset.tab === tab);
  });
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.toggle('active', form.id === `${tab}Form`);
  });
  document.getElementById('authTitle').textContent =
    tab === 'login' ? 'Inicia sesión en BETWORLD' : 'Crea tu cuenta gratuita';
  document.getElementById('authSubtitle').textContent =
    tab === 'login'
      ? 'Accede con tu usuario y contraseña para apostar en el Mundial 2026.'
      : 'Regístrate y recibe saldo virtual para comenzar a apostar.';
}

function mostrarAuthMessage(mensaje, color = 'var(--red)') {
  const target = document.getElementById('authMessage');
  target.textContent = mensaje;
  target.style.color = color;
}

function autenticarUsuario(nombre, password) {
  const usuarios = obtenerUsuariosRegistrados();
  const usuarioEncontrado = usuarios.find(u =>
    u.nombre.toLowerCase() === nombre.trim().toLowerCase() && u.password === password
  );

  if (!usuarioEncontrado) {
    return { ok: false, mensaje: 'Usuario o contraseña incorrectos.' };
  }

  return { ok: true, usuario: usuarioEncontrado };
}

function registrarUsuario(nombre, password, confirmar) {
  const nombreLimpio = nombre.trim();

  if (!nombreLimpio || !password) {
    return { ok: false, mensaje: 'Completa todos los campos para registrarte.' };
  }
  if (password !== confirmar) {
    return { ok: false, mensaje: 'Las contraseñas no coinciden.' };
  }

  const usuarios = obtenerUsuariosRegistrados();
  const existe = usuarios.some(u => u.nombre.toLowerCase() === nombreLimpio.toLowerCase());
  if (existe) {
    return { ok: false, mensaje: 'Ese usuario ya existe. Elige otro nombre.' };
  }

  const nuevoUsuario = {
    id: `u_${Date.now()}`,
    nombre: nombreLimpio,
    password,
    saldo: 500000,
  };

  usuarios.push(nuevoUsuario);
  guardarUsuariosRegistrados(usuarios);

  return { ok: true, usuario: nuevoUsuario };
}

// ── 2. ESTADO DE LA VISTA ────────────────────────────────────────────

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

function actualizarSaldo() {
  const el = document.getElementById('saldoValor');
  el.textContent = usuario.getSaldoFormateado();
  el.classList.add('anim');
  el.addEventListener('animationend', () => el.classList.remove('anim'), { once: true });
}

function mostrarModal(icono, titulo, mensaje) {
  document.getElementById('modalIcon').textContent   = icono;
  document.getElementById('modalTitulo').textContent = titulo;
  document.getElementById('modalMsg').innerHTML      = mensaje;
  document.getElementById('modal').classList.add('show');
}

function cerrarModal() {
  document.getElementById('modal').classList.remove('show');
}

sistema.on('boletoActualizado',    () => carritoUI.render());
sistema.on('saldoActualizado',     () => actualizarSaldo());
sistema.on('historialActualizado', () => historialUI.render());
sistema.on('catalogoActualizado',  () => renderCatalogo());

carritoUI.render();

function iniciarApp() {
  let usuarios = obtenerUsuariosRegistrados();

  if (usuarios.length === 0) {
    usuarios = [{
      id: 'u001',
      nombre: 'BetPlayer',
      password: 'bet2026',
      saldo: 500000,
    }];
    guardarUsuariosRegistrados(usuarios);
  }

  const activeId = obtenerSesionActiva();
  const usuarioActivo = usuarios.find(u => u.id === activeId);
  crearSesion(usuarioActivo || null);

  if (usuario.id === 'guest') {
    mostrarAuthModal('login');
  } else {
    renderCatalogo();
  }
}

function requiereSesion(action) {
  if (usuario.id === 'guest') {
    mostrarAuthModal('login');
    return false;
  }
  return action();
}

// ── 3. EVENT LISTENERS ─────────────────────────────────────────────

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

document.getElementById('btnCarrito').addEventListener('click', () => {
  if (usuario.id === 'guest') {
    mostrarAuthModal('login');
    return;
  }
  carritoUI.abrir();
});

document.getElementById('carritoClose').addEventListener('click', () => carritoUI.cerrar());

document.getElementById('btnHistorial').addEventListener('click', () => {
  if (usuario.id === 'guest') {
    mostrarAuthModal('login');
    return;
  }
  historialUI.abrir();
});

document.getElementById('historialClose').addEventListener('click', () => historialUI.cerrar());

document.getElementById('btnLogin').addEventListener('click', () => mostrarAuthModal('login'));

document.getElementById('btnRegister').addEventListener('click', () => mostrarAuthModal('register'));

document.getElementById('btnLogout').addEventListener('click', () => {
  guardarSesionActiva(null);
  crearSesion(null);
  renderCatalogo();
  mostrarModal('👋', 'Sesión cerrada', 'Has salido de tu cuenta. Vuelve cuando quieras.');
});

document.getElementById('authClose').addEventListener('click', cerrarAuthModal);

document.getElementById('authTabLogin').addEventListener('click', () => cambiarAuthTab('login'));

document.getElementById('authTabRegister').addEventListener('click', () => cambiarAuthTab('register'));

document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();

  const nombre = document.getElementById('loginUsuario').value;
  const password = document.getElementById('loginPassword').value;

  const resultado = autenticarUsuario(nombre, password);
  if (!resultado.ok) {
    mostrarAuthMessage(resultado.mensaje);
    return;
  }

  guardarSesionActiva(resultado.usuario.id);
  crearSesion(resultado.usuario);
  cerrarAuthModal();
  renderCatalogo();
  mostrarModal('✅', '¡Bienvenido!', `Has iniciado sesión como <strong>${resultado.usuario.nombre}</strong>.`);
});

document.getElementById('registerForm').addEventListener('submit', e => {
  e.preventDefault();

  const nombre = document.getElementById('registerUsuario').value;
  const password = document.getElementById('registerPassword').value;
  const confirmar = document.getElementById('registerPasswordConfirm').value;

  const resultado = registrarUsuario(nombre, password, confirmar);
  if (!resultado.ok) {
    mostrarAuthMessage(resultado.mensaje);
    return;
  }

  guardarSesionActiva(resultado.usuario.id);
  crearSesion(resultado.usuario);
  cerrarAuthModal();
  renderCatalogo();
  mostrarModal('🎉', 'Cuenta creada', `Bienvenido <strong>${resultado.usuario.nombre}</strong>. Ya tienes $${resultado.usuario.saldo.toLocaleString('es-CO')} para apostar.`);
});

document.getElementById('overlay').addEventListener('click', () => {
  carritoUI.cerrar();
  historialUI.cerrar();
  cerrarAuthModal();
});

document.getElementById('btnConfirmar').addEventListener('click', () => {
  if (usuario.id === 'guest') {
    mostrarAuthModal('login');
    return;
  }

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

iniciarApp();
console.log('🏆 BETWORLD 2026 iniciado correctamente.');
console.log('   Usuario:', usuario.nombre, '| Saldo:', usuario.getSaldoFormateado());
console.log('   Partidos cargados:', partidos.length);

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
