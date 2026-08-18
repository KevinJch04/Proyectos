// ---------------------------------------------------------------
//                     FORMAS DE PAGO
// ---------------------------------------------------------------

let formasSeleccionadas = []; 
// -------------------------------------
// Obtener todas las formas de pago
// -------------------------------------
async function cargarFormasDePago() {
    try {
        const res = await fetchConToken(`${API_URL}/formaspago`);
        const data = await res.json();

        const select = document.getElementById('venta-forma-pago');
        select.innerHTML = ''; // limpiar opciones anteriores

        data.forEach(f => {
            const option = document.createElement('option');
            option.value = f.id_forma_pago;
            option.textContent = f.descripcion; // o como tengas el nombre en tu DB
            select.appendChild(option);
        });
    } catch (err) {
        console.error(err);
        alert('Error cargando formas de pago');
    }
}


// ---------------------------------------------------------------
// Guardar el detalle de la forma de pago al finalizar la venta
// ---------------------------------------------------------------

async function guardarDetalleFormaPago(id_venta, id_forma_pago, importe) {
    try {
        const res = await fetchConToken(`${API_URL}/detalleformapago`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id_venta,
                id_forma_pago,
                importe
            })
        });

        const data = await res.json();
        if (res.ok) {
            console.log('Detalle guardado');
        } else {
            console.error(data.message);
        }
    } catch (err) {
        console.error(err);
    }
}




// ------------------------------------------------------
// Actualizar o eliminar detalles
// ------------------------------------------------------
async function actualizarDetalleFormaPago(id_venta, id_forma_pago, nuevoMonto) {
    const res = await fetchConToken(`${API_URL}/detalleformapago/${id_venta}/${id_forma_pago}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ monto: nuevoMonto })
    });
    return res.json();
}

async function eliminarDetalleFormaPago(id_venta, id_forma_pago) {
    const res = await fetchConToken(`${API_URL}/detalleformapago/${id_venta}/${id_forma_pago}`, {
        method: 'DELETE'
    });
    return res.ok;
}


function actualizarListaFormasPago() {
    const ul = document.getElementById("venta-lista-formas");
    ul.innerHTML = ""; // limpiar lista

    formasSeleccionadas.forEach((f, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${f.nombre}: $${f.monto.toLocaleString()} 
            <button onclick="eliminarForma(${index})">❌</button>
        `;
        ul.appendChild(li);
    });

    // Actualizamos el vuelto
    actualizarVuelto();
}

function eliminarForma(index) {
    formasSeleccionadas.splice(index, 1);
    actualizarListaFormasPago();
}



function actualizarVuelto() {
    let totalVentaStr = document.getElementById("venta-total-venta").textContent.trim();

    // Eliminar puntos de miles
    totalVentaStr = totalVentaStr.replace(/\./g, '');

    // Reemplazar coma decimal por punto
    totalVentaStr = totalVentaStr.replace(/,/g, '.');

    const totalVenta = parseFloat(totalVentaStr);

    const totalPagado = formasSeleccionadas.reduce((sum, f) => sum + f.monto, 0);
    const vuelto = totalPagado - totalVenta;

    document.getElementById("venta-vuelto-venta").textContent =
        vuelto > 0 ? vuelto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0";
}




// ---------------------------------------------------------------
//     AGREGAR UNA FORMA DE PAGO A LA LISTA 
// ---------------------------------------------------------------
function agregarFormaDePago() {
    const select = document.getElementById("venta-forma-pago");
    const inputMonto = document.getElementById("venta-monto-forma");

    if (!select || !inputMonto) {
        console.error("Faltan elementos de forma de pago en el DOM");
        return;
    }

    const id_forma_pago = parseInt(select.value, 10);
    const nombre = select.options[select.selectedIndex].textContent;
    const monto = parseFloat(inputMonto.value);

    if (isNaN(monto) || monto <= 0) {
        mostrarToast("Monto inválido");
        return;
    }

    // Agregar al arreglo
    formasSeleccionadas.push({
        id_forma_pago,
        nombre,
        monto
    });

    // Actualizar la lista visual
    actualizarListaFormasPago();

    // Limpiar input
    inputMonto.value = "";
}