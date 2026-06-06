/**
 * Módulo de Diagnóstico PLC
 * Analiza código y síntomas, devuelve códigos de error, causas y soluciones.
 * Incluye base de datos de códigos de error de fallo de las marcas principales.
 */

/**
 * Base de datos de códigos de error de hardware/runtime por marca.
 * Cada entrada: { code, severity, cause, solution }
 * severity: "info" | "warning" | "critical"
 */
const errorDatabase = {
    "Siemens": [
        { code: "SF", severity: "critical", title: "System Fault (LED SF)", cause: "Fallo interno de la CPU, módulo defectuoso o error de configuración hardware.", solution: "Revise el búfer de diagnóstico en TIA Portal (Online & Diagnostics). Verifique módulos y firmware. Reemplace el módulo defectuoso." },
        { code: "BF", severity: "critical", title: "Bus Fault (LED BF)", cause: "Fallo en el bus PROFIBUS/PROFINET: cable, terminación o dirección duplicada.", solution: "Verifique cableado y conectores. Compruebe direcciones de nodo únicas y resistencias de terminación." },
        { code: "0x2942", severity: "critical", title: "Acceso a área no válida", cause: "Lectura/escritura de un área de memoria fuera de rango (I/Q/M/DB).", solution: "Verifique punteros e índices de arrays. Compruebe límites de los DB." },
        { code: "0x3505", severity: "warning", title: "DB no cargado", cause: "El bloque de datos referenciado no existe en la CPU.", solution: "Cargue el DB en la CPU. Verifique el número de DB en el programa." },
        { code: "MRES", severity: "info", title: "Memory Reset requerido", cause: "Inconsistencia de memoria tras cambio de configuración.", solution: "Realice un borrado total (MRES) y recargue el programa." }
    ],
    "Allen-Bradley": [
        { code: "16#0001", severity: "warning", title: "Tarea solapada (Task Overlap)", cause: "El tiempo de escaneo excede el periodo de la tarea periódica.", solution: "Aumente el periodo de la tarea o reduzca la carga del programa." },
        { code: "16#0204", severity: "critical", title: "Connection Timeout", cause: "Pérdida de comunicación con un módulo de E/S remoto (EtherNet/IP).", solution: "Verifique cableado de red, switch y RPI. Compruebe el estado del módulo en RSLogix/Studio 5000." },
        { code: "Fault Code 4", severity: "critical", title: "Program Fault - Array index", cause: "Índice de array fuera de límites.", solution: "Revise los índices. Añada lógica de saturación de límites." },
        { code: "S:FS", severity: "info", title: "First Scan", cause: "Bit de primer escaneo activo tras arranque (normal).", solution: "Use S:FS para inicializar valores. No es un fallo." },
        { code: "16#0107", severity: "critical", title: "Module Mismatch", cause: "El módulo físico no coincide con la configuración del proyecto.", solution: "Verifique catálogo, revisión y slot del módulo en la configuración de E/S." }
    ],
    "Omron": [
        { code: "ERR/ALM", severity: "critical", title: "Error fatal (LED ERR/ALM)", cause: "Error de memoria, watchdog o fallo de E/S.", solution: "Lea el Auxiliary Area (A400) para el código de error. Borre con CX-Programmer." },
        { code: "A40113", severity: "critical", title: "Error de memoria de programa", cause: "Memoria de usuario corrupta.", solution: "Transfiera de nuevo el programa. Verifique la batería." },
        { code: "A40208", severity: "warning", title: "Cycle Time Over", cause: "El tiempo de ciclo supera el watchdog configurado.", solution: "Aumente el watchdog o optimice el programa." }
    ],
    "Mitsubishi": [
        { code: "4100", severity: "critical", title: "OPERATION ERROR", cause: "Instrucción ejecutada con un dispositivo/valor no válido.", solution: "Revise dispositivos usados en instrucciones. Verifique rangos de índice (Z)." },
        { code: "2200", severity: "critical", title: "MISSING END INS.", cause: "Falta la instrucción END en el programa.", solution: "Añada la instrucción END al final del programa principal." },
        { code: "1000", severity: "warning", title: "WDT ERROR", cause: "Watchdog Timer agotado: escaneo demasiado largo.", solution: "Optimice el programa o aumente el valor del WDT en parámetros." }
    ],
    "Schneider Electric": [
        { code: "0x800B", severity: "critical", title: "I/O Bus Error", cause: "Fallo en el bus de E/S o módulo no detectado.", solution: "Verifique el módulo, conexiones y alimentación del bus." },
        { code: "0x2258", severity: "warning", title: "Watchdog overrun", cause: "El tiempo de tarea master supera el watchdog.", solution: "Ajuste el periodo de tarea en EcoStruxure/Unity Pro." }
    ]
};

/**
 * Reglas de análisis estático del código generado/editado.
 * Cada regla devuelve un código de error E0xx si se cumple la condición.
 */
