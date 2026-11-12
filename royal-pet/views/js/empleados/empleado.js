// ================= MÓDULO EMPLEADOS (mantenerEmpleados.html) =================
const CLAVE_EMPLEADOS = 'royalpet_empleados';

let empleados = cargarDatos(CLAVE_EMPLEADOS, [
  {
    id: 1,
    nombre: 'Dra. Sofía Mendoza',
    edad: 31,
    puesto: 'Cirujano Veterinario',
    telefono: '5512345678',
    correo: 'sofia.mendoza@royalpet.com',
    direccion: 'Av. Reforma #234, Col. Centro',
    turno: 'Matutino',
    archivo: 'Cedula_Sofia.pdf'
  },
  {
    id: 2,
    nombre: 'Carlos Ramírez',
    edad: 25,
    puesto: 'Estilista Canino',
    telefono: '5587654321',
    correo: 'carlos.r@royalpet.com',
    direccion: 'Calle Roble #18, Jardines del Sur',
    turno: 'Vespertino',
    archivo: 'CV_Carlos.pdf'
  }
]);

function filtrarEmpleados() {
  const input = document.getElementById('buscarEmpleado');
  const texto = input ? input.value.toLowerCase().trim() : '';
  return empleados.filter((emp) =>
    emp.nombre.toLowerCase().includes(texto) ||
    emp.puesto.toLowerCase().includes(texto) ||
    emp.correo.toLowerCase().includes(texto)
  );
}

