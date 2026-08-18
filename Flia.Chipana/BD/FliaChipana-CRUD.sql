use fliachipana
--Mostrar------------------------------------------------------
----Productos--------------------------------------------------
create view vw_mostrar_productos
as
select id_producto,descripcion,stock,id_proveedor,precio,costo,fecha_cad from productos
go
---------------------------------------------------------------
----Cliente-----------------------------------------------------
create view vw_mostrar_clientes
as
select id_cliente,nombre,apellido,telefono,direccion,email,deuda from clientes
go
-----------------------------------------------------------------

----Usuarios-----------------------------------------------------
create view vw_mostrar_usuarios
as
select id_usuario,nombre,contraseña,rol from usuarios
go
-----------------------------------------------------------------

----Proveedores--------------------------------------------------
create view vw_mostrar_proveedores
as
select id_proveedor,nombre,telefono,email,direccion from proveedores
go
-----------------------------------------------------------------

----Forma de Pago------------------------------------------------
create view vw_mostrar_forma_pago
as
select id_forma_pago,descripcion from forma_pago
go
-----------------------------------------------------------------

------Detalle de Forma de Pago-----------------------------------
create view vw_mostrar_detalle_forma_pago
as
select id_venta,id_forma_pago,importe from detalle_forma_pago
go
-----------------------------------------------------------------

----Venta--------------------------------------------------------
create view vw_mostrar_ventas
as
select id_venta,id_usuario,fecha,id_cliente,total from ventas
go
-----------------------------------------------------------------

------Detalle de Venta-------------------------------------------
create view vw_mostrar_detalle_venta
as
select id_renglon,id_venta,id_producto,precio_total,cantidad,precio from detalle_venta
go
-----------------------------------------------------------------
---------------------------------------------------------------









--Alta---------------------------------------------------------
----Productos--------------------------------------------------
create procedure spu_crear_producto
@id_producto bigint,
@descripcion nvarchar(60),
@stock decimal(18,2),
@id_proveedor int,
@precio decimal(18,2),
@costo decimal(18,2),
@fecha_cad date
as
begin
if @stock < 0 or @precio < 0 or @costo < 0
begin
	raiserror('No se permiten valores negativos', 16,1)
	return
end
insert into productos	
values(@id_producto,@descripcion,@stock,@id_proveedor,@precio,@costo,@fecha_cad)
end
go

exec spu_crear_producto 11,'Producto Prueba',10,1,0,-45,'15/12/2026'
----------------------------------------------------------------

----Cliente-----------------------------------------------------
create procedure spu_crear_cliente
@id_cliente int,
@nombre nvarchar(60),
@apellido nvarchar(60),
@telefono nvarchar(15),
@direccion nvarchar(60),
@email nvarchar(60),
@deuda decimal(18,2)
as
insert into clientes
values(@id_cliente,@nombre,@apellido,@telefono,@direccion,@email,@deuda)
go

exec spu_crear_cliente 1,'Gonzalo','Valor','341111111111','Ayacucho','gmvalor@gmail.com',82500
-----------------------------------------------------------------

----Usuarios-----------------------------------------------------
create procedure spu_crear_usuario
@id_usuario int,
@nombre nvarchar(60),
@contraseña nvarchar(60),
@rol nvarchar(60)
as
insert into usuarios
values(@id_usuario,@nombre,@contraseña,@rol)
go

exec spu_crear_usuarios 1,'Lautaro','mani123','Admin'
-----------------------------------------------------------------

----Proveedores--------------------------------------------------
create procedure spu_crear_proveedor
@id_proveedor int,
@nombre nvarchar(60),
@telefono nvarchar(15),
@email nvarchar(60),
@direccion nvarchar(60)
as
insert into proveedores
values(@id_proveedor,@nombre,@telefono,@email,@direccion)
go

exec spu_crear_proveedores 1,'Yasmin inc','34111111111','yasminarvalo@gmail.com','Carriego 1778'
-----------------------------------------------------------------

----Forma de Pago------------------------------------------------
create procedure spu_crear_forma_pago
@id_forma_pago int,
@descripcion nvarchar(60)
as
insert into forma_pago
values(@id_forma_pago,@descripcion)
go

exec spu_crear_forma_pago 1,'Efectivo'
-----------------------------------------------------------------

