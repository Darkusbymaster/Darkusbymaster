/**
 * Pruebas unitarias para el módulo de lógica PLC (src/plc.js)
 * Cubre: plcTypes, getPLCCategories, generatePLCCode, repairPLCCode, downloadFile
 */

const { plcTypes, getPLCCategories, generatePLCCode, repairPLCCode, downloadFile } = require("../src/plc.js");

describe("plcTypes", () => {
    test("debe contener al menos 30 tipos de PLC", () => {
        expect(Object.keys(plcTypes).length).toBeGreaterThanOrEqual(30);
    });

    test("cada tipo debe tener prefix, inputTag, outputTag, separator, brand", () => {
        for (const [name, config] of Object.entries(plcTypes)) {
            expect(config).toHaveProperty("prefix");
            expect(config).toHaveProperty("inputTag");
            expect(config).toHaveProperty("outputTag");
            expect(config).toHaveProperty("separator");
            expect(config).toHaveProperty("brand");
            expect(typeof config.prefix).toBe("string");
            expect(typeof config.brand).toBe("string");
        }
    });

    test("debe incluir los principales fabricantes", () => {
        expect(plcTypes).toHaveProperty("Allen-Bradley");
        expect(plcTypes).toHaveProperty("Siemens (S7-300/400)");
        expect(plcTypes).toHaveProperty("Siemens (S7-1200/1500)");
        expect(plcTypes).toHaveProperty("Mitsubishi (MELSEC-Q)");
        expect(plcTypes).toHaveProperty("Omron (CJ/CP)");
        expect(plcTypes).toHaveProperty("Schneider (Modicon)");
        expect(plcTypes).toHaveProperty("ABB (AC500)");
        expect(plcTypes).toHaveProperty("Beckhoff (TwinCAT)");
        expect(plcTypes).toHaveProperty("Delta (DVP)");
        expect(plcTypes).toHaveProperty("Keyence (KV)");
    });

    test("los prefijos deben ser lenguajes válidos (LD, ST, STL, SCL, IL)", () => {
        const validPrefixes = ["LD", "ST", "STL", "SCL", "IL"];
        for (const config of Object.values(plcTypes)) {
            expect(validPrefixes).toContain(config.prefix);
        }
    });
});

describe("getPLCCategories", () => {
    test("debe retornar 4 categorías regionales", () => {
        const categories = getPLCCategories();
        expect(Object.keys(categories)).toHaveLength(4);
        expect(categories).toHaveProperty("Americanos");
        expect(categories).toHaveProperty("Europeos");
        expect(categories).toHaveProperty("Japoneses");
        expect(categories).toHaveProperty("Asiáticos/Otros");
    });

    test("cada PLC en categorías debe existir en plcTypes", () => {
        const categories = getPLCCategories();
        for (const plcs of Object.values(categories)) {
            for (const plc of plcs) {
                expect(plcTypes).toHaveProperty(plc);
            }
        }
    });

    test("todos los PLCs de plcTypes deben estar en alguna categoría", () => {
        const categories = getPLCCategories();
        const allCategorized = Object.values(categories).flat();
        for (const plcName of Object.keys(plcTypes)) {
            expect(allCategorized).toContain(plcName);
        }
    });
});

describe("generatePLCCode", () => {
    describe("generación Ladder (LD)", () => {
        test("Allen-Bradley con entradas y salidas", () => {
            const result = generatePLCCode("Allen-Bradley", 2, 1);
            expect(result).toContain("Rockwell Automation");
            expect(result).toContain("LD   I:1");
            expect(result).toContain("LD   I:2");
            expect(result).toContain("OUT  O:1");
        });

        test("Mitsubishi MELSEC-Q con formato X/Y", () => {
            const result = generatePLCCode("Mitsubishi (MELSEC-Q)", 2, 2);
            expect(result).toContain("Mitsubishi Electric");
            expect(result).toContain("LD   X1");
            expect(result).toContain("OUT  Y1");
        });

        test("Delta DVP con formato X/Y", () => {
            const result = generatePLCCode("Delta (DVP)", 1, 1);
            expect(result).toContain("Delta Electronics");
            expect(result).toContain("LD   X1");
            expect(result).toContain("OUT  Y1");
        });
    });

    describe("generación Texto Estructurado (ST/SCL)", () => {
        test("Siemens S7-1200/1500 genera SCL", () => {
            const result = generatePLCCode("Siemens (S7-1200/1500)", 2, 1);
            expect(result).toContain("PROGRAM PLC_Main");
            expect(result).toContain("VAR");
            expect(result).toContain("%I.1 : BOOL");
            expect(result).toContain("%Q.1 : BOOL");
            expect(result).toContain("END_VAR");
            expect(result).toContain(":=");
            expect(result).toContain("END_PROGRAM");
        });

        test("ABB AC500 genera ST", () => {
            const result = generatePLCCode("ABB (AC500)", 1, 1);
            expect(result).toContain("PROGRAM PLC_Main");
            expect(result).toContain("DI_1 : BOOL");
            expect(result).toContain("DO_1 : BOOL");
        });

        test("Beckhoff TwinCAT genera ST con naming específico", () => {
            const result = generatePLCCode("Beckhoff (TwinCAT)", 1, 1);
            expect(result).toContain("bInput_1 : BOOL");
            expect(result).toContain("bOutput_1 : BOOL");
        });

        test("Omron NX/NJ genera ST", () => {
            const result = generatePLCCode("Omron (NX/NJ)", 2, 2);
            expect(result).toContain("Input_1 : BOOL");
            expect(result).toContain("Output_1 : BOOL");
            expect(result).toContain("Output_1 := Input_1");
        });
    });

    describe("generación Lista de Instrucciones STL", () => {
        test("Siemens S7-300/400 genera STL", () => {
            const result = generatePLCCode("Siemens (S7-300/400)", 2, 1);
            expect(result).toContain("A    I.1");
            expect(result).toContain("A    I.2");
            expect(result).toContain("=    Q.1");
        });

        test("VIPA genera STL compatible Siemens", () => {
            const result = generatePLCCode("VIPA", 1, 1);
            expect(result).toContain("A    I.1");
            expect(result).toContain("=    Q.1");
        });
    });

    describe("generación Lista de Instrucciones IL (IEC)", () => {
        test("Schneider Modicon genera IL", () => {
            const result = generatePLCCode("Schneider (Modicon)", 2, 1);
            expect(result).toContain("LD   %I.1");
            expect(result).toContain("LD   %I.2");
            expect(result).toContain("ST   %Q.1");
        });
    });

    describe("casos límite", () => {
        test("debe retornar cadena vacía para tipo no reconocido", () => {
            const result = generatePLCCode("PLCInventado", 1, 1);
            expect(result).toBe("");
        });

        test("debe generar solo header con 0 entradas y 0 salidas", () => {
            const result = generatePLCCode("Allen-Bradley", 0, 0);
            expect(result).toContain("Rockwell Automation");
            expect(result).not.toContain("LD   I");
            expect(result).not.toContain("OUT  O");
        });

        test("debe manejar entradas negativas como cero", () => {
            const result = generatePLCCode("Allen-Bradley", -3, 0);
            expect(result).not.toContain("LD   I");
        });

        test("debe generar código para todos los tipos sin errores", () => {
            for (const type of Object.keys(plcTypes)) {
                const result = generatePLCCode(type, 2, 2);
                expect(result.length).toBeGreaterThan(0);
                expect(result).toContain(plcTypes[type].brand);
            }
        });
    });
});

