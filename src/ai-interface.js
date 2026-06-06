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
    version: "3.0.0",

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
            analyze: {
                description: "Analiza código PLC y devuelve problemas detectados con códigos de error",
                params: {
                    code: { type: "string", required: true, description: "Código PLC a analizar" }
                },
                returns: "Objeto con issues[], summary y estado ok"
            },
            diagnose: {
                description: "Diagnostica un síntoma/avería y devuelve códigos de error, causa y solución",
                params: {
                    symptom: { type: "string", required: true, description: "Descripción del problema o síntoma" },
                    brand: { type: "string", required: false, description: "Marca para acotar (Siemens, Allen-Bradley...)" }
                },
                returns: "Objeto con matches[] ordenados por relevancia"
            },
            errorCode: {
                description: "Busca el significado de un código de error de una marca",
                params: {
                    brand: { type: "string", required: true, description: "Marca del PLC" },
                    code: { type: "string", required: true, description: "Código de error a buscar" }
                },
                returns: "Entrada de error con causa y solución, o error si no existe"
            },
            connect: {
                description: "Conecta de forma remota a un PLC (Modbus/OPC UA/EtherNet-IP). Por defecto en modo simulación.",
                params: {
                    protocol: { type: "string", required: true, description: "modbus-tcp | opc-ua | ethernet-ip | s7comm" },
                    host: { type: "string", required: false, description: "IP del PLC o gateway (no requerido en simulación)" },
                    port: { type: "number", required: false, description: "Puerto (por defecto según protocolo)" },
                    mode: { type: "string", required: false, description: "simulation | gateway (por defecto simulation)" }
                },
                returns: "Estado de la conexión"
            },
            read: {
                description: "Lee un registro del PLC conectado",
                params: { address: { type: "string", required: true, description: "Dirección/registro (ej. 40001, %MW10)" } },
                returns: "Objeto {address, value}"
            },
            write: {
                description: "Escribe un valor en un registro del PLC conectado",
                params: {
                    address: { type: "string", required: true },
                    value: { type: "number", required: true }
                },
                returns: "Objeto {address, value, ok}"
            },
            connectionStatus: {
                description: "Devuelve el estado de la conexión remota actual",
                params: {},
                returns: "Estado de la conexión"
            },
            disconnect: {
                description: "Cierra la conexión remota actual",
                params: {},
                returns: "Estado de la conexión"
            },
            checkUpdate: {
                description: "Comprueba si hay una versión más reciente de la aplicación",
                params: {},
                returns: "Objeto con updateAvailable, current, latest y notas"
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
     * Conexión remota persistente compartida entre comandos.
     */
    _connection: null,

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
                case "analyze":
                    return this._analyze(command);
                case "diagnose":
                    return this._diagnose(command);
                case "errorCode":
                    return this._errorCode(command);
                case "connect":
                    return this._connect(command);
                case "read":
                    return this._read(command);
                case "write":
                    return this._write(command);
                case "connectionStatus":
                    return this._connectionStatus();
                case "disconnect":
                    return this._disconnect();
                case "checkUpdate":
                    return this._checkUpdate();
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

    _analyze(cmd) {
        if (typeof cmd.code !== "string") {
            return this._error("Se requiere 'code' (string) para analizar");
        }
        if (typeof analyzeCode !== "function") {
            return this._error("Módulo de diagnóstico no disponible");
        }
        return this._success(analyzeCode(cmd.code));
    },

    _diagnose(cmd) {
        if (!cmd.symptom) {
            return this._error("Se requiere 'symptom' con la descripción del problema");
        }
        if (typeof diagnose !== "function") {
            return this._error("Módulo de diagnóstico no disponible");
        }
        return this._success(diagnose(cmd.symptom, cmd.brand));
    },

    _errorCode(cmd) {
        if (!cmd.brand || !cmd.code) {
            return this._error("Se requieren 'brand' y 'code'");
        }
        if (typeof lookupErrorCode !== "function") {
            return this._error("Módulo de diagnóstico no disponible");
        }
        const entry = lookupErrorCode(cmd.brand, cmd.code);
        if (!entry) {
            return this._error(`Código '${cmd.code}' no encontrado para la marca '${cmd.brand}'`);
        }
        return this._success({ brand: cmd.brand, ...entry });
    },

    _connect(cmd) {
        if (typeof createConnection !== "function") {
            return this._error("Módulo de conexión remota no disponible");
        }
        const cfg = {
            protocol: cmd.protocol,
            host: cmd.host,
            port: cmd.port,
            mode: cmd.mode || "simulation",
            slaveId: cmd.slaveId
        };
        if (!this._connection) {
            this._connection = createConnection();
        }
        const validation = this._connection.validateConfig(cfg);
        if (!validation.valid) {
            return this._error(validation.errors.join("; "));
        }
        if (cfg.mode !== "simulation") {
            return this._error("Conexión real requiere un gateway WebSocket. Use mode:'simulation' aquí o conecte desde el panel/Electron.");
        }
        // En simulación el estado se actualiza de forma síncrona.
        this._connection.connect(cfg).catch(() => {});
        return this._success(this._connection.getStatus());
    },

    _read(cmd) {
        if (!this._connection || !this._connection.isConnected()) {
            return this._error("No conectado. Use 'connect' primero.");
        }
        if (!cmd.address) {
            return this._error("Se requiere 'address'");
        }
        const regs = this._connection._state.registers;
        const value = Object.prototype.hasOwnProperty.call(regs, cmd.address) ? regs[cmd.address] : 0;
        return this._success({ address: cmd.address, value });
    },

    _write(cmd) {
        if (!this._connection || !this._connection.isConnected()) {
            return this._error("No conectado. Use 'connect' primero.");
        }
        if (!cmd.address || cmd.value === undefined) {
            return this._error("Se requieren 'address' y 'value'");
        }
        this._connection.writeRegister(cmd.address, cmd.value).catch(() => {});
        return this._success({ address: cmd.address, value: cmd.value, ok: true });
    },

    _connectionStatus() {
        if (!this._connection) {
            return this._success({ status: "disconnected", connected: false, config: null });
        }
        return this._success(this._connection.getStatus());
    },

    _disconnect() {
        if (!this._connection) {
            return this._success({ status: "disconnected" });
        }
        return this._success(this._connection.disconnect());
    },

    _checkUpdate() {
        const current = (typeof APP_VERSION !== "undefined") ? APP_VERSION : this.version;
        return this._success({
            current,
            apiVersion: this.version,
            message: "Use updater.checkForUpdate() para comprobar contra el servidor (requiere fetch)."
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
