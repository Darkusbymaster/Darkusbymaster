/**
 * Pruebas unitarias para el módulo de diagnóstico (src/diagnostics.js)
 */

const {
    errorDatabase,
    codeRules,
    analyzeCode,
    lookupErrorCode,
    diagnose,
    getDiagnosticBrands,
    listErrorCodes
} = require("../src/diagnostics.js");

describe("analyzeCode", () => {
    test("detecta código vacío con E001", () => {
        const res = analyzeCode("");
        expect(res.ok).toBe(false);
        expect(res.issues.some(i => i.code === "E001")).toBe(true);
        expect(res.summary.critical).toBeGreaterThanOrEqual(1);
    });

    test("código vacío también para null/espacios", () => {
        expect(analyzeCode(null).issues.some(i => i.code === "E001")).toBe(true);
        expect(analyzeCode("   ").issues.some(i => i.code === "E001")).toBe(true);
    });

    test("detecta ausencia de salidas con E002", () => {
        const res = analyzeCode("LD I1\nLD I2");
        expect(res.issues.some(i => i.code === "E002")).toBe(true);
    });

    test("no marca E002 si hay salida OUT", () => {
        const res = analyzeCode("LD I1\nOUT Q1");
        expect(res.issues.some(i => i.code === "E002")).toBe(false);
    });

    test("detecta PROGRAM sin END_PROGRAM (E003)", () => {
        const res = analyzeCode("PROGRAM Main\nQ1 := I1;");
        expect(res.issues.some(i => i.code === "E003")).toBe(true);
    });

    test("detecta VAR sin END_VAR (E004)", () => {
        const res = analyzeCode("VAR\n  x : BOOL;");
        expect(res.issues.some(i => i.code === "E004")).toBe(true);
    });

    test("detecta comentarios IL desbalanceados (E006)", () => {
        const res = analyzeCode("LD I1 (* entrada\nOUT Q1");
        expect(res.issues.some(i => i.code === "E006")).toBe(true);
    });

    test("código ST bien formado no tiene críticos", () => {
        const code = "PROGRAM Main\nVAR\n  Q1 : BOOL;\nEND_VAR\nQ1 := TRUE;\nEND_PROGRAM";
        const res = analyzeCode(code);
        expect(res.ok).toBe(true);
        expect(res.summary.critical).toBe(0);
    });

    test("summary cuenta por severidad", () => {
        const res = analyzeCode("");
        expect(res.summary).toHaveProperty("total");
        expect(res.summary).toHaveProperty("critical");
        expect(res.summary).toHaveProperty("warnings");
        expect(res.summary).toHaveProperty("info");
    });
});

describe("lookupErrorCode", () => {
    test("encuentra código conocido de Siemens", () => {
        const entry = lookupErrorCode("Siemens", "SF");
        expect(entry).not.toBeNull();
        expect(entry).toHaveProperty("cause");
        expect(entry).toHaveProperty("solution");
    });

    test("es insensible a mayúsculas", () => {
        expect(lookupErrorCode("Siemens", "sf")).not.toBeNull();
    });

    test("devuelve null para marca desconocida", () => {
        expect(lookupErrorCode("NoExiste", "SF")).toBeNull();
    });

    test("devuelve null para código desconocido", () => {
        expect(lookupErrorCode("Siemens", "ZZZ999")).toBeNull();
    });
});

describe("diagnose", () => {
    test("encuentra coincidencias por síntoma", () => {
        const res = diagnose("fallo de bus");
        expect(res.total).toBeGreaterThan(0);
        expect(res.matches[0]).toHaveProperty("brand");
        expect(res.matches[0]).toHaveProperty("solution");
    });

    test("ordena por relevancia (score descendente)", () => {
        const res = diagnose("watchdog tiempo ciclo");
        for (let i = 1; i < res.matches.length; i++) {
            expect(res.matches[i - 1].score).toBeGreaterThanOrEqual(res.matches[i].score);
        }
    });

    test("acota por marca", () => {
        const res = diagnose("error", "Mitsubishi");
        expect(res.matches.every(m => m.brand === "Mitsubishi")).toBe(true);
    });

    test("síntoma vacío devuelve sin coincidencias", () => {
        expect(diagnose("").total).toBe(0);
        expect(diagnose(null).total).toBe(0);
    });
});

describe("getDiagnosticBrands / listErrorCodes", () => {
    test("lista las marcas disponibles", () => {
        const brands = getDiagnosticBrands();
        expect(Array.isArray(brands)).toBe(true);
        expect(brands).toContain("Siemens");
        expect(brands).toContain("Allen-Bradley");
    });

    test("lista códigos de una marca", () => {
        const codes = listErrorCodes("Siemens");
        expect(codes.length).toBeGreaterThan(0);
        expect(codes[0]).toHaveProperty("code");
    });

    test("marca inexistente devuelve array vacío", () => {
        expect(listErrorCodes("NoExiste")).toEqual([]);
    });

    test("la base de datos y las reglas existen", () => {
        expect(Object.keys(errorDatabase).length).toBeGreaterThan(0);
        expect(codeRules.length).toBeGreaterThan(0);
    });
});
