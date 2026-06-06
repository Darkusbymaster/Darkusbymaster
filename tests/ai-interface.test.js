/**
 * Pruebas unitarias para el módulo AI Interface (src/ai-interface.js)
 */

const { plcTypes, getPLCCategories, generatePLCCode, repairPLCCode } = require("../src/plc.js");
const { getAvailableLanguages, setLanguage, getCurrentLanguage } = require("../src/i18n.js");
const { analyzeCode, diagnose, lookupErrorCode } = require("../src/diagnostics.js");
const { createConnection } = require("../src/remote.js");
const { APP_VERSION } = require("../src/updater.js");

// Exponer globales que ai-interface necesita
global.plcTypes = plcTypes;
global.getPLCCategories = getPLCCategories;
global.generatePLCCode = generatePLCCode;
global.repairPLCCode = repairPLCCode;
global.getAvailableLanguages = getAvailableLanguages;
global.setLanguage = setLanguage;
global.getCurrentLanguage = getCurrentLanguage;
global.analyzeCode = analyzeCode;
global.diagnose = diagnose;
global.lookupErrorCode = lookupErrorCode;
global.createConnection = createConnection;
global.APP_VERSION = APP_VERSION;

const { PLCInterface } = require("../src/ai-interface.js");

describe("PLCInterface", () => {
    test("debe tener versión definida", () => {
        expect(PLCInterface.version).toBe("3.0.0");
    });

    test("debe tener esquema de acciones", () => {
        expect(PLCInterface.schema).toHaveProperty("actions");
        expect(Object.keys(PLCInterface.schema.actions).length).toBeGreaterThan(5);
    });
});

describe("PLCInterface.execute - errores", () => {
    test("debe retornar error si no hay comando", () => {
        const result = PLCInterface.execute(null);
        expect(result.status).toBe("error");
    });

    test("debe retornar error si no hay action", () => {
        const result = PLCInterface.execute({});
        expect(result.status).toBe("error");
    });

    test("debe retornar error para acción desconocida", () => {
        const result = PLCInterface.execute({ action: "invalid" });
        expect(result.status).toBe("error");
        expect(result.error).toContain("desconocida");
    });
});

describe("PLCInterface - action: help", () => {
    test("debe retornar esquema completo", () => {
        const result = PLCInterface.execute({ action: "help" });
        expect(result.status).toBe("ok");
        expect(result.data).toHaveProperty("version");
        expect(result.data).toHaveProperty("schema");
        expect(result.data).toHaveProperty("example");
    });
});

describe("PLCInterface - action: listTypes", () => {
    test("debe retornar todos los tipos de PLC", () => {
        const result = PLCInterface.execute({ action: "listTypes" });
        expect(result.status).toBe("ok");
        expect(result.data.types.length).toBeGreaterThanOrEqual(30);
        expect(result.data.total).toBe(result.data.types.length);
    });

    test("cada tipo debe tener name, brand, language", () => {
        const result = PLCInterface.execute({ action: "listTypes" });
        for (const type of result.data.types) {
            expect(type).toHaveProperty("name");
            expect(type).toHaveProperty("brand");
            expect(type).toHaveProperty("language");
        }
    });
});

describe("PLCInterface - action: listCategories", () => {
    test("debe retornar categorías con PLCs", () => {
        const result = PLCInterface.execute({ action: "listCategories" });
        expect(result.status).toBe("ok");
        expect(result.data.categories).toHaveProperty("Americanos");
        expect(result.data.categories).toHaveProperty("Europeos");
    });
});

