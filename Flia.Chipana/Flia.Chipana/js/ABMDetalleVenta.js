// --------------------------------------------------------------
//               CARGAR LA LISTA DE PRODUCTO
// --------------------------------------------------------------
async function cargarProductosVentas() {
  try {
    const res = await fetchConToken(`${API_URL}/productos`);
    if (!res.ok) throw new Error("Error al cargar productos"); 

    const productos = await res.json();

    const tablaProductos = document.getElementById("venta-tabla-productos");
    if (!tablaProductos) {
      console.warn("La tabla de productos no existe en esta página.");
      return;
    }

    tablaProductos.innerHTML = "";
    const hoy = new Date();
    hoy.setHours(0,0,0,0); // solo fecha

    productos.forEach((producto) => {
      const fechaCad = new Date(producto.fecha_cad);
      const caducado = fechaCad < hoy;

      if (caducado) return; // Saltar productos caducados

      const tr = document.createElement("tr");

      const tdId = document.createElement("td");
      tdId.textContent = producto.id_producto || "";

      const tdDescripcion = document.createElement("td");
      tdDescripcion.textContent = producto.descripcion || "";

      const tdStock = document.createElement("td");
      tdStock.textContent = producto.stock != null ? producto.stock : "";

      const tdPrecio = document.createElement("td");
      tdPrecio.textContent = producto.precio != null ? producto.precio.toLocaleString() : "";

      tr.appendChild(tdId);
      tr.appendChild(tdDescripcion);
      tr.appendChild(tdStock);
      tr.appendChild(tdPrecio);

      tablaProductos.appendChild(tr);
    });

    inicializarSeleccionProducto();
  } catch (error) {
    console.error(error);
    mostrarMensaje("Error al cargar productos");
  }
}



//----------------------------------------------------------
//               SELECCIÓN DE PRODUCTO
//----------------------------------------------------------
function inicializarSeleccionProducto() {
  const tabla = document.getElementById("venta-tabla-productos");
  const spanProducto = document.getElementById("venta-producto-seleccionado");
  if (!tabla || !spanProducto) return;

  if (tabla.dataset.listenerAttached === "true") return;
  tabla.dataset.listenerAttached = "true";

  tabla.addEventListener("click", (e) => {
    const fila = e.target.closest("tr");
    if (!fila) return;

    tabla.querySelectorAll("tr").forEach(tr => tr.classList.remove("selected"));
    fila.classList.add("selected");

    spanProducto.textContent = fila.children[1].textContent;

    productoSeleccionado = {
        id_producto: fila.children[0].textContent,
        descripcion: fila.children[1].textContent,
        stock: parseFloat(fila.children[2].textContent, 10),
        precio: parseFloat(fila.children[3].textContent.replace(/,/g,''))
    };
        console.log("Producto seleccionado:", productoSeleccionado);
  });
}













