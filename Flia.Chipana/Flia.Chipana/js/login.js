
//----------------------------------------------------------
//     FUNCIÓN PARA DECODIFICAR JWT
//----------------------------------------------------------
function decodeJWT(token) {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
}

const form = document.getElementById("login-form");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const password = document.getElementById("password").value.trim();

    errorMessage.innerText = ""; // Limpiar error anterior

    try {
        const credentials = btoa(`${nombre}:${password}`);
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${credentials}`
            }
        });

        const data = await res.json().catch(() => null);

        if (res.ok && data?.token) {

    // Guardar token
    localStorage.setItem("token", data.token);

    // Decodificar JWT para extraer id_usuario, username y role
    const payload = decodeJWT(data.token);

    localStorage.setItem("id_usuario", payload.data.id_usuario);
    localStorage.setItem("username", payload.data.username);
    localStorage.setItem("role", payload.data.role);

    window.location.href = "main.html";

        } else {
            
            errorMessage.innerText = data?.error || "Credenciales incorrectas.";
        }

    } catch (err) {
        console.error(err);
        errorMessage.innerText = "No se pudo conectar con el servidor.";
    }
});

