/**
 * Módulo de lógica PLC - Generación y reparación de código PLC multiplataforma
 */

const plcTypes = {
    "Allen-Bradley": "LD Allen-Bradley",
    "Siemens": "LD Siemens",
    "Mitsubishi": "LD Mitsubishi"
};

/**
 * Genera código PLC basado en el tipo de PLC, número de entradas y salidas.
 * @param {string} type - Tipo de PLC (Allen-Bradley, Siemens, Mitsubishi)
 * @param {number} inputs - Número de entradas
 * @param {number} outputs - Número de salidas
 * @returns {string} Código PLC generado
 */
function generatePLCCode(type, inputs, outputs) {
    let code = plcTypes[type] || "";
    for (let i = 1; i <= inputs; i++) {
        code += `\nX${i} LD`;
    }
    for (let i = 1; i <= outputs; i++) {
        code += `\nY${i} OT`;
    }
    return code;
}

/**
 * Repara el código PLC eliminando espacios extra en instrucciones LD y OT.
 * @param {string} code - Código PLC a reparar
 * @returns {string} Código PLC reparado
 */
function repairPLCCode(code) {
    let repaired = code;
    repaired = repaired.replace(/LD /g, "LD");
    repaired = repaired.replace(/OT /g, "OT");
    return repaired;
}

/**
 * Genera un archivo descargable con el contenido proporcionado.
 * @param {string} content - Contenido del archivo
 * @param {string} fileName - Nombre del archivo
 */
function downloadFile(content, fileName) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { plcTypes, generatePLCCode, repairPLCCode, downloadFile };
}
