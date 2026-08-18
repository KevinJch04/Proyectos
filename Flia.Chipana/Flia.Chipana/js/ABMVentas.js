
let ventaActual = null;
let ventasCache = [];

//----------------------------------------------------------
//                  CARGAR TABLA DE VENTAS
//----------------------------------------------------------
async function cargarVentas() {
    const tabla = document.getElementById("tabla-ventas");

    try {
        const res = await fetchConToken(`${API_URL}/ventas`);

        if (!res || !res.ok) throw new Error("Error al obtener ventas");

        const ventas = await res.json();
         ventasCache = ventas;
        tabla.innerHTML = ""; 

        ventas.forEach(venta => {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${venta.id_venta}</td>
                <td>${venta.id_usuario}</td>
                <td>${venta.fecha}</td>
                <td>${venta.id_cliente}</td>
                <td>${venta.total}</td>
                <td class="actions">
                    <button class="btn-edit" data-id="${venta.id_venta}"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn-delete" data-id="${venta.id_venta}"><i class="fa-solid fa-trash-can"></i></button>
                </td>`;
            tabla.appendChild(fila);
        });
    } catch (err) {
        console.error(err);
        tabla.innerHTML = "<tr><td colspan='7'>Error al cargar ventas.</td></tr>";
    }
}

function inicializarTicketPDF() {
    document.getElementById("tabla-ventas").addEventListener("click", async (e) => {
        const btnTicket = e.target.closest(".btn-edit");
        if (!btnTicket) return;

        const idVenta = btnTicket.dataset.id;

        try {
            descargarTicketVentaGuardada(idVenta);

        } catch (err) {
            console.error(err);
            mostrarToast("Error al generar ticket.");
        }
    });
}




// ------------------------------------------------
//                 FECHA EN TIEMPO REAL
// -------------------------------------------------
function cargarFechaActual() {
    const spanFecha = document.getElementById("venta-fecha");
    const fecha = new Date();
    // Mostrar fecha + hora
    spanFecha.textContent =
        fecha.toLocaleDateString("es-AR") + " " + fecha.toLocaleTimeString("es-AR");
}

// ----------------------------------------------------------------
//                      CREAR UNA VENTA
// ----------------------------------------------------------------
async function crearVenta() {
    const btnIniciar = document.getElementById("venta-btn-iniciar");
    const idCliente = document.getElementById("venta-select-cliente").value;

    btnIniciar.disabled = true;
    btnIniciar.textContent = "Creando...";

    const ahora = new Date();
    const fechaStr = ahora.toLocaleDateString("es-AR"); 
    const horaStr = ahora.toLocaleTimeString("es-AR", { hour12: false }); 
    const fechaHora = `${fechaStr} ${horaStr}`; 

    // Datos adaptados al formato que espera la API
    const data = {
        id_usuario: localStorage.getItem("id_usuario") || "1",
        fecha: fechaHora,
        id_cliente: String(idCliente),
        total: "0"
    };
  console.log("Datos que se enviarán a la API:", data); 
    try {
        const response = await fetchConToken(`${API_URL}/ventas`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.error || "Error al crear venta");
            return;
        }

        // Guardar venta actual
        ventaActual = result.venta;

        // Mostrar número de venta generado automáticamente por BD
        document.getElementById("venta-nro").textContent = result.venta.id_venta;

           // Mostrar fecha y hora directamente
        document.getElementById("venta-fecha").textContent = fechaHora;

        // Cargar productos y mostrar panel
        await cargarProductosVentas();
        mostrarPanelProductos();

        // DESHABILITAR select de clientes para evitar cambios
        document.getElementById("venta-select-cliente").disabled = true;

        // Habilitar botones de cancelar y modificar
        document.getElementById("venta-btn-cancelar").disabled = false;

    } catch (error) {
        console.error(error);
        alert("Error al crear la venta");
    } finally {
        btnIniciar.disabled = false;
        btnIniciar.textContent = "Iniciar";
    }
}





// ------------------------------------------------------------
//           CARGAR LA LISTA CLIENTES EN VENTAS
// ------------------------------------------------------------

async function cargarClientesVenta() {
    try {
        const res = await fetchConToken(`${API_URL}/clientes`);
        if (!res.ok) throw new Error("Error al cargar clientes");

        const clientes = await res.json();

        const selectCliente = document.getElementById("venta-select-cliente");

        if (!selectCliente) {
            console.warn("El select de clientes no existe.");
            return;
        }

        // limpiar
        selectCliente.innerHTML = "";

        // agregar Consumidor Final
        const opCF = document.createElement("option");
        opCF.value = 1;
        opCF.textContent = "Consumidor Final";
        opCF.selected = true;
        selectCliente.appendChild(opCF);

        // agregar resto de clientes (menos el 1)
        clientes
            .filter(c => c.id_cliente != 1)
            .forEach(cliente => {
                const option = document.createElement("option");
                option.value = cliente.id_cliente;
                option.textContent = cliente.nombre;
                selectCliente.appendChild(option);
            });

        console.log("Clientes cargados:", clientes);

    } catch (error) {
        console.error("ERROR CARGANDO CLIENTES:", error);
        alert("No se pudieron cargar los clientes");
    }
}





// -----------------------------------------------------------
//              ELIMINAR UNA VENTA (CANCELAR)
// -----------------------------------------------------------
async function cancelarVenta() {
    let idVenta = document.getElementById("venta-nro").textContent;

    if (!idVenta || idVenta === "--") {
        mostrarToast("No hay venta para cancelar.");
        return;
    }

    const confirmado = await mostrarConfirmacionPersonalizada("¿Seguro que deseas cancelar la venta?");
  if (!confirmado) return;
idVenta = parseInt(idVenta, 10);
    try {
         // 2️⃣ Ahora borro la VENTA
        const response = await fetchConToken(`${API_URL}/ventas/${idVenta}`, {
            method: "DELETE"
        });

        const result = await response.json();
        console.log("cancelarVenta result:", result);

        if (response.ok) {
            mostrarToast("Venta eliminada correctamente.");

              resetUIVenta();
            return;
        }

        mostrarToast(result.error || "Error al cancelar la venta");
    } catch (err) {
        console.error(err);
        mostrarToast("Error al cancelar la venta (ver consola).");
    }
}

// para que los mensajes tengan estilo
function mostrarToast(mensaje, tipo = "success", duracion = 3000) {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.className = `toast ${tipo}`;
    toast.style.opacity = 1;

    setTimeout(() => {
        toast.style.opacity = 0;
    }, duracion);
}
function mostrarConfirmacionPersonalizada(mensaje) {
  return new Promise((resolve) => {
    const dialog = document.getElementById('confirm-dialog');
    const texto = document.getElementById('confirm-text');
    const btnYes = document.getElementById('btn-confirm-yes');
    const btnNo = document.getElementById('btn-confirm-no');

    texto.textContent = mensaje;
    dialog.classList.remove('hidden');

    btnYes.onclick = () => {
      dialog.classList.add('hidden');
      resolve(true);
    };

    btnNo.onclick = () => {
      dialog.classList.add('hidden');
      resolve(false);
    };
  });
}

function resetUIVenta() {
    ventaActual = null;
    carrito = [];
    formasSeleccionadas = [];

    document.getElementById("venta-nro").textContent = "--";
    document.getElementById("venta-fecha").textContent = "";
    document.getElementById("venta-select-cliente").value = "1";
    document.getElementById("venta-nombre-cliente").textContent = "Consumidor Final";
    document.getElementById("venta-deuda-cliente").textContent = "0";


    document.getElementById("venta-btn-iniciar").disabled = false;
    document.getElementById("venta-btn-cancelar").disabled = true;
    document.getElementById("venta-select-cliente").disabled = false;

    // Vaciar carrito y totales
    document.querySelector("#venta-tabla-carrito tbody").innerHTML = "";
    document.getElementById("venta-total-venta").textContent = "0";
    document.getElementById("venta-vuelto-venta").textContent = "0";

    // Vaciar lista de formas de pago
    const listaFormas = document.getElementById("venta-lista-formas");
    if (listaFormas) listaFormas.innerHTML = "";

    // Ocultar panel de productos
    ocultarPanelProductos();
}


// -----------------------------------------------------------------
//             FUNCIONES PARA MOSTRAR Y OCULTAR
// -----------------------------------------------------------------

function ocultarPanelProductos() {
    document.querySelector(".venta-search-container").classList.add("oculto");
    document.getElementById("venta-tabla-productos").closest(".table-scroll-container").classList.add("oculto");
    document.querySelector(".venta-agregar-container").classList.add("oculto");
    document.querySelector(".venta-carrito").classList.add("oculto");
}

function mostrarPanelProductos() {
    document.querySelector(".venta-search-container").classList.remove("oculto");
    const tblWrap = document.getElementById("venta-tabla-productos").closest(".table-scroll-container");
    if (tblWrap) tblWrap.classList.remove("oculto");
    document.querySelector(".venta-agregar-container").classList.remove("oculto");
    document.querySelector(".venta-carrito").classList.remove("oculto");
}








// -----------------------------------------------------------------
//              ABRIR EL PANEL DE VENTAS
// -----------------------------------------------------------------
document.addEventListener("click", (e) => {
  const panel = document.getElementById("panel-venta");
  const overlay = document.getElementById("overlay-venta");

  if (!panel || !overlay) return;

if (e.target.matches(".btn-add") || e.target.closest(".btn-add")) {
    panel.classList.add("active");
    overlay.classList.add("active");

    // limpiar estados de venta
    document.getElementById("venta-nro").textContent = "--";
    document.getElementById("venta-fecha").textContent = "";
    document.getElementById("venta-btn-iniciar").disabled = false;

    cargarFechaActual();
    cargarClientesVenta();   // <-- AHORA SÍ SE EJECUTA  
    cargarFormasDePago();
    ocultarPanelProductos();
console.log("select:", document.getElementById("venta-forma-pago"));


}
if (e.target.matches("#btn-cerrar-panel-venta")) {

    const ventaNro = document.getElementById("venta-nro").textContent;

    // 1️⃣ ¿Hay venta activa?
    if (ventaActual || (ventaNro && ventaNro !== "--")) {

    cancelarVenta().then(seCancelo => {

            if (!seCancelo) {
                return;
            }

            panel.classList.remove("active");
            overlay.classList.remove("active");
            cargarVentas();
        });

        return;
    }

    // No hay venta activa → cerrar normal
    panel.classList.remove("active");
    overlay.classList.remove("active");
    cargarVentas();
}
});





// -------------------------------------------------
//               EVENTOS DE BOTONES 
// -------------------------------------------------


function inicializarEventosVentas() {

//  Botón “Iniciar Venta” → llama a crearVenta().
   const btnIniciar = document.getElementById("venta-btn-iniciar");
if (btnIniciar) {
    btnIniciar.addEventListener("click", () => {

        const ventaNro = document.getElementById("venta-nro").textContent;

        // Validación: ya hay venta activa
        if (ventaActual || (ventaNro && ventaNro !== "--")) {
            mostrarToast("Ya hay una venta en curso. Cancélala antes de iniciar otra.");
            return;
        }

        // No hay venta → crear
        crearVenta();
    });
}
// Botón “Cancelar Venta” → llama a cancelarVenta().
    const btnCancelar = document.getElementById("venta-btn-cancelar");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", cancelarVenta);
    }
// Botón “Agregar Producto” → LLAMA A agregarProductoAlCarrito()
 const btnAgregar = document.getElementById("venta-btn-agregar-producto");
if (btnAgregar) {
    btnAgregar.addEventListener("click", async () => {
        const cantidadInput = document.getElementById("venta-cantidad-producto");
        const cantidad = parseFloat(cantidadInput.value, 10);

        await agregarProductoAlCarrito(productoSeleccionado, cantidad);

        // Reset cantidad
        cantidadInput.value = 1;
    });
}
// Botón “Finalizar Venta”
const btnFinalizarVenta = document.getElementById("venta-btn-finalizar");
if (btnFinalizarVenta) {
    btnFinalizarVenta.addEventListener("click", finalizarVenta);
}



    // Seguridad: verificar que existan los botones antes de usar addEventListener
    const btnActualizar = document.getElementById('venta-btn-actualizar');
    if (btnActualizar) {
        btnActualizar.addEventListener('click', () => {
            if (!ventaActual || !formaPagoSeleccionada) {
                mostrarToast("Selecciona una venta y forma de pago");
                return;
            }
            actualizarDetalleFormaPago(ventaActual.id_venta, formaPagoSeleccionada.id_forma_pago, nuevoMonto);
        });
    }

    const btnEliminar = document.getElementById('venta-btn-eliminar');
    if (btnEliminar) {
        btnEliminar.addEventListener('click', () => {
            if (!ventaActual || !formaPagoSeleccionada) {
                mostrarToast("Selecciona una venta y forma de pago");
                return;
            }
            eliminarDetalleFormaPago(ventaActual.id_venta, formaPagoSeleccionada.id_forma_pago);
        });
    }
   // Agregar forma de pago
    const btnAgregarForma = document.getElementById("venta-btn-agregar-forma");
    if (btnAgregarForma) {
        btnAgregarForma.addEventListener("click", agregarFormaDePago);
    }


async function inicializarSyncCliente() {
    const selectCliente = document.getElementById("venta-select-cliente");
    const spanNombre = document.getElementById("venta-nombre-cliente");
    const spanDeuda = document.getElementById("venta-deuda-cliente");

    if (!selectCliente || !spanNombre || !spanDeuda) return;

    // Traer todos los clientes una sola vez
    let listaClientes = [];
    try {
        const res = await fetchConToken(`${API_URL}/clientes`);
        if (res.ok) {
            listaClientes = await res.json();
        } else {
            console.warn("No se pudo obtener lista de clientes");
        }
    } catch (err) {
        console.error("Error cargando clientes:", err);
    }

    // Cuando se cambia el cliente en el select
    selectCliente.addEventListener("change", () => {
        const idSel = selectCliente.value;

        // Buscar cliente por ID
        const cliente = listaClientes.find(c => String(c.id_cliente) === String(idSel));

        if (cliente) {
            spanNombre.textContent = cliente.nombre || cliente.apellido || "Cliente";
            spanDeuda.textContent = cliente.deuda != null ? cliente.deuda : 0;
        } else {
            // Si no se encuentra el cliente
            spanNombre.textContent = "Consumidor Final";
            spanDeuda.textContent = "0";
        }
    });
}

    inicializarSyncCliente();
}















// -------------------------------------------------
// Función separar para finalizar venta
// -------------------------------------------------
async function finalizarVenta() {
    if (!ventaActual) return mostrarToast("Primero inicia la venta");
    if (carrito.length === 0) return mostrarToast("Agrega productos al carrito");

    const totalVenta = carrito.reduce((s, i) => s + i.precio_total, 0);
    const totalPagado = formasSeleccionadas.reduce((s, f) => s + f.monto, 0);

    if (totalPagado < totalVenta) {
        return mostrarToast("El monto pagado es insuficiente");
    }

    const ticketCarrito = [...carrito];
    const idVentaGenerada = ventaActual.id_venta;

    // Guardar formas de pago
    for (const f of formasSeleccionadas) {
        await guardarDetalleFormaPago(idVentaGenerada, f.id_forma_pago, f.monto);
    }

    const selectCliente = document.getElementById("venta-select-cliente");
    const clienteNombre = selectCliente ? selectCliente.options[selectCliente.selectedIndex].textContent : "Consumidor Final";
 

   const vueltoStr = document.getElementById("venta-vuelto-venta").textContent.trim();

// Eliminar separadores de miles (puntos o comas)
    let normalizado = vueltoStr.replace(/\./g, '').replace(/,/g, '.');

    const vuelto = parseFloat(normalizado);

    await descargarTicketPDF(
        idVentaGenerada,
        ticketCarrito,
        formasSeleccionadas,
        vuelto,
        clienteNombre
    );


    // Reset UI y variables
    carrito = [];
    formasSeleccionadas = [];
    ventaActual = null;

    document.getElementById("venta-total-venta").textContent = "0";
    document.getElementById("venta-vuelto-venta").textContent = "0";
    document.getElementById("venta-nro").textContent = "--";
    document.getElementById("venta-fecha").textContent = "";
    document.getElementById("venta-lista-formas").innerHTML = "";
    document.querySelector("#venta-tabla-carrito tbody").innerHTML = "";

    ocultarPanelProductos();

    document.getElementById("venta-btn-iniciar").disabled = false;
    document.getElementById("venta-btn-finalizar").disabled = false;
    document.getElementById("venta-select-cliente").disabled = false;

    mostrarToast("Venta finalizada", "success");
}









//----------------------------------------------------------
//                  ELIMINAR UN VENTA
//----------------------------------------------------------



function inicializarEliminarVenta() {
  const confirmDiv = document.getElementById("confirmacion-simple");
  const btnSi = document.getElementById("btn-si");
  const btnNo = document.getElementById("btn-no");
  const idVentaSpan = document.getElementById("id-venta-eliminar");

  let idVentaAEliminar = null;

  // Escuchar clicks en la tabla
  document.getElementById("tabla-ventas").addEventListener("click", (e) => {
    const btnEliminar = e.target.closest(".btn-delete");
    if (!btnEliminar) return;

    idVentaAEliminar = btnEliminar.getAttribute("data-id");
    if (!idVentaAEliminar) return;

    idVentaSpan.textContent = idVentaAEliminar;
    confirmDiv.style.display = "block";
  });

  // Botón NO
  btnNo.addEventListener("click", () => {
    confirmDiv.style.display = "none";
    idVentaAEliminar = null;
  });

  // Botón SÍ
  btnSi.addEventListener("click", async () => {
    if (!idVentaAEliminar) return;

    try {
      const res = await fetchConToken(`${API_URL}/ventas/${idVentaAEliminar}`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (!res.ok || (data.mensaje && data.mensaje !== "OK")) {
        throw new Error(data.error || "Error al cancelar venta");
      }

      mostrarToast("Venta eliminada correctamente");
      cargarVentas();
      
    } catch (error) {
      console.error(error);
      mostrarToast("Error al cancelar la venta");
    } finally {
      confirmDiv.style.display = "none";
      idVentaAEliminar = null;
    }
  });
}

