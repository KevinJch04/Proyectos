<?php
namespace App;
class FormasPagoRepository {
    private $pdo;  

    public function __construct() {  //funcion que se ejecuta automaticamente y guardar la conexion para poder usarla en los metodos
    $this->pdo = Conexion::getConexion();   //conexion estatica
}

    // Mostrar todos las formas de pago
    public function obtenerTodasLasFormasDePago() {
        $stmt = $this->pdo->query("SELECT * FROM vw_mostrar_forma_pago");
        return $stmt->fetchAll();  //devuelve todo los registros (array) de la consulata
    }

    // Crear forma de pago
    public function crearFormaPago($data) {   //data se llena desde el index en el post
        // Obtener el ID más alto actual
     $stmt = $this->pdo->query("SELECT MAX(id_forma_pago) AS max_id FROM forma_pago");
    $maxIdRow = $stmt->fetch(\PDO::FETCH_ASSOC);
    $nuevoId = ($maxIdRow['max_id'] ?? 0) + 1;

    $stmt = $this->pdo->prepare("EXEC spu_crear_forma_pago @id_forma_pago =:id_forma_pago, @descripcion = :descripcion");

    $stmt->bindParam(':id_forma_pago', $nuevoId);
    $stmt->bindParam(':descripcion', $data['descripcion']);

     
  return $stmt->execute();
    }

    // Actualizar forma de pago
    public function actualizarFormaPago($id_forma_pago, $data) {
        $sql = "EXEC spu_modificar_forma_pago @id_forma_pago = :id_forma_pago, @descripcion = :descripcion";
        $stmt = $this->pdo->prepare($sql);

        $data["id_forma_pago"] = $id_forma_pago; //agregar el id de la forma de pago en el array y luego se ejecuta todo
        return $stmt->execute($data);
    }

    // Eliminar forma de pago
    public function eliminarFormaPago($id_forma_pago) {
        $stmt = $this->pdo->prepare("EXEC spu_eliminar_forma_pago @id_forma_pago = :id_forma_pago");
        return $stmt->execute(["id_forma_pago" => $id_forma_pago]);
    }
}