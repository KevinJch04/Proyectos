<?php
namespace App;

class UsuariosRepository {

    public function obtenerUsuarioPorUsername($username) {
        $db = Conexion::getConexion();
        $stmt = $db->prepare("SELECT TOP 1 id_usuario, nombre, contraseña, rol FROM usuarios WHERE nombre = :nombre");
        $stmt->execute(['nombre' => $username]);
        return $stmt->fetch(); // Devuelve array con datos o false si no existe
    }

}
