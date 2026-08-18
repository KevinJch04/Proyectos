<?php
namespace App;
class ProveedoresRepository {
    private $pdo;  

    public function __construct() {  //funcion que se ejecuta automaticamente y guardar la conexion para poder usarla en los metodos
    $this->pdo = Conexion::getConexion();   //conexion estatica
}

    // Mostrar todos los proveedor
    public function obtenerTodosLosProvedores() {
        $stmt = $this->pdo->query("SELECT * FROM vw_mostrar_proveedores");
        return $stmt->fetchAll();  //devuelve todo los registros (array) de la consulata
    }

    // Crear proveedor
    public function crearProveedor($data) {   //data se llena desde el index en el post
        // Obtener el ID más alto actual
     $stmt = $this->pdo->query("SELECT MAX(id_proveedor) AS max_id FROM proveedores");
    $maxIdRow = $stmt->fetch(\PDO::FETCH_ASSOC);
    $nuevoId = ($maxIdRow['max_id'] ?? 0) + 1;

    $stmt = $this->pdo->prepare("EXEC spu_crear_proveedor @id_proveedor =:id_proveedor, @nombre = :nombre, @telefono = :telefono, @email = :email, @direccion = :direccion");

    $stmt->bindParam(':id_proveedor', $nuevoId);
    $stmt->bindParam(':nombre', $data['nombre']);
    $stmt->bindParam(':telefono', $data['telefono']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':direccion', $data['direccion']);

     
  return $stmt->execute();
    }

    // Actualizar proveedor
    public function actualizarProveedores($id_proveedor, $data) {
        $sql = "EXEC spu_modificar_proveedor @id_proveedor =:id_proveedor, @nombre = :nombre, @telefono = :telefono, @email = :email, @direccion = :direccion";
        $stmt = $this->pdo->prepare($sql);

        $data["id_proveedor"] = $id_proveedor; //agregar el id del cliente en el array y luego se ejecuta todo
        return $stmt->execute($data);
    }

    // Eliminar proveedor
    public function eliminarProveedor($id_proveedor) {
        $stmt = $this->pdo->prepare("EXEC spu_eliminar_proveedor @id_proveedor = :id_proveedor");
        return $stmt->execute(["id_proveedor" => $id_proveedor]);
    }
}