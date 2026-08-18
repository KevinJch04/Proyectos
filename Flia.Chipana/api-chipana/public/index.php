<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
//Autenticacion toker
use Tuupola\Middleware\JwtAuthentication;
use Firebase\JWT\JWT;
use App\Conexion;
use App\ClientesRepository;
use App\FormasPagoRepository;
use App\DetalleFormaPagoRepository;
use App\ProveedoresRepository;
use App\VentasRepository;
use App\DetalleVentaRepository;
use App\ProductosRepository;
use App\ConsultasRepository;
use App\middleware\RoleMiddleware;

//---------------------
//RUTAS
//---------------------
require __DIR__ . '/../vendor/autoload.php';
require __DIR__ . '/../src/conexion.php';
require __DIR__ . '/../src/clientesRepository.php';
require __DIR__ . '/../src/UsuariosRepository.php';
require __DIR__ . '/../src/FormasPagoRepository.php';
require __DIR__ . '/../src/ProveedoresRepository.php';
require __DIR__ . '/../src/productosRepository.php';
require __DIR__ . '/../src/DetalleFormaPagoRepository.php';
require __DIR__ . '/../src/VentasRepository.php';
require __DIR__ . '/../src/DetalleVentaRepository.php';
require __DIR__ . '/../src/ConsultasRepository.php';
require __DIR__ . '/../src/middleware/roleMiddleware.php';


$app = AppFactory::create();
$app->addBodyParsingMiddleware();
 

//-------------------------------------------------------
// RUTA DE LOGIN PARA GENERAR TOKEN (PARA USER O ADMIN)
//-------------------------------------------------------

$app->post('/login', function (Request $request, Response $response) {
$header = $request->getHeaderLine('Authorization');


    //validar qu el ancabezado empiece con Basic, sino entra al if y tira error 
    if (strpos($header, 'Basic ') !== 0) {
        $response->getBody()->write(json_encode(["error" => "Falta encabezado Authorization"]));
        return $response->withStatus(400)->withHeader('Content-Type', 'application/json');
    }

    // Decodificar credenciales  (quitar Basic) y comvertir a texto
    $solocredenciales = substr($header, 6);     //6: para empezar en la posicion 6 (Basic)
    $textocredenciales = base64_decode($solocredenciales);

    // Separar usuario y contraseña
    $partes = explode(':', $textocredenciales, 2);
    $username = $partes[0];
    $password = $partes[1];

    $repo = new \App\UsuariosRepository();
    $user = $repo->obtenerUsuarioPorUsername($username);

     if (!$user || $password !== $user['contraseña']) {
        $response->getBody()->write(json_encode(["error" => "Credenciales incorrectas."]));
        return $response->withStatus(401)->withHeader('Content-Type', 'application/json');
     }
    $role = $user['rol'];


    $key = "FliaChipana2025";      
    $payload = [
        "iss" => "example.com",
        "aud" => "example.com",
        "iat" => time(),
        "nbf" => time(),
        "exp" => time() + 86400,
        "data" => [
            "id_usuario" => $user["id_usuario"], 
            "username" => $username,
            "role" => $role
        ]
    ];

    $token = JWT::encode($payload, $key, 'HS256');
    $response->getBody()->write(json_encode(["token" => $token, "role" => $role]));
    return $response->withHeader('Content-Type', 'application/json');
});
// Middleware para permitir CORS
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, Origin')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});
// Permitir preflight OPTIONS para todas las rutas
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response
        ->withHeader('Access-Control-Allow-Origin', '*')
        ->withHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, Origin')
        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
});
//-------------------------------------------------------
// MIDDLEWARE JWT
//-------------------------------------------------------
$app->add(new JwtAuthentication([
    "secret" => "FliaChipana2025",
    "attribute" => "token",
    "path" => ["/"],
    "ignore" => ["/api-chipana/public/login"],
    "algorithm" => ["HS256"],
    "secure" => false
    
]));




//-------------------------------------------------------
// CRUD CLIENTES USANDO CLASE
//-------------------------------------------------------

//mostrar todos los clietes
$app->get('/clientes', function (Request $request, Response $response) {
    $repo = new ClientesRepository();
    $data = $repo->obtenerTodosLosClientes(); //metodo de la clase Clientes
    $response->getBody()->write(json_encode($data));   
    return $response->withHeader('Content-Type', 'application/json');
});