function renderizarEmpleados(lista = empleados) {
  const tbody = document.getElementById('tablaEmpleados');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding: 2rem; color: #64748b;">
          No se encontraron empleados registrados.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = lista.map((emp) => `
    <tr>
      <td><strong>#${emp.id}</strong></td>
      <td>${escaparHtml(emp.nombre)}</td>
      <td>${emp.edad} años</td>
      <td>${escaparHtml(emp.puesto)}</td>
      <td>${escaparHtml(emp.telefono)}</td>
      <td>${escaparHtml(emp.correo)}</td>
      <td>${escaparHtml(emp.direccion)}</td>
      <td><span class="badge-turno">${escaparHtml(emp.turno)}</span></td>
      <td>${celdaArchivo(emp.archivo)}</td>
      <td class="actions-cell">
        <button class="btn-icon btn-edit" title="Editar" onclick="editarEmpleado(${emp.id})">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-icon btn-delete" title="Eliminar" onclick="eliminarEmpleado(${emp.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function guardarEmpleado(e) {
  e.preventDefault();

  const idEditando = document.getElementById('empId').value;
  const elNombre = document.getElementById('empNombre');
  const elEdad = document.getElementById('empEdad');
  const elPuesto = document.getElementById('empPuesto');
  const elTelefono = document.getElementById('empTelefono');
  const elCorreo = document.getElementById('empCorreo');
  const elDireccion = document.getElementById('empDireccion');
  const elTurno = document.getElementById('empTurno');
  const archivoFile = document.getElementById('empArchivo').files[0];

  const nombre = elNombre.value.trim();
  const edad = parseInt(elEdad.value, 10);
  const puesto = elPuesto.value;
  const telefono = elTelefono.value.trim();
  const correo = elCorreo.value.trim().toLowerCase();
  const direccion = elDireccion.value.trim();
  const turno = elTurno.value;

  // 1. Campos obligatorios
  if (!nombre) {
    resaltarError(elNombre);
    return mostrarAlerta('error', 'Campo obligatorio', 'Debes ingresar el nombre completo del empleado.');
  }
  if (!elEdad.value) {
    resaltarError(elEdad);
    return mostrarAlerta('error', 'Campo obligatorio', 'Debes indicar la edad del empleado.');
  }
  if (!puesto) {
    resaltarError(elPuesto);
    return mostrarAlerta('error', 'Campo obligatorio', 'Selecciona un puesto laboral.');
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
  if (!turno) {
    resaltarError(elTurno);
    return mostrarAlerta('error', 'Campo obligatorio', 'Selecciona un turno de trabajo.');
  }

  // 2. Formatos
  if (nombre.length < 3 || !REGEX_NOMBRE.test(nombre)) {
    resaltarError(elNombre);
    return mostrarAlerta('error', 'Nombre inválido', 'El nombre solo debe contener letras y tener al menos 3 caracteres.');
  }
  if (isNaN(edad) || edad < 18 || edad > 80) {
    resaltarError(elEdad);
    return mostrarAlerta('error', 'Edad no permitida', 'El empleado debe ser mayor de edad (entre 18 y 80 años).');
  }
  if (!REGEX_TELEFONO.test(telefono)) {
    resaltarError(elTelefono);
    return mostrarAlerta('error', 'Teléfono incorrecto', 'El teléfono debe contener exactamente 10 dígitos numéricos.');
  }
  if (!REGEX_CORREO.test(correo)) {
    resaltarError(elCorreo);
    return mostrarAlerta('error', 'Correo inválido', 'Ingresa una dirección de correo electrónico válida.');
  }

  // 3. Duplicados (correo o nombre exacto)
  const duplicado = empleados.some((emp) =>
    emp.id !== Number(idEditando) &&
    (emp.correo.toLowerCase() === correo || emp.nombre.toLowerCase() === nombre.toLowerCase())
  );
  if (duplicado) {
    resaltarError(elCorreo);
    return mostrarAlerta('warning', 'Empleado duplicado', 'Ya existe un empleado registrado con ese mismo nombre o correo electrónico.');
  }

  // 4. Guardar o actualizar
  if (idEditando) {
    const index = empleados.findIndex((emp) => emp.id === Number(idEditando));
    if (index !== -1) {
      empleados[index] = {
        ...empleados[index],
        nombre, edad, puesto, telefono, correo, direccion, turno,
        archivo: archivoFile ? archivoFile.name : empleados[index].archivo
      };
      mostrarAlerta('success', 'Registro actualizado', `Los datos de ${nombre} se actualizaron correctamente.`);
    }
  } else {
    empleados.push({
      id: siguienteId(empleados),
      nombre, edad, puesto, telefono, correo, direccion, turno,
      archivo: archivoFile ? archivoFile.name : ''
    });
    mostrarAlerta('success', 'Empleado registrado', `${nombre} fue agregado al sistema exitosamente.`);
  }

  guardarDatos(CLAVE_EMPLEADOS, empleados);
  renderizarEmpleados(filtrarEmpleados());
  cerrarModal('modalEmpleado');
}

function editarEmpleado(id) {
  const emp = empleados.find((e) => e.id === id);
  if (!emp) return;

  document.getElementById('empId').value = emp.id;
  document.getElementById('empNombre').value = emp.nombre;
  document.getElementById('empEdad').value = emp.edad;
  document.getElementById('empPuesto').value = emp.puesto;
  document.getElementById('empTelefono').value = emp.telefono;
  document.getElementById('empCorreo').value = emp.correo;
  document.getElementById('empDireccion').value = emp.direccion;
  document.getElementById('empTurno').value = emp.turno;
  document.getElementById('empArchivo').value = '';
  document.getElementById('nombreArchivoPreview').textContent = emp.archivo
    ? `Archivo actual: ${emp.archivo}`
    : 'Ningún archivo seleccionado';

  abrirModal('modalEmpleado', 'Editar Datos del Empleado');
}

function eliminarEmpleado(id) {
  const emp = empleados.find((e) => e.id === id);
  if (!emp) return;

  if (confirm(`¿Estás seguro de eliminar a ${emp.nombre} del sistema?`)) {
    empleados = empleados.filter((e) => e.id !== id);
    guardarDatos(CLAVE_EMPLEADOS, empleados);
    renderizarEmpleados(filtrarEmpleados());
    mostrarAlerta('warning', 'Empleado eliminado', `El registro de ${emp.nombre} ha sido eliminado.`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarEmpleados();

  const form = document.getElementById('formEmpleado');
  const preview = document.getElementById('nombreArchivoPreview');

  configurarInputArchivo(document.getElementById('empArchivo'), preview);

  document.getElementById('btnNuevoEmpleado').addEventListener('click', () => {
    form.reset();
    document.getElementById('empId').value = '';
    preview.textContent = 'Ningún archivo seleccionado';
    abrirModal('modalEmpleado', 'Registrar Nuevo Empleado');
  });

  document.getElementById('buscarEmpleado').addEventListener('input', () => {
    renderizarEmpleados(filtrarEmpleados());
  });

  form.addEventListener('submit', guardarEmpleado);
});
