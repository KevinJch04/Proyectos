HAGAN UNA INSTANTÁNEA POR LAS DUDAS ANTES DE HACER TODO

//Instalamos el driver oficial de microsoft

apt install unixodbc-dev gcc g++ make autoconf libc-dev pkg-config

//Para instalar los driver que vamos a utilizar para la conexión

(si sale orden no encontrada se instala pecl con "apt install php-pear php-dev" )

- pecl install sqlsrv
- pecl install pdo_sqlsrv

//Luego de haber instalado las extensiones hay que activarlas, para eso usamos phpenmod

- phpenmod sqlsrv
- phpenmod pdo_sqlsrv

("apt install php-common" si sale orden no encontrada, y si el error persiste "apt install --reinstall php-common")

//Reiniciamos apache2 para que se apliquen los cambios

systemctl restart apache2

//Con este comando verificamos si fueron instalados correctamente

php -m | grep sqlsrv

//Debería aparecer

pdo_sqlsrv

sqlsrv

//Si no devuelve nada usamos

/usr/sbin/phpenmod -v 8.2 sqlsrv pdo_sqlsrv

//Y volvemos a verificar

//Si te aparece

WARNING: Module sqlsrv ini file doesn't exist under /etc/php/8.2/mods-available

WARNING: Module pdo_sqlsrv ini file doesn't exist under /etc/php/8.2/mods-available

// Creamos nosotros el archivo .init de sqlsrv y pdo_sqlsrv

echo "extension=pdo_sqlsrv.so" | tee /etc/php/8.2/mods-available/pdo_sqlsrv.ini

echo "extension=sqlsrv.so" | tee /etc/php/8.2/mods-available/sqlsrv.ini

//Si sigue sin devolver nada o aparece "phpquery: not found" es porque hay un error con phpenmod y no está ejecutando el comando phpquery, así que vamos a crear un script para poder instalar pdo_sqlsrv y sqlsrv

//Creamos el script

nano /usr/bin/phpquery

//Adentro agregamos

# !/bin/bash

if \[ "\$1" = "-S" \]; then

echo "cli apache2"

elif \[ "\$1" = "-v" \]; then

echo "\$2"

else

php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;'

fi

(Este script devuelve correctamente las SAPIs (cli y apache2) cuando phpenmod lo llama.)

//Damos permisos de ejecución

chmod +x /usr/bin/phpquery

// Y volvemos a ejecutar phpenmod

/usr/sbin/phpenmod -v 8.2 sqlsrv pdo_sqlsrv

// Reiniciamos Apache2

systemctl restart apache2

//Verificamos si se cargaron correctamente

php -m | grep sqlsrv

php -m | grep pdo_sqlsrv

//Debería de aparecer

pdo_sqlsrv

sqlsrv

//Si todo funciono vamos a instalar odbc para que nos permita realizar la conexión

//Instalamos curl para que nos permita realizar los comandos

apt install curl -y

//Creamos el archivo del repositorio odbc

echo "deb \[arch=amd64\] <https://packages.microsoft.com/debian/12/prod> bookworm main" | tee /etc/apt/sources.list.d/mssql-release.list

//Agregamos la clave GPG de Microsoft

curl <https://packages.microsoft.com/keys/microsoft.asc> | gpg --dearmor > microsoft.gpg

install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/microsoft.gpg

//Actualizamos e instalamos el driver

apt update

ACCEPT_EULA=Y apt install msodbcsql18 unixodbc-dev -y

//Verificamos si se instaló

odbcinst -q -d

//Debería de mostrar

\[ODBC Driver 18 for SQL Server\]

Ya está todo listo para realizar la conexión

**Archivo de conexión**

(Acuerdense de poner la ruta de la ubicación donde se encuentra SUS archivos .env)

<?php

require \__DIR__ . '/../vendor/autoload.php';

\$dotenv = Dotenv\\Dotenv::createImmutable(\__DIR__ . '/../..');

\$dotenv->load();

\$host = \$\_ENV\['DB_HOST'\]; // _IP o nombre del servidor SQL Server_

\$db = \$\_ENV\['DB_DB'\]; // _Nombre de la base de datos_

\$usuario = \$\_ENV\['DB_USER'\]; // _Usuario SQL Server_

\$password = \$\_ENV\['DB_PASS'\]; // _Contraseña_

\$port = \$\_ENV\['DB_PORT'\]; // _Puerto (opcional, por defecto 1433)_

// _SQL Server no usa charset en el DSN_

\$dsn = "sqlsrv:Server=\$host" . (!empty(\$port) ? ",\$port" : "") . ";Database=\$db;Encrypt=optional;TrustServerCertificate=yes";

\$options = \[

PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,

PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,

PDO::ATTR_EMULATE_PREPARES => false,

\];

try {

\$pdo = new PDO(\$dsn, \$usuario, \$password, \$options);

echo 'Conexión exitosa a SQL Server.';

} catch (PDOException \$e) {

error_log(\$e->getMessage());

echo 'Error al conectarse a SQL Server.' . \$e->getMessage();

}

?>

**Archivo .env**

DB_HOST=(Pongan la ip privada de sus computadoras\[computadoras donde tienen instalado sql server, no la ip de la máquina virtual\])

DB_DB=fliachipana

DB_PORT=1433

DB_USER=

DB_PASS=

En caso de que tire error al conectarse a la base de datos(time out), seguramente sea el firewall, hay que deshabilitarlo o darle permiso al puerto 1433(el de la base de datos) para que acceda.

..