$app->post('/clientes', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);   //obtiene lo que envio en el body
    $repo = new ClientesRepository();

     if($repo->crearCliente($data)) { //metodo de la clase Cliente
        $response->getBody()->write(json_encode(["message" => "Cliente creado"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al crear cliente"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});


$app->put('/clientes/{id_cliente}', function (Request $request, Response $response, $args) {
    $id_cliente = $args["id_cliente"];    //obtiene el id que esta el URL
    $data = json_decode($request->getBody(), true);  //obtiene los datos enviado en el body
    $repo = new ClientesRepository();

    if($repo->actualizarCliente($id_cliente, $data)) { 
        $response->getBody()->write(json_encode(["message" => "Cliente actualizado"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al actualizar cliente"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

$app->delete('/clientes/{id_cliente}', function (Request $request, Response $response, $args) {
    $id_cliente = $args["id_cliente"];   //obtiene el id por la URL
    $repo = new ClientesRepository();

   if($repo->eliminarCliente($id_cliente)) {
        $response->getBody()->write(json_encode(["message" => "Cliente eliminado"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al eliminar cliente"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
})->add(new RoleMiddleware(['admin']));



//-------------------------------------------------------
// CRUD DETALLE FORMAS DE PAGO USANDO CLASE
//-------------------------------------------------------

//-------------------------------------------------------
// CRUD DETALLE FORMAS DE PAGO
//-------------------------------------------------------

// Mostrar todos los detalles de forma de pago
$app->get('/detalleformapago', function (Request $request, Response $response) {
    $repo = new DetalleFormaPagoRepository();
    $data = $repo->obtenerTodosLosDetallesFormaDePago();
    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});


// Crear un detalle de forma de pago
$app->post('/detalleformapago', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);
    $repo = new DetalleFormaPagoRepository();

    if ($repo->crearDetalleFormaPago($data)) {
        $response->getBody()->write(json_encode(["message" => "Detalle de forma de pago creado"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al crear detalle de forma de pago"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});


// Actualizar un detalle de forma de pago
$app->put('/detalleformapago/{id_venta}/{id_forma_pago}', function (Request $request, Response $response, $args) {
    $id_venta = $args["id_venta"];
    $id_forma_pago = $args["id_forma_pago"];

    $data = json_decode($request->getBody(), true);
    $repo = new DetalleFormaPagoRepository();
    
    $data['id_venta'] = $id_venta;
    $data['id_forma_pago'] = $id_forma_pago;

    if ($repo->actualizarDetalleFormaPago($id_venta, $id_forma_pago, $data)) {
        $response->getBody()->write(json_encode(["message" => "Detalle de forma de pago actualizada"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al actualizar el detalle de forma de pago"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

$app->delete('/detalleformapago/{id_venta}/{id_forma_pago}', function (Request $request, Response $response, $args) {
    $id_venta = $args["id_venta"];
    $id_forma_pago = $args["id_forma_pago"];
    $repo = new DetalleFormaPagoRepository();

    if ($repo->eliminarDetalleFormaPago($id_venta, $id_forma_pago)) {
        $response->getBody()->write(json_encode(["message" => "Detalle de forma de pago eliminado"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al eliminar detalle de forma de pago"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});





//-------------------------------------------------------
// CRUD FORMAS DE PAGO USANDO CLASE
//-------------------------------------------------------

//mostrar todos los clietes
$app->get('/formaspago', function (Request $request, Response $response) {
    $repo = new FormasPagoRepository();
    $data = $repo->obtenerTodasLasFormasDePago(); //metodo de la clase Clientes
    $response->getBody()->write(json_encode($data));   
    return $response->withHeader('Content-Type', 'application/json');
});


$app->post('/formaspago', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);   //obtiene lo que envio en el body
    $repo = new FormasPagoRepository();

     if($repo->crearFormaPago($data)) { //metodo de la clase Cliente
        $response->getBody()->write(json_encode(["message" => "Forma de Pago creada"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al crear la forma de pago"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});


$app->put('/formaspago/{id_forma_pago}', function (Request $request, Response $response, $args) {
    $id_forma_pago = $args["id_forma_pago"];    //obtiene el id que esta el URL
    $data = json_decode($request->getBody(), true);  //obtiene los datos enviado en el body
    $repo = new FormasPagoRepository();

    if($repo->actualizarFormaPago($id_forma_pago, $data)) { 
        $response->getBody()->write(json_encode(["message" => "Forma de Pago actualizada"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al actualizar la forma de pago"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

$app->delete('/formaspago/{id_forma_pago}', function (Request $request, Response $response, $args) {
    $id_forma_pago = $args["id_forma_pago"];   //obtiene el id por la URL
    $repo = new FormasPagoRepository();

   if($repo->eliminarFormaPago($id_forma_pago)) {
        $response->getBody()->write(json_encode(["message" => "Forma de Pago eliminada"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al eliminar la forma de pago"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
})->add(new RoleMiddleware(['admin']));

//-------------------------------------------------------
// CRUD PROVEEDORES USANDO CLASE
//-------------------------------------------------------

//mostrar todos los proveedores
$app->get('/proveedores', function (Request $request, Response $response) {
    $repo = new ProveedoresRepository();
    $data = $repo->obtenerTodosLosProvedores(); //metodo de la clase proveedores
    $response->getBody()->write(json_encode($data));   
    return $response->withHeader('Content-Type', 'application/json');
});


$app->post('/proveedores', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);   //obtiene lo que envio en el body
    $repo = new ProveedoresRepository();

     if($repo->crearProveedor($data)) { //metodo de la clase Proveedores
        $response->getBody()->write(json_encode(["message" => "Proveedor creado"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al crear el proveedor"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});


$app->put('/proveedores/{id_proveedor}', function (Request $request, Response $response, $args) {
    $id_proveedor = $args["id_proveedor"];    //obtiene el id que esta el URL
    $data = json_decode($request->getBody(), true);  //obtiene los datos enviado en el body
    $repo = new ProveedoresRepository();

    if($repo->actualizarProveedores($id_proveedor, $data)) { 
        $response->getBody()->write(json_encode(["message" => "Proveedor actualizado"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al actualizar el proveedor"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

$app->delete('/proveedores/{id_proveedor}', function (Request $request, Response $response, $args) {
    $id_proveedor = $args["id_proveedor"];   //obtiene el id por la URL
    $repo = new ProveedoresRepository();

   if($repo->eliminarProveedor($id_proveedor)) {
        $response->getBody()->write(json_encode(["message" => "Proveedor eliminado"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al eliminar el proveedor"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
})->add(new RoleMiddleware(['admin']));


//-------------------------------------------------------
// CRUD PRODUCTOS USANDO CLASE
//-------------------------------------------------------

//mostrar todos los proveedores
$app->get('/productos', function (Request $request, Response $response) {
    $repo = new ProductosRepository();
    $data = $repo->obtenerTodosLosProductos(); //metodo de la clase proveedores
    $response->getBody()->write(json_encode($data));   
    return $response->withHeader('Content-Type', 'application/json');
});


$app->post('/productos', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);   //obtiene lo que envio en el body
    $repo = new ProductosRepository();

     if($repo->crearProducto($data)) { //metodo de la clase Proveedores
        $response->getBody()->write(json_encode(["message" => "Producto creado"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al crear el producto"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});


$app->put('/productos/{id_producto}', function (Request $request, Response $response, $args) {
    $id_producto = $args["id_producto"];    //obtiene el id que esta el URL
    $data = json_decode($request->getBody(), true);  //obtiene los datos enviado en el body
    $repo = new ProductosRepository();

    if($repo->actualizarProducto($id_producto, $data)) { 
        $response->getBody()->write(json_encode(["message" => "Producto actualizado"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al actualizar el producto"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

$app->delete('/productos/{id_producto}', function (Request $request, Response $response, $args) {
    $id_producto = $args["id_producto"];   //obtiene el id por la URL
    $repo = new ProductosRepository();

   if($repo->eliminarProducto($id_producto)) {
        $response->getBody()->write(json_encode(["message" => "Producto eliminado"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al eliminar el producto"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
})->add(new RoleMiddleware(['admin']));

//-------------------------------------------------------
// CRUD VENTAS USANDO CLASE
//-------------------------------------------------------

//mostrar todas las ventas
$app->get('/ventas', function (Request $request, Response $response) {
    $repo = new VentasRepository();
    $data = $repo->obtenerTodasLasVentas(); //metodo de la clase Ventas
    $response->getBody()->write(json_encode($data));   
    return $response->withHeader('Content-Type', 'application/json');
});


$app->post('/ventas', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);   //obtiene lo que envio en el body
    $repo = new VentasRepository();
    $ventaCreada = $repo->crearVenta($data); 
     if($ventaCreada) { //metodo de la clase Ventas
        $response->getBody()->write(json_encode(["message" => "Venta creada",  "venta" => $ventaCreada  ]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al crear la venta"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

$app->put('/ventas/{id_venta}', function (Request $request, Response $response, $args) {
    $id_venta = $args["id_venta"];    //obtiene el id que esta el URL
    $data = json_decode($request->getBody(), true);  //obtiene los datos enviado en el body
    $repo = new VentasRepository();

    if($repo->actualizarVenta($id_venta, $data)) { 
        $response->getBody()->write(json_encode(["message" => "Venta actualizada"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al actualizar la venta"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

$app->delete('/ventas/{id_venta}', function (Request $request, Response $response, $args) {
    $id_venta = $args["id_venta"];   //obtiene el id por la URL
    $repo = new VentasRepository();

   if($repo->eliminarVenta($id_venta)) {
        $response->getBody()->write(json_encode(["message" => "Venta eliminada"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al eliminar la venta"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
})->add(new RoleMiddleware(['admin', 'vendedor']));



//-------------------------------------------------------
// CRUD DETALLE DE VENTA USANDO CLASE
//-------------------------------------------------------

$app->get('/detalleVenta', function (Request $request, Response $response) {
    $repo = new DetalleVentaRepository();
    $data = $repo->obtenerTodosLosDetallesVenta(); //metodo de la clase proveedores
    $response->getBody()->write(json_encode($data));   
    return $response->withHeader('Content-Type', 'application/json');
});


$app->post('/detalleVenta', function (Request $request, Response $response) {
    $data = json_decode($request->getBody(), true);   //obtiene lo que envio en el body
    $repo = new DetalleVentaRepository();
   $detalleCreado = $repo->crearDetalleVenta($data); // retorna el detalle completo, incluyendo id_renglon

    if($detalleCreado) {
        $response->getBody()->write(json_encode([
            "message" => "Detalle de venta creado",
            "detalle" => $detalleCreado
        ]));
     
        return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al crear el detalle de venta"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

$app->put('/detalleVenta/{id_renglon}/{id_venta}/{id_producto}', function (Request $request, Response $response, $args) {
    $id_renglon = $args["id_renglon"];
    $id_venta = $args["id_venta"];
    $id_producto = $args["id_producto"];    //obtiene el id que esta el URL
    $data = json_decode($request->getBody(), true);  //obtiene los datos enviado en el body
    $repo = new DetalleVentaRepository();

    if($repo->actualizarDetalleVenta($id_renglon, $id_venta, $id_producto, $data)) { 
        $response->getBody()->write(json_encode(["message" => "Detalle de venta actualizado"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al actualizar el detalle de venta"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
});

$app->delete('/detalleVenta/{id_renglon}/{id_venta}/{id_producto}', function (Request $request, Response $response, $args) {
    $id_renglon = $args["id_renglon"];
    $id_venta = $args["id_venta"];
    $id_producto = $args["id_producto"]; //obtiene el id por la URL
    $repo = new DetalleVentaRepository();

   if($repo->eliminarDetalleVenta($id_renglon, $id_venta, $id_producto)) {
        $response->getBody()->write(json_encode(["message" => "Detalle de venta eliminado"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    } else {
        $response->getBody()->write(json_encode(["message" => "Error al eliminar el detalle de venta"]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }
})->add(new RoleMiddleware(['admin', 'vendedor']));

//-------------------------------------------------------
// CONSULTAS
//-------------------------------------------------------

$app->get('/productosproveedores', function (Request $request, Response $response) {
    $repo = new ConsultasRepository();
    $data = $repo->obtenerTodosLosProductosConProveedores(); //metodo de la clase proveedores
    $response->getBody()->write(json_encode($data));   
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/productosmasvendidos/{fecha_desde}/{fecha_hasta}', function (Request $request, Response $response, array $args){
    $fecha_desde = $args["fecha_desde"];
    $fecha_hasta = $args["fecha_hasta"];

    $repo = new ConsultasRepository();
    $data = $repo->productoMasVendido($fecha_desde , $fecha_hasta);

    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/ventaporfecha/{fecha_desde}/{fecha_hasta}', function (Request $request, Response $response, array $args){
    $fecha_desde = $args["fecha_desde"];
    $fecha_hasta = $args["fecha_hasta"];

    $repo = new ConsultasRepository();
    $data = $repo->ventaPorFecha($fecha_desde , $fecha_hasta);

    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/productoproveedor/{id_proveedor}', function (Request $request, Response $response, array $args){
    $id_proveedor = $args["id_proveedor"];

    $repo = new ConsultasRepository();
    $data = $repo->productoPorProveedor($id_proveedor);

    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/productofechacaducidad/{fecha_desde}/{fecha_hasta}', function (Request $request, Response $response, array $args){
    $fecha_desde = $args["fecha_desde"];
    $fecha_hasta = $args["fecha_hasta"];

    $repo = new ConsultasRepository();
    $data = $repo->productosFechaCaducidad($fecha_desde , $fecha_hasta);

    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/ventaformapago/{id_forma_pago}', function (Request $request, Response $response, array $args){
    $id_forma_pago = $args["id_forma_pago"];

    $repo = new ConsultasRepository();
    $data = $repo->ventaFormaPago($id_forma_pago);

    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/ingresosformapago/{id_forma_pago}', function (Request $request, Response $response, array $args){
    $id_forma_pago = $args["id_forma_pago"];

    $repo = new ConsultasRepository();
    $data = $repo->ingresosFormaPago($id_forma_pago);

    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->get('/ingresosfecha/{fecha_desde}/{fecha_hasta}', function (Request $request, Response $response, array $args){
    $fecha_desde = $args["fecha_desde"];
    $fecha_hasta = $args["fecha_hasta"];

    $repo = new ConsultasRepository();
    $data = $repo->ingresosPorFecha($fecha_desde , $fecha_hasta);

    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});

$app->addErrorMiddleware (true,true,true);
$app->setBasePath('/api-chipana/public');


$app->run();
?>