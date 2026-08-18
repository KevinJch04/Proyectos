<?php
namespace App;
class ProductosRepository {
    private $pdo;  

    public function __construct() {  //funcion que se ejecuta automaticamente y guardar la conexion para poder usarla en los metodos
    $this->pdo = Conexion::getConexion();   //conexion estatica
}

    // Mostrar todos los clientes
    public function obtenerTodosLosProductos() {
        $stmt = $this->pdo->query("SELECT * FROM vw_mostrar_productos");
        return $stmt->fetchAll();  //devuelve todo los registros (array) de la consulata
    }

    // Crear cliente
    public function crearProducto($data) {   //data se llena desde el index en el post
        // Obtener el ID más alto actual
    $stmt = $this->pdo->query("SELECT MAX(id_producto) AS max_id FROM productos");
    $maxIdRow = $stmt->fetch(\PDO::FETCH_ASSOC);
    $nuevoId = ($maxIdRow['max_id'] ?? 0) + 1;

    $stmt = $this->pdo->prepare("EXEC spu_crear_producto @id_producto =:id_producto, @descripcion = :descripcion, @stock = :stock, @id_proveedor = :id_proveedor, @precio = :precio, @costo = :costo, @fecha_cad = :fecha_cad");

    $stmt->bindParam(':id_producto', $nuevoId);
    $stmt->bindParam(':descripcion', $data['descripcion']);
    $stmt->bindParam(':stock', $data['stock']);
    $stmt->bindParam(':id_proveedor', $data['id_proveedor']);
    $stmt->bindParam(':precio', $data['precio']);
    $stmt->bindParam(':costo', $data['costo']);
    $stmt->bindParam(':fecha_cad', $data['fecha_cad']);

    return $stmt->execute();
    }

    // Actualizar producto
    public function actualizarProducto($id_producto, $data) {
        $sql = "EXEC spu_modificar_producto @id_producto =:id_producto, @descripcion = :descripcion, @stock = :stock, @id_proveedor = :id_proveedor, @precio = :precio, @costo = :costo, @fecha_cad = :fecha_cad";
        $stmt = $this->pdo->prepare($sql);

        $data["id_producto"] = $id_producto; //agregar el id del cliente en el array y luego se ejecuta todo
        return $stmt->execute($data);
    }

    // Eliminar producto
    public function eliminarProducto($id_producto) {
        $stmt = $this->pdo->prepare("EXEC spu_eliminar_producto @id_producto = :id_producto");
        return $stmt->execute(["id_producto" => $id_producto]);
    }
}