------Detalle de Forma de Pago-----------------------------------
create procedure spu_crear_detalle_forma_pago
@id_venta bigint,
@id_forma_pago int,
@importe decimal(18,2)
as
insert into detalle_forma_pago
values(@id_venta,@id_forma_pago,@importe)
go

exec spu_crear_detalle_forma_pago 1,1,85500
-----------------------------------------------------------------

----Venta--------------------------------------------------------
create procedure spu_crear_venta
@id_venta bigint,
@id_usuario int,
@fecha datetime,
@id_cliente int,
@total decimal(18,2)
as
insert into ventas
values(@id_venta,@id_usuario,@fecha,@id_cliente,@total)
go

exec spu_crear_venta 1,1,'15/10/2024',1,85500
-----------------------------------------------------------------

------Detalle de Venta-------------------------------------------
create procedure spu_crear_detalle_venta
@id_renglon bigint,
@id_venta bigint,
@id_producto bigint,
@precio_total decimal(18,2),
@cantidad decimal(18,2),
@precio decimal(18,2)
as
if @cantidad < 0
begin
	raiserror('No se permiten valores negativos',16,1)
	return
end
begin
insert into detalle_venta
values(@id_renglon,@id_venta,@id_producto,@precio_total,@cantidad,@precio)
end
go

exec spu_crear_detalle_venta 1,1,1,6000,2,3000
-----------------------------------------------------------------









--Baja-----------------------------------------------------------
----Productos----------------------------------------------------
create procedure spu_eliminar_producto
@id_producto bigint
as
delete from productos
where id_producto = @id_producto
go

exec spu_eliminar_producto 1
-----------------------------------------------------------------

----Cliente------------------------------------------------------
create procedure spu_eliminar_cliente
@id_cliente bigint
as
delete from clientes
where id_cliente = @id_cliente
go

exec spu_eliminar_cliente 1
-----------------------------------------------------------------

----Usuarios-----------------------------------------------------
create procedure spu_eliminar_usuario
@id_usuario bigint
as
delete from usuarios
where id_usuario = @id_usuario
go

exec spu_eliminar_usuarios 1
-----------------------------------------------------------------

----Proveedores--------------------------------------------------
create procedure spu_eliminar_proveedor
@id_proveedor bigint
as
delete from proveedores
where id_proveedor = @id_proveedor
go

exec spu_eliminar_proveedor 1
-----------------------------------------------------------------

----Forma de Pago------------------------------------------------
create procedure spu_eliminar_forma_pago
@id_forma_pago bigint
as
delete from forma_pago
where id_forma_pago = @id_forma_pago
go

exec spu_eliminar_forma_pago 1
-----------------------------------------------------------------

------Detalle de Forma de Pago-----------------------------------
create procedure spu_eliminar_detalle_forma_pago
@id_forma_pago bigint,
@id_venta bigint
as
delete from detalle_forma_pago
where id_forma_pago = @id_forma_pago and id_venta = @id_venta
go

exec spu_eliminar_detalle_forma_pago 1,1
-----------------------------------------------------------------

----Venta--------------------------------------------------------
create procedure spu_eliminar_venta
@id_venta bigint
as
delete from ventas
where id_venta = @id_venta
go

exec spu_eliminar_venta 1
-----------------------------------------------------------------

------Detalle de Venta-------------------------------------------
create procedure spu_eliminar_detalle_venta
@id_renglon bigint,
@id_venta bigint,
@id_producto bigint
as
delete from detalle_venta
where id_renglon = @id_renglon and id_venta = @id_venta and id_producto = @id_producto
go

exec spu_eliminar_detalle_venta 1,1,1
-----------------------------------------------------------------

------Procedimiento para cancelar la venta-----------------------
CREATE PROCEDURE spu_cancelarVenta
 @id_venta INT
AS
BEGIN
    BEGIN TRY
        BEGIN TRAN

        DELETE FROM detalle_venta WHERE id_venta = @id_venta;
        DELETE FROM detalle_forma_pago WHERE id_venta = @id_venta;
        DELETE FROM ventas WHERE id_venta = @id_venta;

        COMMIT;
        SELECT 'OK' AS mensaje;
    END TRY
    BEGIN CATCH
        ROLLBACK;
        SELECT ERROR_MESSAGE() AS mensaje;
    END CATCH
