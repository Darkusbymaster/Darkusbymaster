/**
 * Pruebas unitarias para el módulo UI (src/ui.js)
 * Cubre: initUI, updateBrandInfo, processPLC, downloadCode, copyCode, showNotification
 */

const { plcTypes, getPLCCategories, generatePLCCode, repairPLCCode, downloadFile } = require("../src/plc.js");

// Exponer funciones globales para ui.js
global.plcTypes = plcTypes;
global.getPLCCategories = getPLCCategories;
global.generatePLCCode = generatePLCCode;
global.repairPLCCode = repairPLCCode;
global.downloadFile = jest.fn();

const { initUI, updateBrandInfo, processPLC, downloadCode, copyCode, showNotification } = require("../src/ui.js");

function setupDOM() {
    document.body.innerHTML = `
        <div id="notifications"></div>
        <select id="plcType"></select>
        <div id="brandInfo"></div>
        <input type="number" id="inputs" value="2">
        <input type="number" id="outputs" value="1">
        <textarea id="codeOutput"></textarea>
    `;
}

describe("initUI", () => {
    beforeEach(setupDOM);
    afterEach(() => { document.body.innerHTML = ""; });

    test("debe poblar el selector con optgroups por categoría", () => {
        initUI();
        const optgroups = document.querySelectorAll("optgroup");
        expect(optgroups.length).toBe(4);
    });

    test("debe tener opciones para todos los PLCs", () => {
        initUI();
        const options = document.querySelectorAll("option");
        expect(options.length).toBe(Object.keys(plcTypes).length);
    });

    test("debe etiquetar correctamente las categorías", () => {
        initUI();
        const labels = Array.from(document.querySelectorAll("optgroup")).map(g => g.label);
        expect(labels).toContain("Americanos");
        expect(labels).toContain("Europeos");
        expect(labels).toContain("Japoneses");
        expect(labels).toContain("Asiáticos/Otros");
    });

    test("debe actualizar brandInfo al inicializar", () => {
        initUI();
        const info = document.getElementById("brandInfo").textContent;
        expect(info.length).toBeGreaterThan(0);
    });

    test("no debe fallar si el select no existe", () => {
        document.body.innerHTML = "";
        expect(() => initUI()).not.toThrow();
    });
});

describe("updateBrandInfo", () => {
    beforeEach(() => {
        setupDOM();
        initUI();
    });
    afterEach(() => { document.body.innerHTML = ""; });

    test("debe mostrar marca y lenguaje del PLC seleccionado", () => {
        document.getElementById("plcType").value = "Allen-Bradley";
        updateBrandInfo();
        const info = document.getElementById("brandInfo").textContent;
        expect(info).toContain("Rockwell Automation");
        expect(info).toContain("LD");
    });

    test("debe actualizarse al cambiar tipo", () => {
        document.getElementById("plcType").value = "Siemens (S7-1200/1500)";
        updateBrandInfo();
        const info = document.getElementById("brandInfo").textContent;
        expect(info).toContain("Siemens");
        expect(info).toContain("SCL");
    });
});

describe("processPLC", () => {
    beforeEach(() => {
        setupDOM();
        initUI();
        global.alert = jest.fn();
    });
    afterEach(() => { document.body.innerHTML = ""; });

    test("debe generar código y mostrarlo en textarea", () => {
        document.getElementById("inputs").value = "3";
        document.getElementById("outputs").value = "2";
        processPLC();
        const output = document.getElementById("codeOutput").value;
        expect(output.length).toBeGreaterThan(0);
    });

    test("debe mostrar warning si entradas y salidas son 0", () => {
        document.getElementById("inputs").value = "0";
        document.getElementById("outputs").value = "0";
        processPLC();
        const notifications = document.querySelectorAll(".notification.warning");
        expect(notifications.length).toBe(1);
    });

    test("debe generar código para PLC Siemens S7-1200", () => {
        document.getElementById("plcType").value = "Siemens (S7-1200/1500)";
        document.getElementById("inputs").value = "2";
        document.getElementById("outputs").value = "1";
        processPLC();
        const output = document.getElementById("codeOutput").value;
        expect(output).toContain("PROGRAM");
        expect(output).toContain("%I");
    });

    test("debe manejar valores no numéricos como 0", () => {
        document.getElementById("inputs").value = "abc";
        document.getElementById("outputs").value = "";
        processPLC();
        // Should show warning since both parsed as 0
        const notifications = document.querySelectorAll(".notification.warning");
        expect(notifications.length).toBe(1);
    });
});

describe("downloadCode", () => {
    beforeEach(() => {
        setupDOM();
        initUI();
        global.downloadFile = jest.fn();
    });
    afterEach(() => { document.body.innerHTML = ""; });

    test("debe mostrar warning si no hay código", () => {
        document.getElementById("codeOutput").value = "";
        downloadCode();
        const warnings = document.querySelectorAll(".notification.warning");
        expect(warnings.length).toBe(1);
    });

    test("debe llamar downloadFile con nombre basado en tipo de PLC", () => {
        document.getElementById("codeOutput").value = "LD X1\nOUT Y1";
        document.getElementById("plcType").value = "Allen-Bradley";
        downloadCode();
        expect(global.downloadFile).toHaveBeenCalledWith(
            "LD X1\nOUT Y1",
            expect.stringContaining("allen_bradley")
        );
    });
});

describe("copyCode", () => {
    beforeEach(() => {
        setupDOM();
        initUI();
    });
    afterEach(() => { document.body.innerHTML = ""; });

    test("debe mostrar warning si no hay código", () => {
        document.getElementById("codeOutput").value = "";
        copyCode();
        const warnings = document.querySelectorAll(".notification.warning");
        expect(warnings.length).toBe(1);
    });

    test("debe copiar al clipboard si hay código", () => {
        document.getElementById("codeOutput").value = "LD X1";
        const writeTextMock = jest.fn(() => Promise.resolve());
        Object.assign(navigator, { clipboard: { writeText: writeTextMock } });
        copyCode();
        expect(writeTextMock).toHaveBeenCalledWith("LD X1");
    });

    test("debe usar execCommand como fallback", () => {
        document.getElementById("codeOutput").value = "LD X1";
        Object.assign(navigator, { clipboard: undefined });
        const execMock = jest.fn();
        document.execCommand = execMock;
        copyCode();
        expect(execMock).toHaveBeenCalledWith("copy");
    });
});

describe("showNotification", () => {
    beforeEach(setupDOM);
    afterEach(() => { document.body.innerHTML = ""; });

    test("debe crear elemento notification con clase correcta", () => {
        showNotification("Test", "success");
        const notif = document.querySelector(".notification.success");
        expect(notif).not.toBeNull();
        expect(notif.textContent).toBe("Test");
    });

    test("debe crear warning notification", () => {
        showNotification("Advertencia", "warning");
        const notif = document.querySelector(".notification.warning");
        expect(notif).not.toBeNull();
    });

    test("debe crear error notification", () => {
        showNotification("Error", "error");
        const notif = document.querySelector(".notification.error");
        expect(notif).not.toBeNull();
    });

    test("no debe fallar si container no existe", () => {
        document.body.innerHTML = "";
        expect(() => showNotification("test", "success")).not.toThrow();
    });
});