const codeRules = [
    {
        code: "E001",
        severity: "critical",
        title: "Código vacío",
        test: (code) => !code || code.trim().length === 0,
        cause: "No se ha generado ningún código.",
        solution: "Seleccione un tipo de PLC y un número de entradas/salidas, luego genere el código."
    },
    {
        code: "E002",
        severity: "warning",
        title: "Sin salidas definidas",
        test: (code) => code.length > 0 && !/(OUT|ST |=\s|:=)/.test(code),
        cause: "El programa no contiene ninguna asignación de salida.",
        solution: "Añada al menos una salida (OUT/ST/:=) para que la lógica tenga efecto."
    },
    {
        code: "E003",
        severity: "warning",
        title: "Bloque ST sin END_PROGRAM",
        test: (code) => /PROGRAM\s+\w+/.test(code) && !/END_PROGRAM/.test(code),
        cause: "Un bloque PROGRAM de Texto Estructurado no está cerrado.",
        solution: "Cierre el bloque con END_PROGRAM."
    },
    {
        code: "E004",
        severity: "warning",
        title: "Bloque VAR sin END_VAR",
        test: (code) => /\bVAR\b/.test(code) && !/END_VAR/.test(code),
        cause: "Declaración de variables sin cierre END_VAR.",
        solution: "Cierre la sección de variables con END_VAR."
    },
    {
        code: "E005",
        severity: "info",
        title: "Espacios o tabulaciones irregulares",
        test: (code) => /\t/.test(code) || / {3,}\S/.test(code.replace(/^\s+/gm, "")),
        cause: "Formato inconsistente (tabs o espacios múltiples).",
        solution: "Use la función de reparación para normalizar el formato."
    },
    {
        code: "E006",
        severity: "critical",
        title: "Paréntesis IL desbalanceados",
        test: (code) => (code.match(/\(\*/g) || []).length !== (code.match(/\*\)/g) || []).length,
        cause: "Comentarios IL (* *) sin cerrar.",
        solution: "Cierre todos los comentarios (* ... *)."
    }
];

/**
 * Analiza un bloque de código y devuelve los problemas detectados con códigos de error.
 * @param {string} code - Código PLC a analizar
 * @returns {Object} { ok, issues: [{code, severity, title, cause, solution}], summary }
 */
function analyzeCode(code) {
    const text = code || "";
    const issues = codeRules
        .filter(rule => {
            try { return rule.test(text); } catch (e) { return false; }
        })
        .map(({ code: c, severity, title, cause, solution }) => ({ code: c, severity, title, cause, solution }));

    const critical = issues.filter(i => i.severity === "critical").length;
    const warnings = issues.filter(i => i.severity === "warning").length;

    return {
        ok: critical === 0,
        issues,
        summary: {
            total: issues.length,
            critical,
            warnings,
            info: issues.filter(i => i.severity === "info").length
        }
    };
}

/**
 * Busca un código de error de fallo conocido en la base de datos.
 * @param {string} brand - Marca (ej. "Siemens", "Allen-Bradley")
 * @param {string} code - Código de error a buscar
 * @returns {Object|null} Entrada de error o null si no existe
 */
function lookupErrorCode(brand, code) {
    const list = errorDatabase[brand];
    if (!list) return null;
    const needle = String(code).trim().toLowerCase();
    return list.find(e => e.code.toLowerCase() === needle) || null;
}

/**
 * Diagnóstico por síntoma en lenguaje natural. Busca coincidencias en
 * la base de datos de errores de todas las marcas (o una marca concreta).
 * @param {string} symptom - Descripción del problema/síntoma
 * @param {string} [brand] - Marca opcional para acotar la búsqueda
 * @returns {Object} { matches: [{brand, ...errorEntry, score}], total }
 */
function diagnose(symptom, brand) {
    const query = String(symptom || "").toLowerCase().trim();
    if (!query) return { matches: [], total: 0 };

    const terms = query.split(/\s+/).filter(t => t.length > 2);
    const brands = brand ? [brand] : Object.keys(errorDatabase);
    const matches = [];

    brands.forEach(b => {
        (errorDatabase[b] || []).forEach(entry => {
            const haystack = `${entry.code} ${entry.title} ${entry.cause} ${entry.solution}`.toLowerCase();
            let score = 0;
            terms.forEach(t => { if (haystack.includes(t)) score += 1; });
            if (score > 0) matches.push({ brand: b, ...entry, score });
        });
    });

    matches.sort((a, b) => b.score - a.score);
    return { matches, total: matches.length };
}

/**
 * Lista las marcas con base de datos de códigos de error disponible.
 * @returns {string[]}
 */
function getDiagnosticBrands() {
    return Object.keys(errorDatabase);
}

/**
 * Lista todos los códigos de error conocidos de una marca.
 * @param {string} brand
 * @returns {Array}
 */
function listErrorCodes(brand) {
    return errorDatabase[brand] ? errorDatabase[brand].slice() : [];
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        errorDatabase,
        codeRules,
        analyzeCode,
        lookupErrorCode,
        diagnose,
        getDiagnosticBrands,
        listErrorCodes
    };
}
