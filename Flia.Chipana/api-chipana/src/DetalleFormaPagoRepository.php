<?php
namespace App;

class DetalleFormaPagoRepository{
    private $pdo;  

    public function __construct() {  
        $this->pdo = Conexion::getConexion();  
    }
    
    // Mostrar todos los detalles de formas de pago
    public function obtenerTodosLosDetallesFormaDePago() {
        $stmt = $this->pdo->query("SELECT * FROM vw_mostrar_detalle_forma_pago");
        return $stmt->fetchAll();  
    }

        // Crear detalle de forma de pago
    public function crearDetalleFormaPago($data) {   //data se llena desde el index en el post

    $stmt = $this->pdo->prepare("EXEC spu_crear_detalle_forma_pago  @id_venta =:id_venta, @id_forma_pago = :id_forma_pago, @importe = :importe");

    $stmt->bindParam(':id_venta', $data['id_venta']);
    $stmt->bindParam(':id_forma_pago', $data['id_forma_pago']);
    $stmt->bindParam(':importe', $data['importe']);
     
    return $stmt->execute();
    }

    public function actualizarDetalleFormaPago($id_venta,$id_forma_pago, $data) {
        $sql = "EXEC spu_modificar_detalle_forma_pago @id_venta =:id_venta, @id_forma_pago = :id_forma_pago, @importe = :importe";
        $stmt = $this->pdo->prepare($sql);

        $data["id_venta"] = $id_venta;
        $data["id_forma_pago"] = $id_forma_pago;
        return $stmt->execute($data);
    }

    // Eliminar detalle de forma de pago
    public function eliminarDetalleFormaPago($id_venta, $id_forma_pago) {
        $stmt = $this->pdo->prepare("EXEC spu_eliminar_detalle_forma_pago @id_venta =:id_venta, @id_forma_pago =:id_forma_pago");
        return $stmt->execute(["id_venta" => $id_venta, "id_forma_pago" => $id_forma_pago]);
    }
}
