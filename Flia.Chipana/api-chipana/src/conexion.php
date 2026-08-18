<?php
namespace App;

use PDO;
use PDOException;
use Dotenv\Dotenv; 

class Conexion {
    private static $pdo = null;

    // Método estático para obtener la conexión PDO
    public static function getConexion() {
        if (self::$pdo === null) {    //Guarda la conexion y null para verificar si no hya una conexion creada
            // Cargar variables de entorno
            $dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
            $dotenv->load();

            $host     = $_ENV['DB_HOST'];
            $db       = $_ENV['DB_NAME'];
            $port     = $_ENV['DB_PORT'];
            $usuario  = $_ENV['DB_USER'];
            $password = $_ENV['DB_PASS'];

            $dsn = "sqlsrv:Server=$host" . (!empty($port) ? ",$port" : "") . ";Database=$db;Encrypt=optional;TrustServerCertificate=yes";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            try {
                self::$pdo = new PDO($dsn, $usuario, $password, $options);
            } catch (PDOException $e) {
                error_log($e->getMessage());
                die('Error al conectarse a la base de datos.');
            }
        }

        return self::$pdo;   //Devuelve la conexión PDO creada, cada vez que llamas a Conexion::getConexion()
    }
}
?>