END;
-----------------------------------------------------------------
-----------------------------------------------------------------









--Modificar------------------------------------------------------
----Productos----------------------------------------------------
create procedure spu_modificar_producto
@id_producto bigint,
@descripcion nvarchar(60),
@stock decimal(18,2),
@id_proveedor bigint,
@precio decimal(18,2),
@costo decimal(18,2),
@fecha_cad date
as
if @stock < 0 or @precio < 0 or @costo < 0
begin
	raiserror('No se permiten valores negativos',16,1)
	return;
end
begin
	update productos set descripcion=@descripcion,stock=@stock,precio=@precio,costo=@costo,fecha_cad=@fecha_cad
	where id_producto = @id_producto
end
go

exec spu_modificar_producto 1,'PRUEBA Producto000',11,1,1500,3500,'11/11/2011'
-----------------------------------------------------------------

----Cliente------------------------------------------------------
create procedure spu_modificar_cliente
@id_cliente bigint,
@nombre nvarchar(60),
@apellido nvarchar(60),
@telefono nvarchar(15),
@direccion nvarchar(60),
@email nvarchar(60),
@deuda decimal(18,2)
as
update clientes set nombre=@nombre,apellido=@apellido,telefono=@telefono,direccion=@direccion,email=@email,deuda=@deuda
where id_cliente = @id_cliente
go

exec spu_modificar_cliente 1,'Gonzalo', 'VALOR','341111111111','Ayacucho','gmvalor@gmail.com',850500
-----------------------------------------------------------------

----Usuarios-----------------------------------------------------
create procedure spu_modificar_usuario
@id_usuario bigint,
@nombre nvarchar(60),
@contraseña nvarchar(60),
@rol nvarchar(60)
as
update usuarios set nombre=@nombre,contraseña=@contraseña,rol=@rol
where id_usuario = @id_usuario
go

exec spu_modificar_usuario 1,'Lautaro Perez','mani123','vendedor'
-----------------------------------------------------------------

----Proveedores--------------------------------------------------
create procedure spu_modificar_proveedor
@id_proveedor int,
@nombre nvarchar(60),
@telefono nvarchar(15),
@email nvarchar(60),
@direccion nvarchar(60)
as
update proveedores set nombre=@nombre,telefono=@telefono,email=@email,direccion=@direccion
where id_proveedor=@id_proveedor
go

exec spu_modificar_proveedor 1,'Yasmin INC','341222222222','YasminArevalo@gmail.com','Carriego 1778'
-----------------------------------------------------------------

----Forma de Pago------------------------------------------------
create procedure spu_modificar_forma_pago
@id_forma_pago int,
@descripcion nvarchar(60)
as
update forma_pago set descripcion=@descripcion
where id_forma_pago=@id_forma_pago
go

exec spu_modificar_forma_pago 1,'Transferencia'
-----------------------------------------------------------------

------Detalle de Forma de Pago-----------------------------------
create procedure spu_modificar_detalle_forma_pago
@id_venta bigint,
@id_forma_pago int,
@importe decimal(18,2)
as
update detalle_forma_pago set importe=@importe
where id_venta=@id_venta and id_forma_pago=@id_forma_pago
go

exec spu_modificar_detalle_forma_pago 1,1,850500
-----------------------------------------------------------------

----Venta--------------------------------------------------------
create procedure spu_modificar_venta
@id_venta bigint,
@id_usuario int,
@fecha datetime,
@id_cliente int,
@total decimal(18,2)
as
update ventas set id_usuario=@id_usuario,fecha=@fecha,id_cliente=@id_cliente,total=@total
where id_venta=@id_venta
go

exec spu_modificar_venta 1,1,'11/11/2011 11:11:11',1,850500
-----------------------------------------------------------------

------Detalle de Venta-------------------------------------------
create procedure spu_modificar_detalle_venta
@id_renglon bigint,
@id_venta bigint,
@id_producto bigint,
@precio_total decimal(18,2),
@cantidad decimal(18,2),
@precio decimal(18,2)
as
update detalle_venta set precio_total=@precio_total,cantidad=@cantidad,precio=@precio
where id_renglon = @id_renglon and id_venta=@id_venta and id_producto=@id_producto
go

exec spu_modificar_detalle_venta 1,1,1,3000,285.5,850500
-----------------------------------------------------------------
-----------------------------------------------------------------