describe("repairPLCCode", () => {
    test("debe normalizar múltiples espacios", () => {
        const input = "LD    X1";
        const result = repairPLCCode(input);
        expect(result).toBe("LD  X1");
    });

    test("debe eliminar espacios al final de línea", () => {
        const input = "LD X1   \nOUT Y1  ";
        const result = repairPLCCode(input);
        expect(result).toBe("LD X1\nOUT Y1");
    });

    test("debe normalizar saltos de línea Windows a Unix", () => {
        const input = "LD X1\r\nOUT Y1\r\n";
        const result = repairPLCCode(input);
        expect(result).not.toContain("\r");
        expect(result).toContain("\n");
    });

    test("debe manejar cadena vacía", () => {
        expect(repairPLCCode("")).toBe("");
    });

    test("no debe modificar código limpio", () => {
        const clean = "PROGRAM PLC_Main\nVAR\n  DI_1 : BOOL;\nEND_VAR";
        expect(repairPLCCode(clean)).toBe(clean);
    });

    test("debe manejar múltiples problemas combinados", () => {
        const input = "LD    X1   \r\nOUT    Y1   \r\n";
        const result = repairPLCCode(input);
        expect(result).toBe("LD  X1\nOUT  Y1\n");
    });
});

describe("downloadFile", () => {
    let createObjectURLMock;
    let revokeObjectURLMock;

    beforeEach(() => {
        createObjectURLMock = jest.fn(() => "blob:http://localhost/fake-url");
        revokeObjectURLMock = jest.fn();
        global.URL.createObjectURL = createObjectURLMock;
        global.URL.revokeObjectURL = revokeObjectURLMock;
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("debe crear un Blob con el contenido", () => {
        downloadFile("LD X1", "test.txt");
        expect(createObjectURLMock).toHaveBeenCalledTimes(1);
        const blob = createObjectURLMock.mock.calls[0][0];
        expect(blob).toBeInstanceOf(Blob);
    });

    test("debe usar el nombre de archivo correcto", () => {
        const clickMock = jest.fn();
        jest.spyOn(document, "createElement").mockReturnValue({
            href: "", download: "", click: clickMock
        });
        jest.spyOn(document.body, "appendChild").mockImplementation(() => {});
        jest.spyOn(document.body, "removeChild").mockImplementation(() => {});

        downloadFile("contenido", "plc_code.txt");
        const anchor = document.createElement.mock.results[0].value;
        expect(anchor.download).toBe("plc_code.txt");
    });

    test("debe ejecutar click para iniciar descarga", () => {
        const clickMock = jest.fn();
        jest.spyOn(document, "createElement").mockReturnValue({
            href: "", download: "", click: clickMock
        });
        jest.spyOn(document.body, "appendChild").mockImplementation(() => {});
        jest.spyOn(document.body, "removeChild").mockImplementation(() => {});

        downloadFile("data", "file.txt");
        expect(clickMock).toHaveBeenCalledTimes(1);
    });

    test("debe revocar URL después de descarga", () => {
        jest.spyOn(document, "createElement").mockReturnValue({
            href: "", download: "", click: jest.fn()
        });
        jest.spyOn(document.body, "appendChild").mockImplementation(() => {});
        jest.spyOn(document.body, "removeChild").mockImplementation(() => {});

        downloadFile("data", "file.txt");
        expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:http://localhost/fake-url");
    });
});
