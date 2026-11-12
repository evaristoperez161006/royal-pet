// ================= UTILIDADES COMPARTIDAS (todas las páginas) =================

// ---------- Seguridad ----------
// Escapa texto antes de insertarlo con innerHTML (evita inyección de HTML/JS)
function escaparHtml(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

// ---------- Alertas animadas ----------
function mostrarAlerta(tipo, titulo, mensaje) {
  const contenedor = document.getElementById('toastContainer');
  if (!contenedor) {
    alert(`${titulo}: ${mensaje}`);
    return;
  }

  const iconos = {
    error: 'fa-circle-exclamation',
    warning: 'fa-triangle-exclamation',
    success: 'fa-circle-check'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.innerHTML = `
    <i class="fa-solid ${iconos[tipo] || 'fa-circle-info'} toast-icon"></i>
    <div class="toast-content">
      <h4>${escaparHtml(titulo)}</h4>
      <p>${escaparHtml(mensaje)}</p>
    </div>
  `;

  contenedor.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4200);
}

// ---------- Modales ----------
function abrirModal(idModal, titulo = null) {
  const modal = document.getElementById(idModal);
  if (!modal) return;
  if (titulo) {
    const tituloEl = modal.querySelector('.modal-title');
    if (tituloEl) tituloEl.textContent = titulo;
  }
  modal.classList.add('open');
}

function cerrarModal(idModal) {
  const modal = document.getElementById(idModal);
  if (modal) modal.classList.remove('open');
}

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach((m) => m.classList.remove('open'));
  }
});

// ---------- Formularios ----------
function resaltarError(input) {
  input.classList.remove('shake-error');
  void input.offsetWidth; // Reinicia la animación
  input.classList.add('shake-error');
  input.focus();
}

// Letras (con acentos y ü), espacios, punto, guion y apóstrofo
const REGEX_NOMBRE = /^[\p{L}][\p{L}.'\-\s]*$/u;
const REGEX_TELEFONO = /^\d{10}$/;
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Vista previa + validación (tipo y tamaño) del archivo adjunto
function configurarInputArchivo(inputArchivo, preview) {
  if (!inputArchivo || !preview) return;

  inputArchivo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      preview.textContent = 'Ningún archivo seleccionado';
      return;
    }

    const tiposValidos = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!tiposValidos.includes(file.type)) {
      mostrarAlerta('error', 'Archivo no válido', 'Solo se permiten documentos PDF, JPG o PNG.');
      inputArchivo.value = '';
      preview.textContent = 'Ningún archivo seleccionado';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      mostrarAlerta('warning', 'Archivo muy pesado', 'El archivo no debe superar los 5 MB.');
      inputArchivo.value = '';
      preview.textContent = 'Ningún archivo seleccionado';
      return;
    }

    preview.textContent = `Seleccionado: ${file.name}`;
  });
}

// HTML de la celda "Archivo" de las tablas
function celdaArchivo(nombreArchivo) {
  return nombreArchivo
    ? `<span class="badge-file"><i class="fa-solid fa-file-lines"></i> ${escaparHtml(nombreArchivo)}</span>`
    : '<span style="color:#94a3b8; font-size:0.82rem;">Sin archivo</span>';
}

// ---------- Persistencia (localStorage) ----------
// Los datos sobreviven al cambiar de página o recargar el navegador.
function cargarDatos(clave, datosIniciales) {
  try {
    const guardado = localStorage.getItem(clave);
    if (guardado) return JSON.parse(guardado);
  } catch (err) {
    console.warn(`No se pudo leer "${clave}" de localStorage`, err);
  }
  return datosIniciales;
}

function guardarDatos(clave, datos) {
  try {
    localStorage.setItem(clave, JSON.stringify(datos));
  } catch (err) {
    console.warn(`No se pudo guardar "${clave}" en localStorage`, err);
  }
}

function siguienteId(lista) {
  return lista.length > 0 ? Math.max(...lista.map((item) => item.id)) + 1 : 1;
}
