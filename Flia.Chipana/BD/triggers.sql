use fliachipana
--Creación de triggers para controlar el stock de los productos-----------
----Trigger para bajar el stock-------------------------------------------
create trigger tgr_bajar_stock on detalle_venta
after insert
as
begin
	update productos set stock = stock - inserted.cantidad from productos
	inner join inserted on productos.id_producto = inserted.id_producto
	where stock >= inserted.cantidad
end
--------------------------------------------------------------------------

----Trigger para subir el stock-------------------------------------------
create trigger tgr_subir_stock on detalle_venta
after delete
as
begin
	update productos set stock = stock + deleted.cantidad from productos
	inner join deleted on productos.id_producto = deleted.id_producto
end
--------------------------------------------------------------------------
----Trigger para bajar el detalle-------------------------------------------
create trigger tgr_bajar_detalle on detalle_venta
after delete
as
begin
	update ventas set total = total - d.precio_total from ventas v
	inner join deleted d on v.id_venta = d.id_venta
end
--------------------------------------------------------------------------

----Trigger para subir el detalle-------------------------------------------
create trigger tgr_subir_detalle on detalle_venta
after insert
as
begin
	update ventas set total = total + inserted.precio_total from ventas v
	inner join inserted on v.id_venta = inserted.id_venta
end
-----------------------------------------------------------------------

----Trigger para actualizar el detalle---------------------------------
create trigger tgr_actualizar_detalle
on detalle_venta
after update
as
begin
    -- Restar el precio_total viejo (tabla deleted)
    update ventas
    set total = total - d.precio_total
    from ventas v
    inner join deleted d on v.id_venta = d.id_venta;

    -- Sumar el precio_total nuevo (tabla inserted)
    update ventas
    set total = total + i.precio_total
    from ventas v
    inner join inserted i on v.id_venta = i.id_venta;
end
