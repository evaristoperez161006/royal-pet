// ================= MÓDULO CLIENTES (mantenerClientes.html) =================
const CLAVE_CLIENTES = 'royalpet_clientes';

let clientes = cargarDatos(CLAVE_CLIENTES, [
  {
    id: 1,
    nombre: 'Alejandro Torres Gómez',
    edad: 34,
    telefono: '5598765432',
    correo: 'alejandro.torres@email.com',
    direccion: 'Av. Central #412, Col. Evolución',
    membresia: 'VIP Royal',
    archivo: 'INE_Alejandro.pdf'
  },
  {
    id: 2,
    nombre: 'María Fernanda López',
    edad: 28,
    telefono: '5543218765',
    correo: 'mafe.lopez@email.com',
    direccion: 'Calle Benito Juárez #89, Nezahualcóyotl',
    membresia: 'Frecuente',
    archivo: ''
  }
]);

function filtrarClientes() {
  const input = document.getElementById('buscarCliente');
  const texto = input ? input.value.toLowerCase().trim() : '';
  return clientes.filter((cli) =>
    cli.nombre.toLowerCase().includes(texto) ||
    cli.telefono.includes(texto) ||
    cli.correo.toLowerCase().includes(texto)
  );
}

function renderizarClientes(lista = clientes) {
  const tbody = document.getElementById('tablaClientes');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; padding: 2rem; color: #64748b;">
          No se encontraron clientes registrados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = lista.map((cli) => `
    <tr>
      <td><strong>#${cli.id}</strong></td>
      <td>${escaparHtml(cli.nombre)}</td>
      <td>${cli.edad} años</td>
      <td>${escaparHtml(cli.telefono)}</td>
      <td>${escaparHtml(cli.correo)}</td>
      <td>${escaparHtml(cli.direccion)}</td>
      <td><span class="badge-turno" style="background:#e0f2fe; color:#0369a1;">${escaparHtml(cli.membresia)}</span></td>
      <td>${celdaArchivo(cli.archivo)}</td>
      <td class="actions-cell">
        <button class="btn-icon btn-edit" title="Editar" onclick="editarCliente(${cli.id})">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-icon btn-delete" title="Eliminar" onclick="eliminarCliente(${cli.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function guardarCliente(e) {
  e.preventDefault();

  const idEditando = document.getElementById('cliId').value;
  const elNombre = document.getElementById('cliNombre');
  const elEdad = document.getElementById('cliEdad');
  const elMembresia = document.getElementById('cliMembresia');
  const elTelefono = document.getElementById('cliTelefono');
  const elCorreo = document.getElementById('cliCorreo');
  const elDireccion = document.getElementById('cliDireccion');
  const archivoFile = document.getElementById('cliArchivo').files[0];

  const nombre = elNombre.value.trim();
  const edad = parseInt(elEdad.value, 10);
  const membresia = elMembresia.value;
  const telefono = elTelefono.value.trim();
  const correo = elCorreo.value.trim().toLowerCase();
  const direccion = elDireccion.value.trim();

  // 1. Campos obligatorios
  if (!nombre) {
    resaltarError(elNombre);
    return mostrarAlerta('error', 'Campo obligatorio', 'Debes ingresar el nombre completo del cliente.');
  }
  if (!elEdad.value) {
    resaltarError(elEdad);
    return mostrarAlerta('error', 'Campo obligatorio', 'Debes indicar la edad del cliente.');
  }
  if (!membresia) {
    resaltarError(elMembresia);
    return mostrarAlerta('error', 'Campo obligatorio', 'Selecciona un tipo de membresía.');
  }
  if (!telefono) {
    resaltarError(elTelefono);
    return mostrarAlerta('error', 'Campo obligatorio', 'Ingresa un número de teléfono.');
  }
  if (!correo) {
    resaltarError(elCorreo);
    return mostrarAlerta('error', 'Campo obligatorio', 'El correo electrónico es obligatorio.');
  }
  if (!direccion) {
    resaltarError(elDireccion);
    return mostrarAlerta('error', 'Campo obligatorio', 'La dirección completa es obligatoria.');
  }

  // 2. Formatos
  if (nombre.length < 3 || !REGEX_NOMBRE.test(nombre)) {
    resaltarError(elNombre);
    return mostrarAlerta('error', 'Nombre inválido', 'El nombre solo debe contener letras y tener al menos 3 caracteres.');
  }
  if (isNaN(edad) || edad < 18 || edad > 100) {
    resaltarError(elEdad);
    return mostrarAlerta('error', 'Edad no permitida', 'El cliente debe tener una edad válida (entre 18 y 100 años).');
  }
  if (!REGEX_TELEFONO.test(telefono)) {
    resaltarError(elTelefono);
    return mostrarAlerta('error', 'Teléfono incorrecto', 'El teléfono debe contener exactamente 10 dígitos numéricos.');
  }
  if (!REGEX_CORREO.test(correo)) {
    resaltarError(elCorreo);
    return mostrarAlerta('error', 'Correo inválido', 'Ingresa una dirección de correo electrónico válida.');
  }

  // 3. Duplicados (correo o teléfono)
  const duplicado = clientes.some((cli) =>
    cli.id !== Number(idEditando) &&
    (cli.correo.toLowerCase() === correo || cli.telefono === telefono)
  );
  if (duplicado) {
    resaltarError(elCorreo);
    return mostrarAlerta('warning', 'Cliente duplicado', 'Ya existe un cliente registrado con ese mismo correo o número telefónico.');
  }

  // 4. Guardar o actualizar
  if (idEditando) {
    const index = clientes.findIndex((cli) => cli.id === Number(idEditando));
    if (index !== -1) {
      clientes[index] = {
        ...clientes[index],
        nombre, edad, membresia, telefono, correo, direccion,
        archivo: archivoFile ? archivoFile.name : clientes[index].archivo
      };
      mostrarAlerta('success', 'Cliente actualizado', `Los datos de ${nombre} se actualizaron correctamente.`);
    }
  } else {
    clientes.push({
      id: siguienteId(clientes),
      nombre, edad, membresia, telefono, correo, direccion,
      archivo: archivoFile ? archivoFile.name : ''
    });
    mostrarAlerta('success', 'Cliente registrado', `${nombre} fue agregado al sistema exitosamente.`);
  }

  guardarDatos(CLAVE_CLIENTES, clientes);
  renderizarClientes(filtrarClientes());
  cerrarModal('modalCliente');
}

function editarCliente(id) {
  const cli = clientes.find((c) => c.id === id);
  if (!cli) return;

  document.getElementById('cliId').value = cli.id;
  document.getElementById('cliNombre').value = cli.nombre;
  document.getElementById('cliEdad').value = cli.edad;
  document.getElementById('cliMembresia').value = cli.membresia;
  document.getElementById('cliTelefono').value = cli.telefono;
  document.getElementById('cliCorreo').value = cli.correo;
  document.getElementById('cliDireccion').value = cli.direccion;
  document.getElementById('cliArchivo').value = '';
  document.getElementById('nombreArchivoPreviewCliente').textContent = cli.archivo
    ? `Archivo actual: ${cli.archivo}`
    : 'Ningún archivo seleccionado';

  abrirModal('modalCliente', 'Editar Datos del Cliente');
}

function eliminarCliente(id) {
  const cli = clientes.find((c) => c.id === id);
  if (!cli) return;

  if (confirm(`¿Estás seguro de eliminar a ${cli.nombre} de los registros?`)) {
    clientes = clientes.filter((c) => c.id !== id);
    guardarDatos(CLAVE_CLIENTES, clientes);
    renderizarClientes(filtrarClientes());
    mostrarAlerta('warning', 'Cliente eliminado', `El registro de ${cli.nombre} ha sido eliminado.`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarClientes();

  const form = document.getElementById('formCliente');
  const preview = document.getElementById('nombreArchivoPreviewCliente');

  configurarInputArchivo(document.getElementById('cliArchivo'), preview);

  document.getElementById('btnNuevoCliente').addEventListener('click', () => {
    form.reset();
    document.getElementById('cliId').value = '';
    preview.textContent = 'Ningún archivo seleccionado';
    abrirModal('modalCliente', 'Registrar Nuevo Cliente');
  });

  document.getElementById('buscarCliente').addEventListener('input', () => {
    renderizarClientes(filtrarClientes());
  });

  form.addEventListener('submit', guardarCliente);
});
