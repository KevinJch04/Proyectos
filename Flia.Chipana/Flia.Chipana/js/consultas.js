function mostrarConsulta(tipo) {
  const contenedorPrincipal = document.getElementById("consultas-container");
  const detalle = document.getElementById("consulta-detalle");

  // Ocultar las tarjetas y mostrar el panel de detalle
  contenedorPrincipal.style.display = "none";
  detalle.style.display = "block";

  let contenido = `
    <button class="btn-volver" onclick="volverConsultas()">← Volver</button>
  `;

  switch (tipo) {
    case "productosproveedores":
      contenido += `
        <h3>Productos con Proveedores</h3>
        <button onclick="consultarProductosProveedores()">Consulta</button>
        <div id="resultado"></div>
      `;
      break;

    case "productosmasvendidos":
      contenido += `
        <h3>Producto más vendido</h3>
        <div class="form-consulta">
        <label>Desde: <input type="date" id="desde"></label>
        <label>Hasta: <input type="date" id="hasta"></label>
        </div>
        <button onclick="consultarProductosMasVendidos()">Consultar</button>
        <div id="resultado"></div>
      `;
      break;

    case "ventaporfecha":
      contenido += `
        <h3>Ventas por Fecha</h3>
        <div class="form-consulta">
        <label>Desde: <input type="date" id="desde"></label>
        <label>Hasta: <input type="date" id="hasta"></label>
        </div>
        <button onclick="consultarVentasPorFecha()">Consultar</button>
        <div id="resultado"></div>

      `;
      break;
      case "productoproveedor": 
      contenido += `
      <h3>Productos por Proveedor</h3> 
          <div class="form-consulta">
      <label>ID Proveedor: <input type="number" id="id_proveedor">
      </div>
      </label> <button onclick="consultarProductoPorProveedor()">
      Consultar</button> 
      <div id="resultado"></div>
      `;  
      break;

    case "productofechacaducidad":
      contenido += `
        <h3>Productos por Fecha de Caducidad</h3>
          <div class="form-consulta">
        <label>Desde: <input type="date" id="desde"></label>
        <label>Hasta: <input type="date" id="hasta"></label>
            </div>
        <button onclick="consultarProductosCaducidad()">Consultar</button>
        <div id="resultado"></div>
      `;
      break;
  }

  detalle.innerHTML = contenido;
}

// Botón volver a las tarjetas
function volverConsultas() {
  document.getElementById("consulta-detalle").style.display = "none";
  document.getElementById("consultas-container").style.display = "block";
}

// Mostrar resultado en tabla
function mostrarResultado(data) {
    const cont = document.getElementById("resultado");

    if (!data || data.length === 0) {
        cont.innerHTML = "<p>No se encontraron resultados.</p>";
    return;
    }

  // Obtener las claves del primer objeto para generar encabezados
    const columnas = Object.keys(data[0]);

    let tabla = `
        <div class="table-scroll-container">
        <table class="custom-table">
        <thead>
        <tr>
        `;

    columnas.forEach(col => {
        tabla += `<th>${col}</th>`;
    });

    tabla += `
            </tr>
            </thead>
            <tbody>
            `;

  // Generar filas dinámicamente
    data.forEach(fila => {
    tabla += "<tr>";
    columnas.forEach(col => {
        tabla += `<td>${fila[col] ?? ""}</td>`;
        });
    tabla += "</tr>";
    });

    tabla += `
        </tbody>
        </table>
    </div>
    `;

    cont.innerHTML = tabla;
}

// ---- Consultas Fetch a la API---- //

function consultarProductosProveedores() {
    fetchConToken(`${API_URL}/productosproveedores`)
    .then(res => res.json())
    .then(mostrarResultado)
    .catch(err => console.error(err));
}

function consultarProductosMasVendidos() {
    const d = document.getElementById("desde").value;
    const h = document.getElementById("hasta").value;
    fetchConToken(`${API_URL}/productosmasvendidos/${d}/${h}`)
    .then(res => res.json())
    .then(mostrarResultado)
    .catch(err => console.error(err));
}

function consultarVentasPorFecha() {
    const d = document.getElementById("desde").value;
    const h = document.getElementById("hasta").value;
    fetchConToken(`${API_URL}/ventaporfecha/${d}/${h}`)
    .then(res => res.json())
    .then(mostrarResultado)
    .catch(err => console.error(err));
}

function consultarProductoPorProveedor() {
    const id = document.getElementById("id_proveedor").value;
    fetchConToken(`${API_URL}/productoproveedor/${id}`)
    .then(res => res.json())
    .then(mostrarResultado)
    .catch(err => console.error(err));
}

function consultarProductosCaducidad() {
    const d = document.getElementById("desde").value;
    const h = document.getElementById("hasta").value;
    fetchConToken(`${API_URL}/productofechacaducidad/${d}/${h}`)
    .then(res => res.json())
    .then(mostrarResultado)
    .catch(err => console.error(err));
}
