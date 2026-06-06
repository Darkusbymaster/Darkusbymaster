/**
 * Pruebas unitarias para el módulo de lógica PLC (src/plc.js)
 * Cubre: generatePLCCode, repairPLCCode, downloadFile, plcTypes
 */

const { plcTypes, generatePLCCode, repairPLCCode, downloadFile } = require("../src/plc.js");

describe("plcTypes", () => {
    test("debe contener los tres tipos de PLC soportados", () => {
        expect(plcTypes).toHaveProperty("Allen-Bradley");
        expect(plcTypes).toHaveProperty("Siemens");
        expect(plcTypes).toHaveProperty("Mitsubishi");
    });

    test("cada tipo debe tener un prefijo LD seguido del nombre", () => {
        expect(plcTypes["Allen-Bradley"]).toBe("LD Allen-Bradley");
        expect(plcTypes["Siemens"]).toBe("LD Siemens");
        expect(plcTypes["Mitsubishi"]).toBe("LD Mitsubishi");
    });
});

describe("generatePLCCode", () => {
    describe("generación básica por tipo de PLC", () => {
        test("debe generar código Allen-Bradley sin entradas ni salidas", () => {
            const result = generatePLCCode("Allen-Bradley", 0, 0);
            expect(result).toBe("LD Allen-Bradley");
        });

        test("debe generar código Siemens sin entradas ni salidas", () => {
            const result = generatePLCCode("Siemens", 0, 0);
            expect(result).toBe("LD Siemens");
        });

        test("debe generar código Mitsubishi sin entradas ni salidas", () => {
            const result = generatePLCCode("Mitsubishi", 0, 0);
            expect(result).toBe("LD Mitsubishi");
        });
    });

    describe("generación con entradas", () => {
        test("debe generar una entrada correctamente", () => {
            const result = generatePLCCode("Allen-Bradley", 1, 0);
            expect(result).toContain("X1 LD");
        });

        test("debe generar múltiples entradas numeradas secuencialmente", () => {
            const result = generatePLCCode("Siemens", 3, 0);
            expect(result).toContain("X1 LD");
            expect(result).toContain("X2 LD");
            expect(result).toContain("X3 LD");
        });

        test("cada entrada debe estar en una nueva línea", () => {
            const result = generatePLCCode("Allen-Bradley", 2, 0);
            const lines = result.split("\n");
            expect(lines[1]).toBe("X1 LD");
            expect(lines[2]).toBe("X2 LD");
        });
    });

    describe("generación con salidas", () => {
        test("debe generar una salida correctamente", () => {
            const result = generatePLCCode("Mitsubishi", 0, 1);
            expect(result).toContain("Y1 OT");
        });

        test("debe generar múltiples salidas numeradas secuencialmente", () => {
            const result = generatePLCCode("Allen-Bradley", 0, 3);
            expect(result).toContain("Y1 OT");
            expect(result).toContain("Y2 OT");
            expect(result).toContain("Y3 OT");
        });

        test("cada salida debe estar en una nueva línea", () => {
            const result = generatePLCCode("Siemens", 0, 2);
            const lines = result.split("\n");
            expect(lines[1]).toBe("Y1 OT");
            expect(lines[2]).toBe("Y2 OT");
        });
    });

    describe("generación combinada (entradas + salidas)", () => {
        test("debe generar entradas antes que salidas", () => {
            const result = generatePLCCode("Allen-Bradley", 2, 2);
            const lines = result.split("\n");
            expect(lines[0]).toBe("LD Allen-Bradley");
            expect(lines[1]).toBe("X1 LD");
            expect(lines[2]).toBe("X2 LD");
            expect(lines[3]).toBe("Y1 OT");
            expect(lines[4]).toBe("Y2 OT");
        });

        test("debe manejar muchas entradas y salidas", () => {
            const result = generatePLCCode("Siemens", 10, 5);
            const lines = result.split("\n");
            expect(lines).toHaveLength(16); // 1 header + 10 inputs + 5 outputs
        });
    });

    describe("casos límite", () => {
        test("debe retornar cadena vacía para tipo de PLC no reconocido", () => {
            const result = generatePLCCode("Desconocido", 0, 0);
            expect(result).toBe("");
        });

        test("debe retornar solo entradas/salidas para tipo no reconocido con I/O", () => {
            const result = generatePLCCode("Otro", 1, 1);
            expect(result).toBe("\nX1 LD\nY1 OT");
        });

        test("debe manejar entradas negativas como cero", () => {
            const result = generatePLCCode("Allen-Bradley", -1, 0);
            expect(result).toBe("LD Allen-Bradley");
        });

        test("debe manejar salidas negativas como cero", () => {
            const result = generatePLCCode("Allen-Bradley", 0, -5);
            expect(result).toBe("LD Allen-Bradley");
        });
    });
});