// ----------------------------------------------------------------------------------
//                       DETALLES DE VENTAS
// ----------------------------------------------------------------------------------
async function agregarDetalleVentaAPI(detalle) {
    if (!ventaActual || !ventaActual.id_venta) {
        mostrarToast("Primero crea una venta");
        return false;
    }

    const data = {
        id_venta: ventaActual.id_venta,
        id_producto: detalle.id_producto,
        cantidad: detalle.cantidad,
        precio: detalle.precio,
        precio_total: detalle.precio_total
    };

    try {
        const response = await fetchConToken(`${API_URL}/detalleVenta`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log("Respuesta API detalle venta:", result);
        if (!response.ok) {
            mostrarToast(result.error || "Error al agregar detalle");
            return false;
        }
        return result; // Devuelve el detalle guardado 
    } catch (err) {
        console.error(err);
        mostrarToast("Error al agregar detalle (ver consola)");
        return false;
    }
}



async function eliminarDetalleVentaAPI(detalle) {
    const { id_renglon, id_venta, id_producto } = detalle;

    if (!id_venta || !id_renglon || !id_producto) {
        mostrarToast("Datos de detalle incompletos");
        return false;
    }

    try {
        const response = await fetchConToken(
            `${API_URL}/detalleVenta/${id_renglon}/${id_venta}/${id_producto}`, 
            { method: "DELETE" }
        );

        if (!response.ok) {
            const result = await response.json();
            mostrarToast(result.error || "Error al eliminar detalle");
            return false;
        }

        return true;
    } catch (err) {
        console.error(err);
        mostrarToast("Error al eliminar detalle (ver consola)");
        return false;
    }
}
async function eliminarDetalle(index) {
    const detalle = carrito[index];

    if (detalle.id_renglon) {
        const exito = await eliminarDetalleVentaAPI(detalle);
        if (!exito) return;
    }

    carrito.splice(index, 1);
    actualizarTablaCarrito();
    actualizarTotalVenta();
    await cargarProductosVentas(); //Actualiza el stock en la tabla

}





let carrito = [];               // productos agregados temporalmente
let productoSeleccionado = null; // producto seleccionado


function actualizarTablaCarrito() {
    const tbody = document.querySelector("#venta-tabla-carrito tbody");
    tbody.innerHTML = "";

    carrito.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${item.cantidad}</td>
            <td>${item.descripcion}</td>
            <td>${item.precio_total.toLocaleString()}</td>
            <td class="actions">
                <button class="btn-delete" data-index="${index}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

  // Asignar evento click a todos los botones recién creados
    document.querySelectorAll("#venta-tabla-carrito .btn-delete").forEach(btn => {
        btn.addEventListener("click", () => {
            const index = parseInt(btn.dataset.index, 10);
            eliminarDetalle(index);
        });
    });
}
function actualizarTotalVenta() {
    const total = carrito.reduce((sum, item) => sum + item.precio_total, 0);
    document.getElementById("venta-total-venta").textContent = total.toLocaleString();
}









async function agregarProductoAlCarrito(producto, cantidad) {
    if (!producto) {
        mostrarToast("Selecciona un producto primero");
        return;
    }

    if (window._agregandoProducto) return;
    window._agregandoProducto = true;

    try {
        let stockDisponible = 0;

try {
    // Leer todos los productos y filtrar por ID
    const resAll = await fetchConToken(`${API_URL}/productos`);
    const all = await resAll.json();
    const prodActual = all.find(p => String(p.id_producto) === String(producto.id_producto));

    stockDisponible = Number(prodActual?.stock ?? 0);

} catch (err) {
    console.warn("Error obteniendo stock, usando stock del producto seleccionado");
    stockDisponible = producto.stock ?? 0;
}

        // asegurar número
        stockDisponible = Number.isFinite(stockDisponible) ? stockDisponible : 0;

        // 2) validar
        if (stockDisponible <= 0) {
            mostrarToast("No queda stock disponible de este producto");
            return;
        }
        if (cantidad < 0.01 || cantidad > stockDisponible) {
            mostrarToast("Cantidad inválida");
            return;
        }

        // 3) preparar detalle
        const precioTotal = cantidad * producto.precio;
        const detalle = {
            id_producto: producto.id_producto,
            descripcion: producto.descripcion,
            cantidad,
            precio: producto.precio,
            precio_total: precioTotal
        };

        // 4) llamar API para guardar el detalle (esto revisionará stock en BD)
        const detalleGuardado = await agregarDetalleVentaAPI(detalle);
        if (!detalleGuardado || !detalleGuardado.detalle) return;

        const detalleCompleto = {
            ...detalle,
            ...detalleGuardado.detalle,
            id_renglon: parseInt(detalleGuardado.detalle.id_renglon, 10),
            id_venta: parseInt(detalleGuardado.detalle.id_venta, 10),
            cantidad: parseFloat(detalleGuardado.detalle.cantidad),
            precio: parseFloat(detalleGuardado.detalle.precio),
            precio_total: parseFloat(detalleGuardado.detalle.precio_total)
        };

        carrito.push(detalleCompleto);
        actualizarTablaCarrito();
        actualizarTotalVenta();

        // 5) refrescar tabla productos para mostrar nuevo stock desde API
        await cargarProductosVentas();

    } catch (err) {
        console.error(err);
        mostrarToast("Error al agregar producto");
    } finally {
        window._agregandoProducto = false; // desbloquear
    }
}
