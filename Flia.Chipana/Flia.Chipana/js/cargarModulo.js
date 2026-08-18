  //ej onclick="cargarModulo('clientes.hmtl')" - clientes.html se pasa como parametro en (modulo)
function cargarModulo(modulo) {
    fetch("modulos/" + modulo)  //peticion al servidor de modulos/clientes.php
        .then(res => {
            if (!res.ok) throw new Error("HTTP error " + res.status);
            return res.text();        //verificar si la respuesta no fue exitosa
        })
        .then(data => {
            document.getElementById("contenido").innerHTML = data; //inserta todo el contenido dentro
            // Configuracion de el buscador según el módulo
            switch (modulo) {
                case "clientes.html":
              // Aquí llamas cargarClientes para que cargue la tabla
                    cargarClientes();
                    inicializarAgregarCliente();
                    inicializarEditarCliente();
                    inicializarEliminarCliente();
                    inicializarBuscadorGlobal(".search-bar", ".custom-table", [0, 1, 2]); // id, nombre, apellido
                    break;

                case "formaspago.html":
              // Aquí llamas cargarFormasPago para que cargue la tabla
                    cargarFormasPago();
                    inicializarAgregarFormaPago();
                    inicializarEditarFormaPago();
                    inicializarEliminarFormaPago();
                    inicializarBuscadorGlobal(".search-bar", ".custom-table", [0, 1, 2]); // id, nombre, apellido
                    break;

                case "productos.html":
                    cargarProductos();
                    inicializarAgregarProducto();
                    inicializarEditarProducto();
                    inicializarEliminarProducto();
                    inicializarBuscadorGlobal(".search-bar", ".custom-table", [0, 1, 2]); //id, descripcion, stock
                    break;

                case "proveedores.html":
                    cargarProveedores();
                    inicializarAgregarProveedor();
                    inicializarEditarProveedor();
                    inicializarEliminarProveedor();
                    inicializarBuscadorGlobal(".search-bar", ".custom-table", [0, 1]); // id, nombre
                    break;


                case "ventas.html":
                    cargarVentas();
                    inicializarEliminarVenta();
                    inicializarTicketPDF()
                  // 1. Cargar clientes en el select
                    inicializarEventosVentas(); 
                    inicializarBuscadorGlobal("#venta-buscar-productos",".venta-table", [0, 1]); // id, fecha, total
                    break;
                
                case "consultas.html":
                    break;

                default:
                    inicializarBuscadorGlobal(".search-bar", ".custom-table"); // genérico para formas de pago por ej
                    break;
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById("contenido").innerHTML = "<p>Error al cargar el módulo.</p>";
        });
}