describe("repairPLCCode", () => {
    test("debe eliminar espacio después de LD", () => {
        const input = "X1 LD ";
        const result = repairPLCCode(input);
        expect(result).toBe("X1 LD");
    });

    test("debe eliminar espacio después de OT", () => {
        const input = "Y1 OT ";
        const result = repairPLCCode(input);
        expect(result).toBe("Y1 OT");
    });

    test("debe reparar múltiples ocurrencias de LD con espacio", () => {
        const input = "X1 LD \nX2 LD \nX3 LD ";
        const result = repairPLCCode(input);
        expect(result).not.toContain("LD ");
    });

    test("debe reparar múltiples ocurrencias de OT con espacio", () => {
        const input = "Y1 OT \nY2 OT ";
        const result = repairPLCCode(input);
        expect(result).not.toContain("OT ");
    });

    test("no debe modificar código sin espacios post-LD/OT en instrucciones", () => {
        const input = "X1 LD\nY1 OT";
        const result = repairPLCCode(input);
        expect(result).toBe("X1 LD\nY1 OT");
    });

    test("debe modificar el header LD si contiene espacio (comportamiento esperado)", () => {
        const input = "LD Allen-Bradley\nX1 LD\nY1 OT";
        const result = repairPLCCode(input);
        // La función reemplaza TODOS los "LD " incluyendo el header
        expect(result).toBe("LDAllen-Bradley\nX1 LD\nY1 OT");
    });

    test("debe manejar cadena vacía", () => {
        const result = repairPLCCode("");
        expect(result).toBe("");
    });

    test("debe manejar código sin instrucciones LD u OT", () => {
        const input = "HEADER\nDATA 123";
        const result = repairPLCCode(input);
        expect(result).toBe("HEADER\nDATA 123");
    });

    test("debe reparar combinación de LD y OT con espacios", () => {
        const input = "LD Allen-Bradley\nX1 LD \nY1 OT ";
        const result = repairPLCCode(input);
        expect(result).toBe("LDAllen-Bradley\nX1 LD\nY1 OT");
    });

    test("debe eliminar todos los espacios post-LD incluso en el header", () => {
        const input = "LD Siemens";
        const result = repairPLCCode(input);
        expect(result).toBe("LDSiemens");
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

    test("debe crear un Blob con el contenido proporcionado", () => {
        const content = "LD Allen-Bradley\nX1 LD";
        downloadFile(content, "test.txt");
        expect(createObjectURLMock).toHaveBeenCalledTimes(1);
        const blobArg = createObjectURLMock.mock.calls[0][0];
        expect(blobArg).toBeInstanceOf(Blob);
    });

    test("debe crear un enlace con el nombre de archivo correcto", () => {
        const clickMock = jest.fn();
        jest.spyOn(document, "createElement").mockReturnValue({
            href: "",
            download: "",
            click: clickMock,
        });
        jest.spyOn(document.body, "appendChild").mockImplementation(() => {});
        jest.spyOn(document.body, "removeChild").mockImplementation(() => {});

        downloadFile("contenido", "archivo.txt");
        
        const anchor = document.createElement.mock.results[0].value;
        expect(anchor.download).toBe("archivo.txt");
    });

    test("debe ejecutar click en el enlace para iniciar descarga", () => {
        const clickMock = jest.fn();
        jest.spyOn(document, "createElement").mockReturnValue({
            href: "",
            download: "",
            click: clickMock,
        });
        jest.spyOn(document.body, "appendChild").mockImplementation(() => {});
        jest.spyOn(document.body, "removeChild").mockImplementation(() => {});

        downloadFile("contenido", "archivo.txt");
        expect(clickMock).toHaveBeenCalledTimes(1);
    });

    test("debe revocar la URL del objeto después de descargar", () => {
        jest.spyOn(document, "createElement").mockReturnValue({
            href: "",
            download: "",
            click: jest.fn(),
        });
        jest.spyOn(document.body, "appendChild").mockImplementation(() => {});
        jest.spyOn(document.body, "removeChild").mockImplementation(() => {});

        downloadFile("contenido", "archivo.txt");
        expect(revokeObjectURLMock).toHaveBeenCalledWith("blob:http://localhost/fake-url");
    });
});
