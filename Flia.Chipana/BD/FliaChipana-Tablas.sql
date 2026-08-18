create database fliachipana

use fliachipana

--Creacion de tablas------------------------------------------
create table usuarios(
id_usuario int primary key,
nombre nvarchar(60),
contraseña nvarchar(60),
rol nvarchar(60))
go


create table clientes(
id_cliente int primary key,
nombre nvarchar(60),
apellido nvarchar(60),
telefono nvarchar(15),
direccion nvarchar(60),
email nvarchar(60),
deuda decimal(18,2))
go


create table proveedores(
id_proveedor int primary key,
nombre nvarchar(60),
telefono nvarchar(15),
email nvarchar(60),
direccion nvarchar(60))
go

create table productos(
id_producto bigint primary key,
descripcion nvarchar(60),
stock decimal(18,2),
id_proveedor int,
foreign key (id_proveedor) references proveedores(id_proveedor),
precio decimal(18,2),
costo decimal(18,2),
fecha_cad date)
go


create table forma_pago(
id_forma_pago int primary key,
descripcion nvarchar(60))
go


create table ventas(
id_venta bigint primary key,
id_usuario int,
foreign key (id_usuario) references usuarios(id_usuario),
fecha datetime,
id_cliente int,
foreign key (id_cliente) references clientes(id_cliente),
total decimal(18,2))
go


create table detalle_venta(
id_renglon bigint,
id_venta bigint,
foreign key (id_venta) references ventas(id_venta),
id_producto bigint,
foreign key (id_producto) references productos(id_producto),
precio_total decimal(18,2),
cantidad decimal(18,2),
precio decimal(18,2),
primary key (id_renglon,id_venta,id_producto))
go


create table detalle_forma_pago(
id_venta bigint,
foreign key (id_venta) references ventas(id_venta),
id_forma_pago int,
foreign key (id_forma_pago) references forma_pago(id_forma_pago),
importe decimal(18,2),
primary key(id_venta,id_forma_pago))
go
---------------------------------------------------------------