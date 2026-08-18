
//----------------------------------------------------------
//                  MOSTRAR UN PROVEEDOR
//----------------------------------------------------------

//esta funcion se usa cada ves se carga la pag o cuando necesitas actualizar la tabla

async function cargarProveedores() {
    const tabla = document.getElementById("tabla-proveedores");

    try {
        const res = await fetchConToken(`${API_URL}/proveedores`);

        if (!res || !res.ok) throw new Error("Error al obtener proveedores");

        const proveedores = await res.json();
        tabla.innerHTML = "";
        proveedores.forEach(proveedor => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${proveedor.id_proveedor}</td>
                <td>${proveedor.nombre}</td>
                <td>${proveedor.telefono}</td>
                <td>${proveedor.email}</td>
                <td>${proveedor.direccion}</td>
                <td class="actions">
                    <button class="btn-edit" data-id="${proveedor.id_proveedor}"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-delete" data-id="${proveedor.id_proveedor}"><i class="fa-solid fa-trash-can"></i></button>
                </td>`;
            tabla.appendChild(fila);
        });
    } catch (err) {
        console.error(err);
        tabla.innerHTML = "<tr><td colspan='8'>Error al cargar proveedor.</td></tr>";
    }
}










//----------------------------------------------------------
//                  AGREGAR UN PROVEEDOR
//----------------------------------------------------------

//funcion para mostrar el de agregado del proveedor exitosamente 
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

// funcion para agregar un proveedor
function inicializarAgregarProveedor() {
  const form = document.getElementById("form-agregar-proveedor");
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

    try {
      const res = await fetchConToken(`${API_URL}/proveedores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Error al agregar proveedor");

      mostrarMensaje("Proveedor agregado exitosamente");
      form.reset();
      panel.classList.remove("active");
      overlay.classList.remove("active");
      cargarProveedores(); // refresca la tabla
    } catch (err) {
      console.error(err);
      mostrarMensaje("Error al agregar proveedor");
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
  const form = document.getElementById("form-agregar-proveedor");

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
//                  EDITAR UN PROVEEDOR
//----------------------------------------------------------


function inicializarEditarProveedor() {
  const panelEditar = document.getElementById("panel-editar");
  const overlay = document.getElementById("overlay");
  const formEditar = document.getElementById("form-editar-proveedor");
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
  document.getElementById("tabla-proveedores").addEventListener("click", (e) => {
    if (e.target.closest(".btn-edit")) {
      const btnEditar = e.target.closest(".btn-edit");
      const fila = btnEditar.closest("tr");

      // Obtener datos de la fila
      const id_proveedor = btnEditar.getAttribute("data-id");
      const nombre = fila.children[1].textContent;
      const telefono = fila.children[2].textContent;
      const email = fila.children[3].textContent;
      const direccion = fila.children[4].textContent;

      // Llenar formulario editar
      formEditar.elements["id_proveedor"].value = id_proveedor;
      formEditar.elements["nombre"].value = nombre;
      formEditar.elements["telefono"].value = telefono;
      formEditar.elements["email"].value = email;
      formEditar.elements["direccion"].value = direccion;

      // Mostrar panel editar y overlay
      panelEditar.classList.add("active");
      overlay.classList.add("active");
    }
  });

  // Manejar submit para actualizar proveedor
  formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const botonActualizar = formEditar.querySelector('button[type="submit"]');
    botonActualizar.disabled = true;
    botonActualizar.textContent = "Actualizando...";

    const token = localStorage.getItem("token");

    const formData = new FormData(formEditar);
    const data = Object.fromEntries(formData.entries());
    const id_proveedor = data.id_proveedor;
    delete data.id_proveedor; // No enviamos el id en el body porque va en la URL

    try {
      const res = await fetchConToken(`${API_URL}/proveedores/${id_proveedor}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Error al actualizar proveedor");

      mostrarMensaje("Proveedor actualizado exitosamente");
      formEditar.reset();
      panelEditar.classList.remove("active");
      overlay.classList.remove("active");
      cargarProveedores(); // refresca la tabla
    } catch (err) {
      console.error(err);
      mostrarMensaje("Error al actualizar proveedor");
    } finally {
      botonActualizar.disabled = false;
      botonActualizar.textContent = "Actualizar";
    }
  });
}






//----------------------------------------------------------
//                  ELIMINAR UN PROVEEDOR
//----------------------------------------------------------



function inicializarEliminarProveedor() {
  const confirmDiv = document.getElementById("confirmacion-simple");
  const btnSi = document.getElementById("btn-si");
  const btnNo = document.getElementById("btn-no");
  const nombreProveedorSpan = document.getElementById("nombre-proveedor-eliminar");

  let idProveedorAEliminar = null;

  document.getElementById("tabla-proveedores").addEventListener("click", (e) => {
    const btnEliminar = e.target.closest(".btn-delete");
    if (!btnEliminar) return;

    idProveedorAEliminar = btnEliminar.getAttribute("data-id");
    if (!idProveedorAEliminar) return;

    // obtenemos el nombre de la fila para mostrar
    const fila = btnEliminar.closest("tr");
    const nombreProveedor = fila.children[1].textContent; // nombre del proveedor

    // Lo ponemos en el cartelito
    nombreProveedorSpan.textContent = nombreProveedor;

    confirmDiv.style.display = "block";
  });

  btnNo.addEventListener("click", () => {
    confirmDiv.style.display = "none";
    idProveedorAEliminar = null;
  });

  btnSi.addEventListener("click", async () => {
    if (!idProveedorAEliminar) return;

    try {
      const res = await fetchConToken(`${API_URL}/proveedores/${idProveedorAEliminar}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar proveedor");

      mostrarMensaje("Proveedor eliminado exitosamente");
      cargarProveedores();
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error al eliminar proveedor");
    } finally {
      confirmDiv.style.display = "none";
      idProveedorAEliminar = null;
    }
  });
}