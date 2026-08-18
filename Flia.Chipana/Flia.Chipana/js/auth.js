//----------------------------------------------------------
//     FUNCIÓN GENERAL PARA USAR EL TOKEN EN FETCH
//----------------------------------------------------------
async function fetchConToken(url, options = {}) {
    const token = localStorage.getItem('token');

    // Si no hay token, redirigir al login
    if (!token) {
        alert("Sesión expirada. Inicia sesión nuevamente.");
        window.location.href = 'index.html';
        return null;
    }

    // Agregar Authorization header
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    // Hacer la petición
    const res = await fetch(url, options);

    // Si el token expiró o es inválido, redirigir al login
    if (res.status === 401) {
        alert("Token inválido o expirado. Inicia sesión nuevamente.");
        localStorage.clear();
        window.location.href = 'index.html';
        return null;
    }

    return res;
}

//--------------------------------------------------------------------
//     PREVIENE QUE NADIE ACCEDA AL MAIN SIN PASAR POR EL LOGIN
//--------------------------------------------------------------------


const token = localStorage.getItem("token");
if (!token) {
  // Si no hay token, redirigir a login
  window.location.href = "index.html";
}

//----------------------------------------------------------
// MUESTRA UN MAIN DISTINTO DEPENDIENDO DEL ROL
//----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");

    if (!role) {
        window.location.href = "index.html";
        return;
    }

    if (role === "admin") {
        // Admin ve todo
    } else if (role === "vendedor") {
        // Ocultar enlaces de admin
        document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
    } else {
        // Si llega cualquier otro valor inesperado
        console.warn("Rol desconocido:", role);
        localStorage.clear();
        window.location.href = "index.html";
    }
});




//----------------------------------------------------------
//     FUNCIÓN PARA CERRAR SESION
//----------------------------------------------------------
document.getElementById("btn-cerrar-sesion").addEventListener("click", (e) => {
    e.preventDefault(); // Previene que el enlace recargue la página

  // 1. Elimina el token del almacenamiento local
    localStorage.removeItem("token");

  // 2. Redirige al login
    window.location.href = "index.html";
});
