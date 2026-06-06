/**
 * Módulo de lógica PLC - Generación y reparación de código PLC multiplataforma
 * Soporta todos los PLCs principales del mercado industrial
 */

const plcTypes = {
    // Americanos
    "Allen-Bradley": { prefix: "LD", inputTag: "I", outputTag: "O", separator: ":", brand: "Rockwell Automation" },
    "GE-Fanuc": { prefix: "LD", inputTag: "%I", outputTag: "%Q", separator: "", brand: "GE Vernova" },
    "Honeywell": { prefix: "LD", inputTag: "DI", outputTag: "DO", separator: ".", brand: "Honeywell" },
    "Emerson (DeltaV)": { prefix: "LD", inputTag: "DI", outputTag: "DO", separator: "_", brand: "Emerson" },

    // Europeos
    "Siemens (S7-300/400)": { prefix: "STL", inputTag: "I", outputTag: "Q", separator: ".", brand: "Siemens" },
    "Siemens (S7-1200/1500)": { prefix: "SCL", inputTag: "%I", outputTag: "%Q", separator: ".", brand: "Siemens" },
    "Schneider (Modicon)": { prefix: "IL", inputTag: "%I", outputTag: "%Q", separator: ".", brand: "Schneider Electric" },
    "Schneider (Zelio)": { prefix: "LD", inputTag: "I", outputTag: "Q", separator: "", brand: "Schneider Electric" },
    "ABB (AC500)": { prefix: "ST", inputTag: "DI", outputTag: "DO", separator: "_", brand: "ABB" },
    "Beckhoff (TwinCAT)": { prefix: "ST", inputTag: "bInput", outputTag: "bOutput", separator: "_", brand: "Beckhoff" },
    "Phoenix Contact": { prefix: "ST", inputTag: "DI", outputTag: "DO", separator: ".", brand: "Phoenix Contact" },
    "Pilz (PSS)": { prefix: "LD", inputTag: "I", outputTag: "O", separator: ".", brand: "Pilz" },
    "WAGO (750)": { prefix: "ST", inputTag: "%IX", outputTag: "%QX", separator: ".", brand: "WAGO" },
    "B&R Automation": { prefix: "ST", inputTag: "DI_", outputTag: "DO_", separator: "", brand: "B&R" },
    "VIPA": { prefix: "STL", inputTag: "I", outputTag: "Q", separator: ".", brand: "VIPA/Yaskawa" },

    // Japoneses
    "Mitsubishi (MELSEC-Q)": { prefix: "LD", inputTag: "X", outputTag: "Y", separator: "", brand: "Mitsubishi Electric" },
    "Mitsubishi (iQ-R)": { prefix: "ST", inputTag: "X", outputTag: "Y", separator: "", brand: "Mitsubishi Electric" },
    "Omron (CJ/CP)": { prefix: "LD", inputTag: "CIO", outputTag: "CIO", separator: ".", brand: "Omron" },
    "Omron (NX/NJ)": { prefix: "ST", inputTag: "Input", outputTag: "Output", separator: "_", brand: "Omron" },
    "Keyence (KV)": { prefix: "LD", inputTag: "R", outputTag: "R", separator: "", brand: "Keyence" },
    "Panasonic (FP)": { prefix: "LD", inputTag: "X", outputTag: "Y", separator: "", brand: "Panasonic" },
    "Yokogawa": { prefix: "LD", inputTag: "DI", outputTag: "DO", separator: ".", brand: "Yokogawa" },
    "Fuji Electric": { prefix: "LD", inputTag: "X", outputTag: "Y", separator: "", brand: "Fuji Electric" },

    // Asiáticos/Otros
    "Delta (DVP)": { prefix: "LD", inputTag: "X", outputTag: "Y", separator: "", brand: "Delta Electronics" },
    "LS Electric (XGB)": { prefix: "LD", inputTag: "%IX", outputTag: "%QX", separator: ".", brand: "LS Electric" },
    "Fatek (FBs)": { prefix: "LD", inputTag: "X", outputTag: "Y", separator: "", brand: "Fatek" },
    "Unitronics (Vision)": { prefix: "LD", inputTag: "I", outputTag: "O", separator: "", brand: "Unitronics" },
    "Weintek": { prefix: "LD", inputTag: "LB", outputTag: "LB", separator: "", brand: "Weintek" },
    "Koyo (DirectLOGIC)": { prefix: "LD", inputTag: "X", outputTag: "Y", separator: "", brand: "Koyo/AutomationDirect" },
    "IDEC (MicroSmart)": { prefix: "LD", inputTag: "I", outputTag: "Q", separator: "", brand: "IDEC" },
    "Teco (SG2)": { prefix: "LD", inputTag: "I", outputTag: "Q", separator: "", brand: "Teco" },
    "Vigor (VB/VH)": { prefix: "LD", inputTag: "X", outputTag: "Y", separator: "", brand: "Vigor Electric" },
    "HollySys": { prefix: "LD", inputTag: "DI", outputTag: "DO", separator: ".", brand: "HollySys" },
    "Inovance": { prefix: "LD", inputTag: "X", outputTag: "Y", separator: "", brand: "Inovance" }
};

