// ================= MÓDULO MASCOTAS (mantenerMascotas.html) =================
const CLAVE_MASCOTAS = 'royalpet_mascotas';

let mascotas = cargarDatos(CLAVE_MASCOTAS, [
  {
    id: 1,
    nombre: 'Max',
    especie: 'Perro',
    raza: 'Golden Retriever',
    sexo: 'Macho',
    edad: '3 años',
    peso: 28.5,
    salud: 'Saludable / Estable',
    dueno: 'Alejandro Torres Gómez',
    archivo: 'Cartilla_Max.pdf'
  },
  {
    id: 2,
    nombre: 'Luna',
    especie: 'Gato',
    raza: 'Siamés',
    sexo: 'Hembra',
    edad: '1 año 2 meses',
    peso: 4.2,
    salud: 'En Tratamiento',
    dueno: 'María Fernanda López',
    archivo: ''
  }
]);

function filtrarMascotas() {
  const input = document.getElementById('buscarMascota');
  const texto = input ? input.value.toLowerCase().trim() : '';
  return mascotas.filter((m) =>
    m.nombre.toLowerCase().includes(texto) ||
    m.especie.toLowerCase().includes(texto) ||
    m.raza.toLowerCase().includes(texto) ||
    m.dueno.toLowerCase().includes(texto)
  );
}

