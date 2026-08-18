<?php
namespace App;
class DetalleVentaRepository {
    private $pdo;  

    public function __construct() {  //funcion que se ejecuta automaticamente y guardar la conexion para poder usarla en los metodos
    $this->pdo = Conexion::getConexion();   //conexion estatica
}

    // Mostrar todos los detalles de venta
    public function obtenerTodosLosDetallesVenta() {
        $stmt = $this->pdo->query("SELECT * FROM vw_mostrar_detalle_venta");
        return $stmt->fetchAll();  //devuelve todo los registros (array) de la consulata
    }

    // Crear detalle de venta
     // Crear detalle de venta
    public function crearDetalleVenta($data) {   //data se llena desde el index en el post
  // Obtener el ID más alto actual
     $stmt = $this->pdo->query("SELECT MAX(id_renglon) AS max_id FROM detalle_venta");
    $maxIdRow = $stmt->fetch(\PDO::FETCH_ASSOC);
    $nuevoId = ($maxIdRow['max_id'] ?? 0) + 1;
    $stmt = $this->pdo->prepare("EXEC spu_crear_detalle_venta  @id_renglon =:id_renglon, @id_venta =:id_venta, @id_producto = :id_producto, @precio_total = :precio_total, @cantidad = :cantidad, @precio = :precio");

    $stmt->bindParam(':id_renglon',$nuevoId);
    $stmt->bindParam(':id_venta', $data['id_venta']);
    $stmt->bindParam(':id_producto', $data['id_producto']);
    $stmt->bindParam(':precio_total', $data['precio_total']);
    $stmt->bindParam(':cantidad', $data['cantidad']);
    $stmt->bindParam(':precio', $data['precio']);

      if($stmt->execute()) {
        // Retornar el detalle completo
        return [
            "id_renglon" => $nuevoId,
            "id_venta" => $data['id_venta'],
            "id_producto" => $data['id_producto'],
            "cantidad" => $data['cantidad'],
            "precio" => $data['precio'],
            "precio_total" => $data['precio_total']
        ];
    }
    return false;
}

    // Actualizar detalle de venta
    public function actualizarDetalleVenta($id_renglon,$id_venta,$id_producto, $data) {
        $sql = "EXEC spu_modificar_detalle_venta @id_renglon =:id_renglon, @id_venta =:id_venta, @id_producto = :id_producto, @precio_total = :precio_total, @cantidad = :cantidad, @precio = :precio";
        $stmt = $this->pdo->prepare($sql);

        $data["id_renglon"] = $id_renglon;
        $data["id_venta"] = $id_venta;
        $data["id_producto"] = $id_producto;
        return $stmt->execute($data);
    }

    // Eliminar detalle de venta
    public function eliminarDetalleVenta($id_renglon, $id_venta, $id_producto) {
        $stmt = $this->pdo->prepare("EXEC spu_eliminar_detalle_venta @id_renglon =:id_renglon, @id_venta =:id_venta, @id_producto =:id_producto");
        return $stmt->execute(["id_renglon" => $id_renglon,"id_venta" => $id_venta, "id_producto" => $id_producto]);
    }
}