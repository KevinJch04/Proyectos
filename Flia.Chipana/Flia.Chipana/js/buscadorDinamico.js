function inicializarBuscadorGlobal(inputSelector, tableSelector, columnas = null) {
    const searchInput = document.querySelector(inputSelector);
    const tableBody = document.querySelector(`${tableSelector} tbody`);

    if (!searchInput || !tableBody) return;

    searchInput.addEventListener("input", function () {
        const filtro = this.value.toLowerCase().trim();
        const palabras = filtro.split(/\s+/); // separa por espacios (ej: ["delfina", "arevalo"])

        Array.from(tableBody.rows).forEach(row => {
            let textoFila = "";

            if (!columnas) {
                // Busca en toda la fila
                textoFila = row.textContent.toLowerCase();
            } else {
                // Busca solo en las columnas especificadas
                textoFila = columnas
                    .map(i => row.cells[i]?.textContent.toLowerCase() || "")
                    .join(" ");
            }

            // Verifica que todas las palabras estén presentes
            const coincide = palabras.every(palabra => textoFila.includes(palabra));

            row.style.display = coincide ? "" : "none";
        });
    });
}
