
//----------------------------------------------------------
//                  MOSTRAR UNA FORMA DE PAGO
//----------------------------------------------------------

//esta funcion se usa cada ves se carga la pag o cuando necesitas actualizar la tabla

async function cargarFormasPago() {
    const tabla = document.getElementById("tabla-forma-pago");

    try {
        const res = await fetchConToken(`${API_URL}/formaspago`);

        if (!res || !res.ok) throw new Error("Error al obtener formas de pago");

        const formasPago = await res.json();
        tabla.innerHTML = "";
        formasPago.forEach(forma => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${forma.id_forma_pago}</td>
                <td>${forma.descripcion}</td>
                <td class="actions">
                    <button class="btn-edit" data-id="${forma.id_forma_pago}"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-delete" data-id="${forma.id_forma_pago}"><i class="fa-solid fa-trash-can"></i></button>
                </td>`;
            tabla.appendChild(fila);
        });
    } catch (err) {
        console.error(err);
        tabla.innerHTML = "<tr><td colspan='3'>Error al cargar formas de pago.</td></tr>";
    }
}

//----------------------------------------------------------
//                  AGREGAR UNA FORMA DE PAGO
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

// funcion para agregar una forma de pago
function inicializarAgregarFormaPago() {
  const form = document.getElementById("form-agregar-forma-pago");
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
      const res = await fetchConToken(`${API_URL}/formaspago`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Error al agregar forma de pago");

      mostrarMensaje("Forma de pago agregada exitosamente");
      form.reset();
      panel.classList.remove("active");
      overlay.classList.remove("active");
      cargarFormasPago();
    } catch (err) {
      console.error(err);
      mostrarMensaje("Error al agregar forma de pago");
    } finally {
      botonAgregar.disabled = false;
      botonAgregar.textContent = "Agregar";
    }
  });
}

// Panel agregar
document.addEventListener("click", (e) => {
  const panel = document.querySelector(".side-panel");
  const overlay = document.getElementById("overlay");
  const form = document.getElementById("form-agregar-forma-pago");

  if (!panel || !overlay) return;

  if (e.target.matches(".btn-add")) {
    panel.classList.add("active");
    overlay.classList.add("active");
  }

  if (e.target.matches("#btn-cerrar-panel, #overlay")) {
    panel.classList.remove("active");
    overlay.classList.remove("active");
    if (form) form.reset();
  }
});

//----------------------------------------------------------
//                  EDITAR UNA FORMA DE PAGO
//----------------------------------------------------------

function inicializarEditarFormaPago() {
  const panelEditar = document.getElementById("panel-editar");
  const overlay = document.getElementById("overlay");
  const formEditar = document.getElementById("form-editar-forma-pago");
  const btnCerrarEditar = document.getElementById("btn-cerrar-panel-editar");

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

  document.getElementById("tabla-forma-pago").addEventListener("click", (e) => {
    if (e.target.closest(".btn-edit")) {
      const btnEditar = e.target.closest(".btn-edit");
      const fila = btnEditar.closest("tr");

      const id_forma_pago = btnEditar.getAttribute("data-id");
      const descripcion = fila.children[1].textContent;

      formEditar.elements["id_forma_pago"].value = id_forma_pago;
      formEditar.elements["descripcion"].value = descripcion;

      panelEditar.classList.add("active");
      overlay.classList.add("active");
    }
  });

  // Manejar submit para actualizar forma de pago
  formEditar.addEventListener("submit", async (e) => {
    e.preventDefault();

    const botonActualizar = formEditar.querySelector('button[type="submit"]');
    botonActualizar.disabled = true;
    botonActualizar.textContent = "Actualizando...";

    const token = localStorage.getItem("token");

    const formData = new FormData(formEditar);
    const data = Object.fromEntries(formData.entries());
    const id_forma_pago = data.id_forma_pago;
    delete data.id_forma_pago; // No enviamos el id en el body porque va en la URL

    try {
      const res = await fetchConToken(`${API_URL}/formaspago/${id_forma_pago}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!res.ok) throw new Error("Error al actualizar forma de pago");

      mostrarMensaje("Forma de pago actualizada exitosamente");
      formEditar.reset();
      panelEditar.classList.remove("active");
      overlay.classList.remove("active");
      cargarFormasPago();
    } catch (err) {
      console.error(err);
      mostrarMensaje("Error al actualizar forma de pago");
    } finally {
      botonActualizar.disabled = false;
      botonActualizar.textContent = "Actualizar";
    }
  });
}

//----------------------------------------------------------
//                  ELIMINAR UNA FORMA DE PAGO
//----------------------------------------------------------

function inicializarEliminarFormaPago() {
  const confirmDiv = document.getElementById("confirmacion-simple");
  const btnSi = document.getElementById("btn-si");
  const btnNo = document.getElementById("btn-no");
  const nombreFormaPagoSpan = document.getElementById("nombre-forma-pago-eliminar");

  let idFormaPagoAEliminar = null;

  document.getElementById("tabla-forma-pago").addEventListener("click", (e) => {
    const btnEliminar = e.target.closest(".btn-delete");
    if (!btnEliminar) return;

    idFormaPagoAEliminar = btnEliminar.getAttribute("data-id");
    if (!idFormaPagoAEliminar) return;

    const fila = btnEliminar.closest("tr");
    const descripcion = fila.children[1].textContent;

    nombreFormaPagoSpan.textContent = descripcion;

    confirmDiv.style.display = "block";
  });

  btnNo.addEventListener("click", () => {
    confirmDiv.style.display = "none";
    idFormaPagoAEliminar = null;
  });

  btnSi.addEventListener("click", async () => {
    if (!idFormaPagoAEliminar) return;

    try {
      const res = await fetchConToken(`${API_URL}/formaspago/${idFormaPagoAEliminar}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar forma de pago");

      mostrarMensaje("Forma de pago eliminada exitosamente");
      cargarFormasPago();
    } catch (error) {
      console.error(error);
      mostrarMensaje("Error al eliminar forma de pago");
    } finally {
      confirmDiv.style.display = "none";
      idFormaPagoAEliminar = null;
    }
  });
}
