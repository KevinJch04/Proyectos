// --------------------------------------------------------
// FUNCIONES PARA TICKET
// --------------------------------------------------------


// --------------------------------------------------------
// FUNCION PARA DESCARGAR TICKET EN PDF
// --------------------------------------------------------
async function descargarTicketPDF(idVenta, items, formasPago, vuelto, clienteNombre) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ unit: "mm", format: [107, 200] });

        // ---------------- TÍTULO ----------------
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("FLIA. CHIPANA", 52, 10, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Ticket de Venta", 52, 16, { align: "center" });

        // ---------------- LOGO ----------------
        const logo = new Image();
        logo.src = "resources/login/logo.png";
        await new Promise(res => logo.onload = res);
        doc.addImage(logo, "PNG", 40, 18, 25, 25);

        let y = 45;

        // ---------------- CLIENTE Y USUARIO ----------------
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(`Cliente: ${clienteNombre}`, 5, y); y += 5;
        doc.text(`Venta Nº: ${idVenta}`, 5, y); y += 5;
        doc.text(`Fecha: ${new Date().toLocaleString("es-AR")}`, 5, y); y += 5;

        // ---------------- SEPARADOR ----------------
        doc.line(5, y + 2, 100, y + 2);
        y += 8;

        // ---------------- ENCABEZADO DE TABLA ----------------
        doc.setFont("helvetica", "bold");
        doc.text("ID P", 5, y);
        doc.text("Descripción", 18, y);
        doc.text("P.U", 58, y);
        doc.text("Cant", 75, y);
        doc.text("Total", 90, y);

        y += 4;
        doc.line(5, y, 100, y);
        y += 4;

        // ---------------- DETALLE DE PRODUCTOS ----------------
        doc.setFont("helvetica", "normal");
        items.forEach(item => {
            doc.text(String(item.id_producto), 5, y);
            doc.text(item.descripcion.substring(0, 20), 18, y);
            doc.text(`$${item.precio}`, 65, y, { align: "right" });
            doc.text(String(item.cantidad), 80, y, { align: "right" });
            doc.text(`$${item.precio_total}`, 100, y, { align: "right" });
            y += 5;
        });

        // ---------------- LÍNEA ----------------
        doc.line(5, y + 2, 100, y + 2);
        y += 8;

        // ---------------- FORMAS DE PAGO ----------------
        formasPago = formasPago || [];
        doc.setFont("helvetica", "bold");
        doc.text("Formas de Pago:", 5, y);
        y += 6;

        doc.setFont("helvetica", "normal");
formasSeleccionadas.forEach(fp => {
    const descripcion = fp.nombre || "Sin descripción";
    const importe = fp.monto ?? 0;
    doc.text(`- ${descripcion}: $${importe}`, 5, y);
    y += 5;
});

        y += 3;
        doc.line(5, y, 100, y);
        y += 7;

        // ---------------- VUELTO ----------------
        doc.setFont("helvetica", "normal");
        doc.text(`Vuelto: $${vuelto}`, 5, y);
        y += 6;

        // ---------------- TOTAL FINAL ----------------
        const total = items.reduce((acc, i) => acc + i.precio_total, 0);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`TOTAL FINAL: $${total}`, 5, y);

        // ---------------- FOOTER ----------------
        y += 10;
const pageHeight = doc.internal.pageSize.getHeight();
if (y > pageHeight - 10) {
    doc.addPage();
    y = 10;
}
doc.setFont("helvetica", "normal"); 
doc.setFontSize(8);
doc.text("Gracias por su compra!", 52, y, { align: "center" });

        // ---------------- GUARDAR PDF ----------------
        doc.save(`ticket_venta_${idVenta}.pdf`);

    } catch (err) {
        console.error(err);
        mostrarToast("Error generando ticket");
    }
}


async function descargarTicketVentaGuardada(idVenta) {
    try {
        const { jsPDF } = window.jspdf;

        // ============================
        // 1) CARGA DE DATOS NECESARIOS
        // ============================

        // --- Detalle venta ---
        const resItems = await fetchConToken(`${API_URL}/detalleVenta`);
        let items = await resItems.json();
        items = items.filter(i => i.id_venta == idVenta);

        // --- Productos ---
        const resProd = await fetchConToken(`${API_URL}/productos`);
        let productos = await resProd.json();

        // --- Venta completa ---
        const resVenta = await fetchConToken(`${API_URL}/ventas`);
        let ventas = await resVenta.json();
        let infoVenta = ventas.find(v => v.id_venta == idVenta);

        if (!infoVenta) throw new Error("Venta no encontrada");

        // ============================================
        // 2) COMPLETAR INFORMACIÓN (PRODUCTO + TOTAL)
        // ============================================

        items = items.map(i => {
            const prod = productos.find(p => p.id_producto == i.id_producto);
            return {
                ...i,
                descripcion: prod?.descripcion || "Sin nombre",
                precio: prod?.precio || 0,
                precio_total: (prod?.precio || 0) * (i.cantidad || 1)
            };
        });

        // ============================================
        // 3) GENERAR PDF
        // ============================================

        const doc = new jsPDF({ unit: "mm", format: [107, 200] });

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("FLIA. CHIPANA", 52, 10, { align: "center" });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("Ticket de Venta", 52, 16, { align: "center" });


                // ---------------- LOGO ----------------
        const logo = new Image();
        logo.src = "resources/login/logo.png";
        await new Promise(res => logo.onload = res);
        doc.addImage(logo, "PNG", 40, 18, 25, 25);

        let y = 45;

        doc.text(`Cliente: ${infoVenta.clienteNombre || "S/D"}`, 5, y); y += 5;
        doc.text(`Venta Nº: ${idVenta}`, 5, y); y += 5;
        doc.text(`Fecha: ${infoVenta.fecha}`, 5, y); y += 5;

        doc.line(5, y, 100, y); y += 5;

        doc.setFont("helvetica", "bold");
        doc.text("ID", 5, y);
        doc.text("Descripción", 15, y);
        doc.text("P.U", 55, y);
        doc.text("Cant", 75, y);
        doc.text("Total", 90, y);

        y += 4;
        doc.line(5, y, 100, y); y += 5;

        doc.setFont("helvetica", "normal");

        // --- Productos ---
        items.forEach(i => {
            doc.text(String(i.id_producto), 5, y);
            doc.text((i.descripcion || "").substring(0, 20), 15, y);
            doc.text(`$${i.precio}`, 60, y, { align: "right" });
            doc.text(String(i.cantidad), 80, y, { align: "right" });
            doc.text(`$${i.precio_total}`, 100, y, { align: "right" });
            y += 5;
        });

        doc.line(5, y, 100, y); y += 8;

        // =============================
        // SIN FORMAS DE PAGO - SOLO TOTAL
        // =============================

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(`TOTAL FINAL: $${infoVenta.total}`, 5, y);

        doc.save(`ticket_venta_${idVenta}.pdf`);

    } catch (e) {
        console.error(e);
        mostrarToast("Error generando ticket");
    }
}