<?php
namespace App;
class ClientesRepository {
    private $pdo;  

    public function __construct() {  //funcion que se ejecuta automaticamente y guardar la conexion para poder usarla en los metodos
    $this->pdo = Conexion::getConexion();   //conexion estatica
}

    // Mostrar todos los clientes
    public function obtenerTodosLosClientes() {
        $stmt = $this->pdo->query("SELECT * FROM vw_mostrar_clientes");
        return $stmt->fetchAll();  //devuelve todo los registros (array) de la consulata
    }

    // Crear cliente
    public function crearCliente($data) {   //data se llena desde el index en el post
        // Obtener el ID más alto actual
     $stmt = $this->pdo->query("SELECT MAX(id_cliente) AS max_id FROM clientes");
    $maxIdRow = $stmt->fetch(\PDO::FETCH_ASSOC);
    $nuevoId = ($maxIdRow['max_id'] ?? 0) + 1;

    $stmt = $this->pdo->prepare("EXEC spu_crear_cliente @id_cliente =:id_cliente, @nombre = :nombre, @apellido = :apellido, @telefono = :telefono, @direccion = :direccion, @email = :email, @deuda = :deuda");

    $stmt->bindParam(':id_cliente', $nuevoId);
    $stmt->bindParam(':nombre', $data['nombre']);
    $stmt->bindParam(':apellido', $data['apellido']);
    $stmt->bindParam(':telefono', $data['telefono']);
    $stmt->bindParam(':direccion', $data['direccion']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':deuda', $data['deuda']);

     
  return $stmt->execute();
    }

    // Actualizar cliente
    public function actualizarCliente($id_cliente, $data) {
        $sql = "EXEC spu_modificar_cliente @id_cliente = :id_cliente, @nombre = :nombre, @apellido = :apellido, @telefono = :telefono, @direccion = :direccion, @email = :email, @deuda = :deuda";
        $stmt = $this->pdo->prepare($sql);

        $data["id_cliente"] = $id_cliente; //agregar el id del cliente en el array y luego se ejecuta todo
        return $stmt->execute($data);
    }

    // Eliminar cliente
    public function eliminarCliente($id_cliente) {
        $stmt = $this->pdo->prepare("EXEC spu_eliminar_cliente @id_cliente = :id_cliente");
        return $stmt->execute(["id_cliente" => $id_cliente]);
    }
}