/**
 * Obtiene las categorías de PLCs agrupadas por región.
 * @returns {Object} PLCs agrupados por región
 */
function getPLCCategories() {
    return {
        "Americanos": ["Allen-Bradley", "GE-Fanuc", "Honeywell", "Emerson (DeltaV)"],
        "Europeos": ["Siemens (S7-300/400)", "Siemens (S7-1200/1500)", "Schneider (Modicon)", "Schneider (Zelio)", "ABB (AC500)", "Beckhoff (TwinCAT)", "Phoenix Contact", "Pilz (PSS)", "WAGO (750)", "B&R Automation", "VIPA"],
        "Japoneses": ["Mitsubishi (MELSEC-Q)", "Mitsubishi (iQ-R)", "Omron (CJ/CP)", "Omron (NX/NJ)", "Keyence (KV)", "Panasonic (FP)", "Yokogawa", "Fuji Electric"],
        "Asiáticos/Otros": ["Delta (DVP)", "LS Electric (XGB)", "Fatek (FBs)", "Unitronics (Vision)", "Weintek", "Koyo (DirectLOGIC)", "IDEC (MicroSmart)", "Teco (SG2)", "Vigor (VB/VH)", "HollySys", "Inovance"]
    };
}

/**
 * Genera código PLC basado en el tipo de PLC, número de entradas y salidas.
 * @param {string} type - Tipo de PLC
 * @param {number} inputs - Número de entradas
 * @param {number} outputs - Número de salidas
 * @returns {string} Código PLC generado
 */
function generatePLCCode(type, inputs, outputs) {
    const config = plcTypes[type];
    if (!config) return "";

    let code = `// ${config.brand} - ${type}\n`;
    code += `// Lenguaje: ${config.prefix}\n`;
    code += `// Entradas: ${inputs} | Salidas: ${outputs}\n`;
    code += `// ─────────────────────────────────\n\n`;

    if (config.prefix === "ST" || config.prefix === "SCL") {
        // Texto estructurado (IEC 61131-3)
        code += `PROGRAM PLC_Main\nVAR\n`;
        for (let i = 1; i <= inputs; i++) {
            code += `    ${config.inputTag}${config.separator}${i} : BOOL; // Entrada ${i}\n`;
        }
        for (let i = 1; i <= outputs; i++) {
            code += `    ${config.outputTag}${config.separator}${i} : BOOL; // Salida ${i}\n`;
        }
        code += `END_VAR\n\n`;
        for (let i = 1; i <= Math.min(inputs, outputs); i++) {
            code += `${config.outputTag}${config.separator}${i} := ${config.inputTag}${config.separator}${i};\n`;
        }
        code += `\nEND_PROGRAM`;
    } else if (config.prefix === "STL") {
        // Lista de instrucciones Siemens
        for (let i = 1; i <= inputs; i++) {
            code += `A    ${config.inputTag}${config.separator}${i}    // Entrada ${i}\n`;
        }
        for (let i = 1; i <= outputs; i++) {
            code += `=    ${config.outputTag}${config.separator}${i}    // Salida ${i}\n`;
        }
    } else if (config.prefix === "IL") {
        // Lista de instrucciones IEC
        for (let i = 1; i <= inputs; i++) {
            code += `LD   ${config.inputTag}${config.separator}${i}    (* Entrada ${i} *)\n`;
        }
        for (let i = 1; i <= outputs; i++) {
            code += `ST   ${config.outputTag}${config.separator}${i}    (* Salida ${i} *)\n`;
        }
    } else {
        // Diagrama Ladder (LD)
        for (let i = 1; i <= inputs; i++) {
            code += `LD   ${config.inputTag}${config.separator}${i}\n`;
        }
        for (let i = 1; i <= outputs; i++) {
            code += `OUT  ${config.outputTag}${config.separator}${i}\n`;
        }
    }

    return code;
}

/**
 * Repara el código PLC eliminando espacios extra y normalizando formato.
 * @param {string} code - Código PLC a reparar
 * @returns {string} Código PLC reparado
 */
function repairPLCCode(code) {
    let repaired = code;
    // Normalizar múltiples espacios en instrucciones
    repaired = repaired.replace(/  +/g, "  ");
    // Eliminar espacios al final de línea
    repaired = repaired.replace(/ +$/gm, "");
    // Asegurar fin de línea consistente
    repaired = repaired.replace(/\r\n/g, "\n");
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
    module.exports = { plcTypes, getPLCCategories, generatePLCCode, repairPLCCode, downloadFile };
}
