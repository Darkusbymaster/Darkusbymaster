/**
 * Módulo UI - Manejo de interacciones del usuario con el formulario PLC
 */

/**
 * Procesa la generación de código PLC desde la interfaz de usuario.
 * Lee los valores del formulario, genera el código, lo muestra y lo descarga.
 */
function processPLC() {
    const type = document.getElementById("plcType").value;
    const inputs = parseInt(document.getElementById("inputs").value) || 0;
    const outputs = parseInt(document.getElementById("outputs").value) || 0;

    let generated = generatePLCCode(type, inputs, outputs);
    let finalCode = repairPLCCode(generated);

    document.getElementById("codeOutput").value = finalCode;

    alert("¡Código PLC Generado con éxito!");

    downloadFile(finalCode, "codigo_plc.txt");
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { processPLC };
}