describe("PLCInterface - action: generate", () => {
    test("debe generar código para PLC válido", () => {
        const result = PLCInterface.execute({
            action: "generate",
            plcType: "Allen-Bradley",
            inputs: 2,
            outputs: 1
        });
        expect(result.status).toBe("ok");
        expect(result.data.code).toContain("Rockwell");
        expect(result.data.metadata.plcType).toBe("Allen-Bradley");
        expect(result.data.metadata.inputs).toBe(2);
        expect(result.data.metadata.outputs).toBe(1);
    });

    test("debe generar ST para Siemens S7-1200", () => {
        const result = PLCInterface.execute({
            action: "generate",
            plcType: "Siemens (S7-1200/1500)",
            inputs: 3,
            outputs: 2
        });
        expect(result.status).toBe("ok");
        expect(result.data.code).toContain("PROGRAM");
        expect(result.data.metadata.language).toBe("SCL");
    });

    test("debe fallar para PLC inválido", () => {
        const result = PLCInterface.execute({
            action: "generate",
            plcType: "Inventado",
            inputs: 1,
            outputs: 1
        });
        expect(result.status).toBe("ok");
        expect(result.data.valid).toBe(false);
    });

    test("debe incluir metadatos completos", () => {
        const result = PLCInterface.execute({
            action: "generate",
            plcType: "Omron (NX/NJ)",
            inputs: 4,
            outputs: 3
        });
        expect(result.data.metadata).toHaveProperty("lines");
        expect(result.data.metadata).toHaveProperty("characters");
        expect(result.data.metadata.brand).toBe("Omron");
    });
});

describe("PLCInterface - action: getTypeInfo", () => {
    test("debe retornar info del tipo", () => {
        const result = PLCInterface.execute({
            action: "getTypeInfo",
            plcType: "Beckhoff (TwinCAT)"
        });
        expect(result.status).toBe("ok");
        expect(result.data.brand).toBe("Beckhoff");
        expect(result.data.prefix).toBe("ST");
        expect(result.data).toHaveProperty("example");
    });

    test("debe fallar para tipo inexistente", () => {
        const result = PLCInterface.execute({
            action: "getTypeInfo",
            plcType: "NoExiste"
        });
        expect(result.status).toBe("error");
    });

    test("debe fallar sin plcType", () => {
        const result = PLCInterface.execute({ action: "getTypeInfo" });
        expect(result.status).toBe("error");
    });
});

describe("PLCInterface - action: repair", () => {
    test("debe reparar código con espacios extra", () => {
        const result = PLCInterface.execute({
            action: "repair",
            code: "LD    X1   \r\nOUT    Y1   "
        });
        expect(result.status).toBe("ok");
        expect(result.data.changes).toBe(true);
        expect(result.data.repaired).not.toContain("\r");
    });

    test("debe indicar sin cambios si código está limpio", () => {
        const result = PLCInterface.execute({
            action: "repair",
            code: "LD X1\nOUT Y1"
        });
        expect(result.data.changes).toBe(false);
    });

    test("debe fallar sin código", () => {
        const result = PLCInterface.execute({ action: "repair" });
        expect(result.status).toBe("error");
    });
});

describe("PLCInterface - action: validate", () => {
    test("debe validar parámetros correctos", () => {
        const result = PLCInterface.execute({
            action: "validate",
            plcType: "Allen-Bradley",
            inputs: 5,
            outputs: 3
        });
        expect(result.data.valid).toBe(true);
        expect(result.data.errors).toHaveLength(0);
    });

    test("debe rechazar inputs > 256", () => {
        const result = PLCInterface.execute({
            action: "validate",
            plcType: "Allen-Bradley",
            inputs: 300,
            outputs: 1
        });
        expect(result.data.valid).toBe(false);
        expect(result.data.errors.length).toBeGreaterThan(0);
    });

    test("debe rechazar tipo inexistente", () => {
        const result = PLCInterface.execute({
            action: "validate",
            plcType: "Fake PLC"
        });
        expect(result.data.valid).toBe(false);
    });
});

describe("PLCInterface - action: listLanguages", () => {
    test("debe listar idiomas disponibles", () => {
        const result = PLCInterface.execute({ action: "listLanguages" });
        expect(result.status).toBe("ok");
        expect(result.data.languages.length).toBeGreaterThanOrEqual(20);
    });
});

describe("PLCInterface - action: setLanguage", () => {
    afterEach(() => { setLanguage("es"); });

    test("debe cambiar idioma", () => {
        const result = PLCInterface.execute({ action: "setLanguage", language: "en" });
        expect(result.status).toBe("ok");
    });

    test("debe fallar para idioma no soportado", () => {
        const result = PLCInterface.execute({ action: "setLanguage", language: "xx" });
        expect(result.status).toBe("error");
    });

    test("debe fallar sin parámetro language", () => {
        const result = PLCInterface.execute({ action: "setLanguage" });
        expect(result.status).toBe("error");
    });
});

