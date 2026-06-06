/**
 * Módulo de Interfaz IA (AI Interface)
 * Permite que cualquier IA (ChatGPT, Claude, Gemini, Copilot, etc.)
 * gestione el generador PLC mediante comandos JSON estructurados.
 *
 * USO POR IA:
 * La IA envía un objeto JSON con un comando y recibe una respuesta JSON.
 *
 * Ejemplo de uso:
 *   const response = PLCInterface.execute({
 *       action: "generate",
 *       plcType: "Siemens (S7-1200/1500)",
 *       inputs: 4,
 *       outputs: 2,
 *       language: "es"
 *   });
 */

const PLCInterface = {
    /**
     * Versión de la API
     */
    version: "2.0.0",

    /**
     * Esquema de comandos disponibles para la IA.
     * La IA puede consultar esto para saber qué acciones puede realizar.
     */
    schema: {
        actions: {
            generate: {
                description: "Genera código PLC para un tipo específico de controlador",
                params: {
                    plcType: { type: "string", required: true, description: "Nombre del PLC (usar listTypes para ver opciones)" },
                    inputs: { type: "number", required: true, description: "Número de entradas digitales (0-256)" },
                    outputs: { type: "number", required: true, description: "Número de salidas digitales (0-256)" },
                    language: { type: "string", required: false, description: "Código de idioma para comentarios (es, en, fr...)" }
                },
                returns: "Objeto con código generado, metadatos y estado"
            },
            listTypes: {
                description: "Lista todos los tipos de PLC disponibles con sus configuraciones",
                params: {},
                returns: "Array de objetos con nombre, marca, lenguaje y tags"
            },
            listCategories: {
                description: "Lista PLCs agrupados por región geográfica",
                params: {},
                returns: "Objeto con categorías y arrays de PLCs"
            },
            getTypeInfo: {
                description: "Obtiene información detallada de un tipo de PLC específico",
                params: {
                    plcType: { type: "string", required: true, description: "Nombre exacto del tipo de PLC" }
                },
                returns: "Objeto con configuración completa del PLC"
            },
            repair: {
                description: "Repara y formatea código PLC con problemas de formato",
                params: {
                    code: { type: "string", required: true, description: "Código PLC a reparar" }
                },
                returns: "Código reparado"
            },
            validate: {
                description: "Valida si un tipo de PLC existe y los parámetros son correctos",
                params: {
                    plcType: { type: "string", required: true },
                    inputs: { type: "number", required: false },
                    outputs: { type: "number", required: false }
                },
                returns: "Objeto con valid:boolean y mensajes de error si aplica"
            },
            listLanguages: {
                description: "Lista todos los idiomas disponibles para la interfaz",
                params: {},
                returns: "Array de {code, name, native}"
            },
            setLanguage: {
                description: "Cambia el idioma de la interfaz",
                params: {
                    language: { type: "string", required: true, description: "Código ISO del idioma (es, en, fr, de...)" }
                },
                returns: "Confirmación del cambio de idioma"
            },
            help: {
                description: "Muestra ayuda sobre los comandos disponibles",
                params: {},
                returns: "Esquema completo de la API"
            },
            batch: {
                description: "Ejecuta múltiples comandos en secuencia",
                params: {
                    commands: { type: "array", required: true, description: "Array de objetos de comando" }
                },
                returns: "Array de respuestas en orden"
            }
        }
    },

    /**
     * Ejecuta un comando de la IA.
     * @param {Object} command - Comando JSON de la IA
     * @returns {Object} Respuesta JSON estructurada
     */
    execute(command) {
        if (!command || !command.action) {
            return this._error("Se requiere un campo 'action' en el comando");
        }

        try {
            switch (command.action) {
                case "generate":
                    return this._generate(command);
                case "listTypes":
                    return this._listTypes();
                case "listCategories":
                    return this._listCategories();
                case "getTypeInfo":
                    return this._getTypeInfo(command);
                case "repair":
                    return this._repair(command);
                case "validate":
                    return this._validate(command);
                case "listLanguages":
                    return this._listLanguages();
                case "setLanguage":
                    return this._setLanguage(command);
                case "help":
                    return this._help();
                case "batch":
                    return this._batch(command);
                default:
                    return this._error(`Acción desconocida: '${command.action}'. Use 'help' para ver acciones disponibles.`);
            }
        } catch (err) {
            return this._error(`Error interno: ${err.message}`);
        }
    },

    _generate(cmd) {
        const validation = this._validate(cmd);
        if (!validation.data.valid) {
            return validation;
        }

        if (cmd.language && typeof setLanguage === "function") {
            setLanguage(cmd.language);
        }

        const code = generatePLCCode(cmd.plcType, cmd.inputs, cmd.outputs);
        const repairedCode = repairPLCCode(code);
        const config = plcTypes[cmd.plcType];

        return this._success({
            code: repairedCode,
            metadata: {
                plcType: cmd.plcType,
                brand: config.brand,
                language: config.prefix,
                inputs: cmd.inputs,
                outputs: cmd.outputs,
                lines: repairedCode.split("\n").length,
                characters: repairedCode.length
            }
        });
    },

    _listTypes() {
        const types = Object.entries(plcTypes).map(([name, config]) => ({
            name,
            brand: config.brand,
            language: config.prefix,
            inputFormat: config.inputTag + config.separator + "N",
            outputFormat: config.outputTag + config.separator + "N"
        }));
        return this._success({ types, total: types.length });
    },

    _listCategories() {
        const categories = getPLCCategories();
        return this._success({ categories });
    },

    _getTypeInfo(cmd) {
        if (!cmd.plcType) {
            return this._error("Se requiere 'plcType'");
        }
        const config = plcTypes[cmd.plcType];
        if (!config) {
            return this._error(`Tipo '${cmd.plcType}' no encontrado. Use 'listTypes' para ver opciones.`);
        }
        return this._success({
            name: cmd.plcType,
            ...config,
            example: generatePLCCode(cmd.plcType, 2, 1)
        });
    },

    _repair(cmd) {
        if (!cmd.code) {
            return this._error("Se requiere 'code' con el código a reparar");
        }
        const repaired = repairPLCCode(cmd.code);
        return this._success({
            original: cmd.code,
            repaired,
            changes: cmd.code !== repaired
        });
    },

    _validate(cmd) {
        const errors = [];

        if (!cmd.plcType) {
            errors.push("Se requiere 'plcType'");
        } else if (!plcTypes[cmd.plcType]) {
            errors.push(`Tipo '${cmd.plcType}' no reconocido`);
        }

        if (cmd.inputs !== undefined) {
            if (typeof cmd.inputs !== "number" || cmd.inputs < 0) {
                errors.push("'inputs' debe ser un número >= 0");
            }
            if (cmd.inputs > 256) {
                errors.push("'inputs' no puede exceder 256");
            }
        }

        if (cmd.outputs !== undefined) {
            if (typeof cmd.outputs !== "number" || cmd.outputs < 0) {
                errors.push("'outputs' debe ser un número >= 0");
            }
            if (cmd.outputs > 256) {
                errors.push("'outputs' no puede exceder 256");
            }
        }

        return this._success({ valid: errors.length === 0, errors });
    },

    _listLanguages() {
        if (typeof getAvailableLanguages === "function") {
            return this._success({ languages: getAvailableLanguages() });
        }
        return this._success({ languages: [{ code: "es", name: "Español", native: "Español" }] });
    },

    _setLanguage(cmd) {
        if (!cmd.language) {
            return this._error("Se requiere 'language' con el código de idioma");
        }
        if (typeof setLanguage === "function") {
            const success = setLanguage(cmd.language);
            if (success) {
                return this._success({ language: cmd.language, message: `Idioma cambiado a ${cmd.language}` });
            }
            return this._error(`Idioma '${cmd.language}' no soportado`);
        }
        return this._error("Módulo i18n no disponible");
    },

    _help() {
        return this._success({
            version: this.version,
            description: "API para que cualquier IA gestione el generador PLC",
            schema: this.schema,
            example: {
                action: "generate",
                plcType: "Siemens (S7-1200/1500)",
                inputs: 4,
                outputs: 2
            }
        });
    },

    _batch(cmd) {
        if (!Array.isArray(cmd.commands)) {
            return this._error("'commands' debe ser un array de comandos");
        }
        const results = cmd.commands.map(c => this.execute(c));
        return this._success({ results, total: results.length });
    },

    _success(data) {
        return { status: "ok", data, timestamp: new Date().toISOString() };
    },

    _error(message) {
        return { status: "error", error: message, timestamp: new Date().toISOString() };
    }
};

if (typeof module !== "undefined" && module.exports) {
    module.exports = { PLCInterface };
}