function renderizarMascotas(lista = mascotas) {
  const tbody = document.getElementById('tablaMascotas');
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align:center; padding: 2rem; color: #64748b;">
          No se encontraron mascotas registradas.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = lista.map((m) => `
    <tr>
      <td><strong>#${m.id}</strong></td>
      <td><strong>${escaparHtml(m.nombre)}</strong></td>
      <td>${escaparHtml(m.especie)} <br><small style="color:#64748b;">${escaparHtml(m.raza)}</small></td>
      <td>${escaparHtml(m.sexo)}</td>
      <td>${escaparHtml(m.edad)} <br><small style="color:#64748b;">${m.peso} kg</small></td>
      <td><span class="badge-turno" style="background:#fef3c7; color:#b45309;">${escaparHtml(m.salud)}</span></td>
      <td>${escaparHtml(m.dueno)}</td>
      <td>${celdaArchivo(m.archivo)}</td>
      <td class="actions-cell">
        <button class="btn-icon btn-edit" title="Editar" onclick="editarMascota(${m.id})">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-icon btn-delete" title="Eliminar" onclick="eliminarMascota(${m.id})">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function guardarMascota(e) {
  e.preventDefault();

  const idEditando = document.getElementById('mascId').value;
  const elNombre = document.getElementById('mascNombre');
  const elEspecie = document.getElementById('mascEspecie');
  const elRaza = document.getElementById('mascRaza');
  const elSexo = document.getElementById('mascSexo');
  const elEdad = document.getElementById('mascEdad');
  const elPeso = document.getElementById('mascPeso');
  const elSalud = document.getElementById('mascSalud');
  const elDueno = document.getElementById('mascDueno');
  const archivoFile = document.getElementById('mascArchivo').files[0];

  const nombre = elNombre.value.trim();
  const especie = elEspecie.value;
  const raza = elRaza.value.trim();
  const sexo = elSexo.value;
  const edad = elEdad.value.trim();
  const peso = parseFloat(elPeso.value);
  const salud = elSalud.value;
  const dueno = elDueno.value.trim();

  // 1. Campos obligatorios
  if (!nombre) {
    resaltarError(elNombre);
    return mostrarAlerta('error', 'Campo obligatorio', 'Debes ingresar el nombre de la mascota.');
  }
  if (!especie) {
    resaltarError(elEspecie);
    return mostrarAlerta('error', 'Campo obligatorio', 'Selecciona la especie del animal.');
  }
  if (!raza) {
    resaltarError(elRaza);
    return mostrarAlerta('error', 'Campo obligatorio', 'Indica la raza de la mascota.');
  }
  if (!sexo) {
    resaltarError(elSexo);
    return mostrarAlerta('error', 'Campo obligatorio', 'Selecciona el sexo de la mascota.');
  }
  if (!edad) {
    resaltarError(elEdad);
    return mostrarAlerta('error', 'Campo obligatorio', 'Indica la edad estimada.');
  }
  if (isNaN(peso) || peso <= 0 || peso > 200) {
    resaltarError(elPeso);
    return mostrarAlerta('error', 'Peso inválido', 'Ingresa un peso corporal válido en kilogramos (máximo 200 kg).');
  }
  if (!salud) {
    resaltarError(elSalud);
    return mostrarAlerta('error', 'Campo obligatorio', 'Selecciona el estado de salud actual.');
  }
  if (!dueno) {
    resaltarError(elDueno);
    return mostrarAlerta('error', 'Campo obligatorio', 'Indica el nombre del propietario responsable.');
  }

  // 2. Formatos
  if (!REGEX_NOMBRE.test(dueno) || dueno.length < 3) {
    resaltarError(elDueno);
    return mostrarAlerta('error', 'Propietario inválido', 'El nombre del propietario solo debe contener letras y tener al menos 3 caracteres.');
  }

  // 3. Duplicados (misma mascota con mismo dueño)
  const duplicado = mascotas.some((m) =>
    m.id !== Number(idEditando) &&
    m.nombre.toLowerCase() === nombre.toLowerCase() &&
    m.dueno.toLowerCase() === dueno.toLowerCase()
  );
  if (duplicado) {
    resaltarError(elNombre);
    return mostrarAlerta('warning', 'Mascota duplicada', 'Este propietario ya tiene una mascota registrada con ese nombre.');
  }

  // 4. Guardar o actualizar
  if (idEditando) {
    const index = mascotas.findIndex((m) => m.id === Number(idEditando));
    if (index !== -1) {
      mascotas[index] = {
        ...mascotas[index],
        nombre, especie, raza, sexo, edad, peso, salud, dueno,
        archivo: archivoFile ? archivoFile.name : mascotas[index].archivo
      };
      mostrarAlerta('success', 'Mascota actualizada', `Los datos clínicos de ${nombre} se actualizaron correctamente.`);
    }
  } else {
    mascotas.push({
      id: siguienteId(mascotas),
      nombre, especie, raza, sexo, edad, peso, salud, dueno,
      archivo: archivoFile ? archivoFile.name : ''
    });
    mostrarAlerta('success', 'Mascota registrada', `${nombre} fue agregada al sistema exitosamente.`);
  }

  guardarDatos(CLAVE_MASCOTAS, mascotas);
  renderizarMascotas(filtrarMascotas());
  cerrarModal('modalMascota');
}

function editarMascota(id) {
  const m = mascotas.find((item) => item.id === id);
  if (!m) return;

  document.getElementById('mascId').value = m.id;
  document.getElementById('mascNombre').value = m.nombre;
  document.getElementById('mascEspecie').value = m.especie;
  document.getElementById('mascRaza').value = m.raza;
  document.getElementById('mascSexo').value = m.sexo;
  document.getElementById('mascEdad').value = m.edad;
  document.getElementById('mascPeso').value = m.peso;
  document.getElementById('mascSalud').value = m.salud;
  document.getElementById('mascDueno').value = m.dueno;
  document.getElementById('mascArchivo').value = '';
  document.getElementById('nombreArchivoPreviewMascota').textContent = m.archivo
    ? `Archivo actual: ${m.archivo}`
    : 'Ningún archivo seleccionado';

  abrirModal('modalMascota', 'Editar Ficha Clínica de la Mascota');
}

function eliminarMascota(id) {
  const m = mascotas.find((item) => item.id === id);
  if (!m) return;

  if (confirm(`¿Estás seguro de eliminar el expediente de ${m.nombre}?`)) {
    mascotas = mascotas.filter((item) => item.id !== id);
    guardarDatos(CLAVE_MASCOTAS, mascotas);
    renderizarMascotas(filtrarMascotas());
    mostrarAlerta('warning', 'Mascota eliminada', `El expediente de ${m.nombre} ha sido eliminado.`);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarMascotas();

  const form = document.getElementById('formMascota');
  const preview = document.getElementById('nombreArchivoPreviewMascota');

  configurarInputArchivo(document.getElementById('mascArchivo'), preview);

  document.getElementById('btnNuevaMascota').addEventListener('click', () => {
    form.reset();
    document.getElementById('mascId').value = '';
    preview.textContent = 'Ningún archivo seleccionado';
    abrirModal('modalMascota', 'Registrar Nueva Mascota');
  });

  document.getElementById('buscarMascota').addEventListener('input', () => {
    renderizarMascotas(filtrarMascotas());
  });

  form.addEventListener('submit', guardarMascota);
});
