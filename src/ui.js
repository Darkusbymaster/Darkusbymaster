/**
 * Módulo UI - Manejo de interacciones del usuario con el formulario PLC
 */

/**
 * Inicializa la interfaz cargando los PLCs en el selector agrupados por categoría.
 */
function initUI() {
    const select = document.getElementById("plcType");
    if (!select) return;

    const categories = getPLCCategories();
    select.innerHTML = "";

    for (const [category, plcs] of Object.entries(categories)) {
        const optgroup = document.createElement("optgroup");
        optgroup.label = category;
        for (const plc of plcs) {
            const option = document.createElement("option");
            option.value = plc;
            option.textContent = plc;
            optgroup.appendChild(option);
        }
        select.appendChild(optgroup);
    }

    updateBrandInfo();
}

/**
 * Actualiza la información de la marca del PLC seleccionado.
 */
function updateBrandInfo() {
    const type = document.getElementById("plcType").value;
    const config = plcTypes[type];
    const infoEl = document.getElementById("brandInfo");
    if (infoEl && config) {
        infoEl.textContent = `${config.brand} | Lenguaje: ${config.prefix}`;
    }
}

/**
 * Procesa la generación de código PLC desde la interfaz de usuario.
 */
function processPLC() {
    const type = document.getElementById("plcType").value;
    const inputs = parseInt(document.getElementById("inputs").value) || 0;
    const outputs = parseInt(document.getElementById("outputs").value) || 0;

    if (inputs === 0 && outputs === 0) {
        showNotification("Por favor, define al menos una entrada o salida.", "warning");
        return;
    }

    let generated = generatePLCCode(type, inputs, outputs);
    let finalCode = repairPLCCode(generated);

    document.getElementById("codeOutput").value = finalCode;

    showNotification("Código PLC generado con éxito", "success");
}

/**
 * Descarga el código generado como archivo .txt
 */
function downloadCode() {
    const code = document.getElementById("codeOutput").value;
    if (!code) {
        showNotification("No hay código para descargar. Genera primero.", "warning");
        return;
    }
    const type = document.getElementById("plcType").value;
    const fileName = `codigo_plc_${type.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}.txt`;
    downloadFile(code, fileName);
    showNotification("Archivo descargado: " + fileName, "success");
}

/**
 * Copia el código al portapapeles.
 */
function copyCode() {
    const textarea = document.getElementById("codeOutput");
    if (!textarea || !textarea.value) {
        showNotification("No hay código para copiar.", "warning");
        return;
    }
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textarea.value).then(() => {
            showNotification("Código copiado al portapapeles", "success");
        });
    } else {
        textarea.select();
        document.execCommand("copy");
        showNotification("Código copiado al portapapeles", "success");
    }
}

/**
 * Muestra una notificación temporal en la interfaz.
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: "success", "warning", "error"
 */
function showNotification(message, type) {
    const container = document.getElementById("notifications");
    if (!container) return;

    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add("fade-out");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { initUI, updateBrandInfo, processPLC, downloadCode, copyCode, showNotification };
}
