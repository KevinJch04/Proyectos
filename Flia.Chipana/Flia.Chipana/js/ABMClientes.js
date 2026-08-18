
//----------------------------------------------------------
//                  MOSTRAR UN CLIENTE
//----------------------------------------------------------

//esta funcion se usa cada ves se carga la pag o cuando necesitas actualizar la tabla

async function cargarClientes() {
    const tabla = document.getElementById("tabla-clientes");

    try {
        const res = await fetchConToken(`${API_URL}/clientes`);

        if (!res || !res.ok) throw new Error("Error al obtener clientes");

        const clientes = await res.json();
        tabla.innerHTML = "";
        clientes.forEach(cliente => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${cliente.id_cliente}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.apellido}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.direccion}</td>
                <td>${cliente.email}</td>
                <td>${cliente.deuda}</td>
                <td class="actions">
                    <button class="btn-edit" data-id="${cliente.id_cliente}"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-delete" data-id="${cliente.id_cliente}"><i class="fa-solid fa-trash-can"></i></button>
                </td>`;
            tabla.appendChild(fila);
        });
    } catch (err) {
        console.error(err);
        tabla.innerHTML = "<tr><td colspan='8'>Error al cargar clientes.</td></tr>";
    }
}










//----------------------------------------------------------
//                  AGREGAR UN CLIENTE
//----------------------------------------------------------

//funcion para mostrar el de agregado del cliente exitosamente 
function mostrarMensaje(mensaje) {
  const toast = document.getElementById("mensaje-toast");
  toast.textContent = mensaje;
  toast.style.display = "block";
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => {
      toast.style.display = "none";
    }, 300);
  }, 2500);
}

// funcion para agregar un cliente
function inicializarAgregarCliente() {
  const form = document.getElementById("form-agregar-cliente");
  const panel = document.querySelector(".side-panel");
  const overlay = document.getElementById("overlay");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const botonAgregar = form.querySelector('button[type="submit"]');
    botonAgregar.disabled = true;
    botonAgregar.textContent = "Agregando...";

    const token = localStorage.getItem("token");
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
          // Convertir deuda a número decimal
    data.deuda = parseNumero(data.deuda);

    try {
      const res = await fetchConToken(`${API_URL}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Error al agregar cliente");

      mostrarMensaje("Cliente agregado exitosamente");
      form.reset();
      panel.classList.remove("active");
      overlay.classList.remove("active");
      cargarClientes(); // refresca la tabla
    } catch (err) {
      console.error(err);
      mostrarMensaje("Error al agregar cliente");
    } finally {
      botonAgregar.disabled = false;
      botonAgregar.textContent = "Agregar";
    }
  });
}

  //panel agregar
document.addEventListener("click", (e) => {
  const panel = document.querySelector(".side-panel");
  const overlay = document.getElementById("overlay");
  const form = document.getElementById("form-agregar-cliente");

  if (!panel || !overlay) return; // Evita errores si no existen

  if (e.target.matches(".btn-add")) {
    panel.classList.add("active");
    overlay.classList.add("active");
  }

  if (e.target.matches("#btn-cerrar-panel, #overlay")) {
    panel.classList.remove("active");
    overlay.classList.remove("active");

    // Resetear formulario al cerrar panel
    if (form) form.reset();
  }
});






//----------------------------------------------------------
//                  EDITAR UN CLIENTE
//----------------------------------------------------------