describe("PLCInterface - action: batch", () => {
    test("debe ejecutar múltiples comandos", () => {
        const result = PLCInterface.execute({
            action: "batch",
            commands: [
                { action: "listTypes" },
                { action: "generate", plcType: "Allen-Bradley", inputs: 1, outputs: 1 }
            ]
        });
        expect(result.status).toBe("ok");
        expect(result.data.results).toHaveLength(2);
        expect(result.data.results[0].status).toBe("ok");
        expect(result.data.results[1].status).toBe("ok");
    });

    test("debe fallar si commands no es array", () => {
        const result = PLCInterface.execute({ action: "batch", commands: "invalid" });
        expect(result.status).toBe("error");
    });
});

describe("PLCInterface - action: analyze / diagnose / errorCode", () => {
    test("analyze detecta problemas con códigos de error", () => {
        const result = PLCInterface.execute({ action: "analyze", code: "" });
        expect(result.status).toBe("ok");
        expect(result.data.issues.some(i => i.code === "E001")).toBe(true);
    });

    test("analyze falla sin code", () => {
        expect(PLCInterface.execute({ action: "analyze" }).status).toBe("error");
    });

    test("diagnose devuelve coincidencias", () => {
        const result = PLCInterface.execute({ action: "diagnose", symptom: "fallo de bus" });
        expect(result.status).toBe("ok");
        expect(result.data.total).toBeGreaterThan(0);
    });

    test("diagnose falla sin symptom", () => {
        expect(PLCInterface.execute({ action: "diagnose" }).status).toBe("error");
    });

    test("errorCode busca un código conocido", () => {
        const result = PLCInterface.execute({ action: "errorCode", brand: "Siemens", code: "SF" });
        expect(result.status).toBe("ok");
        expect(result.data).toHaveProperty("solution");
    });

    test("errorCode falla con código inexistente", () => {
        const result = PLCInterface.execute({ action: "errorCode", brand: "Siemens", code: "ZZZ" });
        expect(result.status).toBe("error");
    });
});

describe("PLCInterface - conexión remota", () => {
    test("connect en simulación y luego read/write", () => {
        const c = PLCInterface.execute({ action: "connect", protocol: "modbus-tcp", mode: "simulation" });
        expect(c.status).toBe("ok");
        expect(c.data.connected).toBe(true);

        const w = PLCInterface.execute({ action: "write", address: "40001", value: 55 });
        expect(w.status).toBe("ok");

        const r = PLCInterface.execute({ action: "read", address: "40001" });
        expect(r.status).toBe("ok");
        expect(r.data.value).toBe(55);
    });

    test("connectionStatus refleja conexión", () => {
        PLCInterface.execute({ action: "connect", protocol: "modbus-tcp", mode: "simulation" });
        const s = PLCInterface.execute({ action: "connectionStatus" });
        expect(s.data.connected).toBe(true);
    });

    test("disconnect cierra la conexión", () => {
        PLCInterface.execute({ action: "connect", protocol: "modbus-tcp", mode: "simulation" });
        const d = PLCInterface.execute({ action: "disconnect" });
        expect(d.data.status).toBe("disconnected");
    });

    test("connect con protocolo inválido falla", () => {
        const c = PLCInterface.execute({ action: "connect", protocol: "xyz", mode: "simulation" });
        expect(c.status).toBe("error");
    });

    test("modo no simulación es rechazado en la interfaz IA", () => {
        const c = PLCInterface.execute({ action: "connect", protocol: "modbus-tcp", mode: "gateway", host: "1.2.3.4" });
        expect(c.status).toBe("error");
    });
});

describe("PLCInterface - checkUpdate", () => {
    test("devuelve versión actual", () => {
        const result = PLCInterface.execute({ action: "checkUpdate" });
        expect(result.status).toBe("ok");
        expect(result.data).toHaveProperty("current");
    });
});
