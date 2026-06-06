/**
 * Pruebas unitarias para el módulo UI (src/ui.js)
 * Cubre: processPLC y la integración con el DOM
 */

const { generatePLCCode, repairPLCCode, downloadFile } = require("../src/plc.js");

// Exponer funciones globales para que ui.js las encuentre
global.generatePLCCode = generatePLCCode;
global.repairPLCCode = repairPLCCode;
global.downloadFile = downloadFile;

const { processPLC } = require("../src/ui.js");

describe("processPLC (integración con DOM)", () => {
    let alertMock;
    let downloadFileMock;

    beforeEach(() => {
        // Configurar DOM simulado
        document.body.innerHTML = `
            <select id="plcType">
                <option value="Allen-Bradley" selected>Allen-Bradley</option>
                <option value="Siemens">Siemens</option>
                <option value="Mitsubishi">Mitsubishi</option>
            </select>
            <input type="number" id="inputs" value="2">
            <input type="number" id="outputs" value="1">
            <textarea id="codeOutput"></textarea>
        `;

        alertMock = jest.fn();
        global.alert = alertMock;
        global.downloadFile = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        document.body.innerHTML = "";
    });

    test("debe generar código y mostrarlo en el textarea", () => {
        processPLC();
        const output = document.getElementById("codeOutput").value;
        expect(output).toContain("LD");
        expect(output.length).toBeGreaterThan(0);
    });

    test("debe mostrar alerta de éxito", () => {
        processPLC();
        expect(alertMock).toHaveBeenCalledWith("¡Código PLC Generado con éxito!");
    });

    test("debe llamar a downloadFile con el código generado", () => {
        processPLC();
        expect(global.downloadFile).toHaveBeenCalledWith(
            expect.any(String),
            "codigo_plc.txt"
        );
    });

    test("debe usar el tipo de PLC seleccionado", () => {
        document.getElementById("plcType").value = "Siemens";
        processPLC();
        const output = document.getElementById("codeOutput").value;
        expect(output).toContain("Siemens");
    });

    test("debe generar entradas según el valor del input", () => {
        document.getElementById("inputs").value = "3";
        document.getElementById("outputs").value = "0";
        processPLC();
        const output = document.getElementById("codeOutput").value;
        expect(output).toContain("X1");
        expect(output).toContain("X2");
        expect(output).toContain("X3");
    });

    test("debe generar salidas según el valor del input", () => {
        document.getElementById("inputs").value = "0";
        document.getElementById("outputs").value = "2";
        processPLC();
        const output = document.getElementById("codeOutput").value;
        expect(output).toContain("Y1");
        expect(output).toContain("Y2");
    });

    test("debe manejar valores vacíos como cero", () => {
        document.getElementById("inputs").value = "";
        document.getElementById("outputs").value = "";
        processPLC();
        const output = document.getElementById("codeOutput").value;
        expect(output).not.toContain("X1");
        expect(output).not.toContain("Y1");
    });

    test("debe manejar valores no numéricos como cero", () => {
        document.getElementById("inputs").value = "abc";
        document.getElementById("outputs").value = "xyz";
        processPLC();
        const output = document.getElementById("codeOutput").value;
        expect(output).not.toContain("X1");
        expect(output).not.toContain("Y1");
    });

    test("debe aplicar repairPLCCode al código generado", () => {
        document.getElementById("inputs").value = "1";
        document.getElementById("outputs").value = "1";
        document.getElementById("plcType").value = "Allen-Bradley";
        processPLC();
        const output = document.getElementById("codeOutput").value;
        // repairPLCCode elimina espacios después de "LD " y "OT "
        // El header "LD Allen-Bradley" se convierte en "LDAllen-Bradley"
        expect(output).toContain("LDAllen-Bradley");
    });

    test("debe funcionar con Mitsubishi y múltiples I/O", () => {
        document.getElementById("plcType").value = "Mitsubishi";
        document.getElementById("inputs").value = "2";
        document.getElementById("outputs").value = "2";
        processPLC();
        const output = document.getElementById("codeOutput").value;
        expect(output).toContain("Mitsubishi");
        expect(output).toContain("X1");
        expect(output).toContain("X2");
        expect(output).toContain("Y1");
        expect(output).toContain("Y2");
    });
});