function inicializarEditarCliente() {
  const panelEditar = document.getElementById("panel-editar");
  const overlay = document.getElementById("overlay");
  const formEditar = document.getElementById("form-editar-cliente");
  const btnCerrarEditar = document.getElementById("btn-cerrar-panel-editar");

  //Cerrar panel editar
  btnCerrarEditar.addEventListener("click", () => {
    panelEditar.classList.remove("active");
    overlay.classList.remove("active");
    formEditar.reset();
  });

  overlay.addEventListener("click", () => {
    if (panelEditar.classList.contains("active")) {
      panelEditar.classList.remove("active");
      overlay.classList.remove("active");
      formEditar.reset();
    }
  });

  // Delegación para botón editar en la tabla
  document.getElementById("tabla-clientes").addEventListener("click", (e) => {
    if (e.target.closest(".btn-edit")) {
      const btnEditar = e.target.closest(".btn-edit");
      const fila = btnEditar.closest("tr");

      // Obtener datos de la fila
      const id_cliente = btnEditar.getAttribute("data-id");
      const nombre = fila.children[1].textContent;
      const apellido = fila.children[2].textContent;
      const telefono = fila.children[3].textContent;
      const direccion = fila.children[4].textContent;
      const email = fila.children[5].textContent;
      const deuda = fila.children[6].textContent;

      // Llenar formulario editar
      formEditar.elements["id_cliente"].value = id_cliente;
      formEditar.elements["nombre"].value = nombre;
      formEditar.elements["apellido"].value = apellido;
      formEditar.elements["telefono"].value = telefono;
      formEditar.elements["direccion"].value = direccion;
      formEditar.elements["email"].value = email;
      formEditar.elements["deuda"].value = deuda;

      // Mostrar panel editar y overlay
      panelEditar.classList.add("active");
      overlay.classList.add("active");
    }
  });

  // Manejar submit para actualizar cliente
  formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const botonActualizar = formEditar.querySelector('button[type="submit"]');
    botonActualizar.disabled = true;
    botonActualizar.textContent = "Actualizando...";

    const token = localStorage.getItem("token");

    const formData = new FormData(formEditar);
    const data = Object.fromEntries(formData.entries());
      // Convertir deuda a número decimal
    data.deuda = parseNumero(data.deuda);
    const id_cliente = data.id_cliente;
    delete data.id_cliente; // No enviamos el id en el body porque va en la URL

    try {
      const res = await fetchConToken(`${API_URL}/clientes/${id_cliente}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Error al actualizar cliente");

      mostrarMensaje("Cliente actualizado exitosamente");
      formEditar.reset();
      panelEditar.classList.remove("active");
      overlay.classList.remove("active");
      cargarClientes(); // refresca la tabla
    } catch (err) {
      console.error(err);
      mostrarMensaje("Error al actualizar cliente");
    } finally {
      botonActualizar.disabled = false;
      botonActualizar.textContent = "Actualizar";
    }
  });
}






//----------------------------------------------------------
//                  ELIMINAR UN CLIENTE
//----------------------------------------------------------



function inicializarEliminarCliente() {
  const confirmDiv = document.getElementById("confirmacion-simple");
  const btnSi = document.getElementById("btn-si");
  const btnNo = document.getElementById("btn-no");
  const nombreClienteSpan = document.getElementById("nombre-cliente-eliminar");

  let idClienteAEliminar = null;

  document.getElementById("tabla-clientes").addEventListener("click", (e) => {
    const btnEliminar = e.target.closest(".btn-delete");
    if (!btnEliminar) return;

    idClienteAEliminar = btnEliminar.getAttribute("data-id");
    if (!idClienteAEliminar) return;

    // obtenemos el nombre de la fila para mostrar
    const fila = btnEliminar.closest("tr");
    const nombreCliente = fila.children[1].textContent + " " + fila.children[2].textContent; // nombre + apellido

    // Lo ponemos en el cartelito
    nombreClienteSpan.textContent = nombreCliente;

    confirmDiv.style.display = "block";
  });

  btnNo.addEventListener("click", () => {
    confirmDiv.style.display = "none";
    idClienteAEliminar = null;
  });

  btnSi.addEventListener("click", async () => {
    if (!idClienteAEliminar) return;

    try {
      const res = await fetchConToken(`${API_URL}/clientes/${idClienteAEliminar}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar cliente");

      mostrarMensaje("Cliente eliminado exitosamente");
      cargarClientes();
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error al eliminar cliente");
    } finally {
      confirmDiv.style.display = "none";
      idClienteAEliminar = null;
    }
  });
}






// -----------------------------------------------
//           FUNCION PARA DECIMALES 
// ----------------------------------------------
/**
.

 * @param {HTMLInputElement} input - El input que se está validando
 * @param {Object} options - Opciones de validación
 *   options.decimals: cantidad máxima de decimales (default 2)
 */
function validarNumero(input, options = {}) {
  const decimals = options.decimals ?? 2;
  let valor = input.value;

  // Permite solo dígitos, coma y punto
  valor = valor.replace(/[^0-9.,]/g, '');

  // Solo dejamos el primer separador que aparezca
  const indicesSeparadores = ['.', ','].map(s => valor.indexOf(s)).filter(i => i >= 0);
  const primerSeparadorIndex = indicesSeparadores.length ? Math.min(...indicesSeparadores) : -1;

  if (primerSeparadorIndex >= 0) {
    const separador = valor[primerSeparadorIndex];
    const antes = valor.slice(0, primerSeparadorIndex);
    let despues = valor.slice(primerSeparadorIndex + 1);
    // Eliminamos cualquier otro separador restante
    despues = despues.replace(/[.,]/g, '');
    valor = antes + separador + despues;

    // Limitar decimales
    const partes = valor.split(/[.,]/);
    if (partes[1]) {
      partes[1] = partes[1].slice(0, decimals);
      valor = partes[0] + separador + partes[1];
    }
  }

  input.value = valor;
}

/**
 * Convierte un valor con coma o punto a número decimal
 * @param {string} valor - Ej: "100,50" o "100.50"
 * @returns {number}
 */
function parseNumero(valor) {
  if (!valor) return 0;
  return parseFloat(valor.replace(',', '.')) || 0;
}
