// ================= MÓDULO SERVICIOS (mantenerServicios.html) =================
const CLAVE_SERVICIOS = 'royalpet_servicios';

let servicios = cargarDatos(CLAVE_SERVICIOS, [
  {
    id: 1,
    nombre: 'Consulta Médica General',
    categoria: 'Clínica',
    duracion: '30 min',
    costo: 350.00,
    descripcion: 'Revisión física completa, toma de temperatura y diagnóstico primario.',
    archivo: 'Protocolo_Consulta.pdf'
  },
  {
    id: 2,
    nombre: 'Baño y Corte de Pelo',
    categoria: 'Estética',
    duracion: '1 hora',
    costo: 450.00,
    descripcion: 'Incluye baño con shampoo medicado, secado, corte de raza y limpieza de oídos.',
    archivo: ''
  }
]);

function filtrarServicios() {
  const input = document.getElementById('buscarServicio');
  const texto = input ? input.value.toLowerCase().trim() : '';
  return servicios.filter((s) =>
    s.nombre.toLowerCase().includes(texto) ||
    s.categoria.toLowerCase().includes(texto) ||
    s.descripcion.toLowerCase().includes(texto)
  );
}

function renderizarServicios(lista = servicios) {
  const tbody = document.getElementById('tablaServicios');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding: 2rem; color: #64748b;">
          No se encontraron servicios registrados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = lista.map((s) => `
    <tr>
      <td><strong>#${s.id}</strong></td>
      <td><strong>${escaparHtml(s.nombre)}</strong></td>
      <td><span class="badge-turno" style="background:#f0fdf4; color:#047857;">${escaparHtml(s.categoria)}</span></td>
      <td>${escaparHtml(s.duracion)}</td>
      <td><strong>$${Number(s.costo).toFixed(2)}</strong></td>
      <td>${escaparHtml(s.descripcion)}</td>
      <td>${celdaArchivo(s.archivo)}</td>
      <td class="actions-cell">
        <button class="btn-icon btn-edit" title="Editar" onclick="editarServicio(${s.id})">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-icon btn-delete" title="Eliminar" onclick="eliminarServicio(${s.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function guardarServicio(e) {
  e.preventDefault();

  const idEditando = document.getElementById('servId').value;
  const elNombre = document.getElementById('servNombre');
  const elCategoria = document.getElementById('servCategoria');
  const elDuracion = document.getElementById('servDuracion');
  const elCosto = document.getElementById('servCosto');
  const elDescripcion = document.getElementById('servDescripcion');
  const archivoFile = document.getElementById('servArchivo').files[0];

  const nombre = elNombre.value.trim();
  const categoria = elCategoria.value;
  const duracion = elDuracion.value.trim();
  const costo = parseFloat(elCosto.value);
  const descripcion = elDescripcion.value.trim();

  // 1. Campos obligatorios
  if (!nombre) {
    resaltarError(elNombre);
    return mostrarAlerta('error', 'Campo obligatorio', 'Debes ingresar el nombre del servicio.');
  }
  if (!categoria) {
    resaltarError(elCategoria);
    return mostrarAlerta('error', 'Campo obligatorio', 'Selecciona una categoría.');
  }
  if (!duracion) {
    resaltarError(elDuracion);
    return mostrarAlerta('error', 'Campo obligatorio', 'Indica la duración estimada.');
  }
  if (isNaN(costo) || costo < 0) {
    resaltarError(elCosto);
    return mostrarAlerta('error', 'Costo inválido', 'Ingresa un costo válido en pesos.');
  }
  if (!descripcion) {
    resaltarError(elDescripcion);
    return mostrarAlerta('error', 'Campo obligatorio', 'Ingresa una descripción del servicio.');
  }

  // 2. Duplicados (nombre exacto)
  const duplicado = servicios.some((s) =>
    s.id !== Number(idEditando) && s.nombre.toLowerCase() === nombre.toLowerCase()
  );
  if (duplicado) {
    resaltarError(elNombre);
    return mostrarAlerta('warning', 'Servicio duplicado', 'Ya existe un servicio registrado con ese mismo nombre.');
  }

  // 3. Guardar o actualizar
  if (idEditando) {
    const index = servicios.findIndex((s) => s.id === Number(idEditando));
    if (index !== -1) {
      servicios[index] = {
        ...servicios[index],
        nombre, categoria, duracion, costo, descripcion,
        archivo: archivoFile ? archivoFile.name : servicios[index].archivo
      };
      mostrarAlerta('success', 'Servicio actualizado', `Los datos de ${nombre} se actualizaron correctamente.`);
    }
  } else {
    servicios.push({
      id: siguienteId(servicios),
      nombre, categoria, duracion, costo, descripcion,
      archivo: archivoFile ? archivoFile.name : ''
    });
    mostrarAlerta('success', 'Servicio registrado', `${nombre} fue agregado al catálogo exitosamente.`);
  }

  guardarDatos(CLAVE_SERVICIOS, servicios);
  renderizarServicios(filtrarServicios());
  cerrarModal('modalServicio');
}

function editarServicio(id) {
  const s = servicios.find((item) => item.id === id);
  if (!s) return;

  document.getElementById('servId').value = s.id;
  document.getElementById('servNombre').value = s.nombre;
  document.getElementById('servCategoria').value = s.categoria;
  document.getElementById('servDuracion').value = s.duracion;
  document.getElementById('servCosto').value = s.costo;
  document.getElementById('servDescripcion').value = s.descripcion;
  document.getElementById('servArchivo').value = '';
  document.getElementById('nombreArchivoPreviewServicio').textContent = s.archivo
    ? `Archivo actual: ${s.archivo}`
    : 'Ningún archivo seleccionado';

  abrirModal('modalServicio', 'Editar Servicio');
}

function eliminarServicio(id) {
  const s = servicios.find((item) => item.id === id);
  if (!s) return;

  if (confirm(`¿Estás seguro de eliminar el servicio ${s.nombre}?`)) {
    servicios = servicios.filter((item) => item.id !== id);
    guardarDatos(CLAVE_SERVICIOS, servicios);
    renderizarServicios(filtrarServicios());
    mostrarAlerta('warning', 'Servicio eliminado', `El servicio ${s.nombre} ha sido eliminado del catálogo.`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarServicios();

  const form = document.getElementById('formServicio');
  const preview = document.getElementById('nombreArchivoPreviewServicio');

  configurarInputArchivo(document.getElementById('servArchivo'), preview);

  document.getElementById('btnNuevoServicio').addEventListener('click', () => {
    form.reset();
    document.getElementById('servId').value = '';
    preview.textContent = 'Ningún archivo seleccionado';
    abrirModal('modalServicio', 'Registrar Nuevo Servicio');
  });

  document.getElementById('buscarServicio').addEventListener('input', () => {
    renderizarServicios(filtrarServicios());
  });

  form.addEventListener('submit', guardarServicio);
});
