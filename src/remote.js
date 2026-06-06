/**
 * Módulo de Conexión Remota a PLCs
 *
 * Soporta los protocolos industriales más comunes:
 *   - Modbus TCP (puerto 502)
 *   - OPC UA (puerto 4840)
 *   - EtherNet/IP (puerto 44818)
 *   - Siemens S7comm (puerto 102)
 *
 * IMPORTANTE: Un navegador web NO puede abrir sockets TCP directos hacia un PLC.
 * Por eso este módulo funciona en dos modos:
 *   1) "simulation": simula un PLC en memoria (para pruebas y demo).
 *   2) "gateway": se conecta a un gateway WebSocket (ws://host:port) que reenvía
 *      las tramas al PLC real. En Electron (escritorio) se puede usar TCP nativo.
 */

const PROTOCOLS = {
    "modbus-tcp": { name: "Modbus TCP", defaultPort: 502 },
    "opc-ua": { name: "OPC UA", defaultPort: 4840 },
    "ethernet-ip": { name: "EtherNet/IP", defaultPort: 44818 },
    "s7comm": { name: "Siemens S7comm", defaultPort: 102 }
};

/**
 * Crea un gestor de conexión remota.
 * @param {Object} [opts]
 * @param {Function} [opts.transportFactory] - Crea el transporte real (WebSocket).
 *        Inyectable para pruebas. Por defecto usa WebSocket del navegador.
 * @returns {Object} gestor de conexión
 */
function createConnection(opts = {}) {
    const state = {
        status: "disconnected", // disconnected | connecting | connected | error
        config: null,
        transport: null,
        registers: {},          // almacén simulado de registros
        lastError: null,
        listeners: {}
    };

    const transportFactory = opts.transportFactory || defaultTransportFactory;

    function _emit(event, payload) {
        (state.listeners[event] || []).forEach(fn => {
            try { fn(payload); } catch (e) { /* no-op */ }
        });
    }

    function on(event, fn) {
        if (!state.listeners[event]) state.listeners[event] = [];
        state.listeners[event].push(fn);
        return () => off(event, fn);
    }

    function off(event, fn) {
        state.listeners[event] = (state.listeners[event] || []).filter(f => f !== fn);
    }

    /**
     * Valida la configuración de conexión.
     * @returns {{valid:boolean, errors:string[]}}
     */
    function validateConfig(config) {
        const errors = [];
        if (!config) { errors.push("Configuración requerida"); return { valid: false, errors }; }
        if (!PROTOCOLS[config.protocol]) {
            errors.push(`Protocolo no soportado: '${config.protocol}'`);
        }
        if (config.mode !== "simulation") {
            if (!config.host) errors.push("Se requiere 'host' (IP del PLC o gateway)");
            const port = config.port;
            if (port !== undefined && (typeof port !== "number" || port < 1 || port > 65535)) {
                errors.push("'port' debe estar entre 1 y 65535");
            }
        }
        return { valid: errors.length === 0, errors };
    }

    /**
     * Conecta al PLC. Devuelve una promesa que resuelve con el estado.
     * @param {Object} config { protocol, host, port, mode, slaveId }
     */
    function connect(config) {
        const cfg = Object.assign(
            { mode: "simulation", port: config && PROTOCOLS[config.protocol] ? PROTOCOLS[config.protocol].defaultPort : undefined, slaveId: 1 },
            config || {}
        );
        const v = validateConfig(cfg);
        if (!v.valid) {
            state.status = "error";
            state.lastError = v.errors.join("; ");
            return Promise.reject(new Error(state.lastError));
        }

        state.config = cfg;
        state.status = "connecting";
        _emit("status", state.status);

        if (cfg.mode === "simulation") {
            state.status = "connected";
            state.lastError = null;
            _emit("status", state.status);
            _emit("connected", { config: cfg });
            return Promise.resolve({ status: state.status, config: cfg });
        }

        // Modo gateway / TCP real
        return new Promise((resolve, reject) => {
            try {
                const transport = transportFactory(cfg);
                state.transport = transport;
                transport.onopen = () => {
                    state.status = "connected";
                    state.lastError = null;
                    _emit("status", state.status);
                    _emit("connected", { config: cfg });
                    resolve({ status: state.status, config: cfg });
                };
                transport.onerror = (err) => {
                    state.status = "error";
                    state.lastError = (err && err.message) || "Error de transporte";
                    _emit("status", state.status);
                    _emit("error", state.lastError);
                    reject(new Error(state.lastError));
                };
                transport.onclose = () => {
                    state.status = "disconnected";
                    _emit("status", state.status);
                };
            } catch (e) {
                state.status = "error";
                state.lastError = e.message;
                _emit("error", state.lastError);
                reject(e);
            }
        });
    }

    function disconnect() {
        if (state.transport && typeof state.transport.close === "function") {
            state.transport.close();
        }
        state.transport = null;
        state.status = "disconnected";
        _emit("status", state.status);
        return { status: state.status };
    }

    function isConnected() {
        return state.status === "connected";
    }

    function _assertConnected() {
        if (!isConnected()) throw new Error("No conectado. Llame a connect() primero.");
    }

    /**
     * Lee un registro/dirección. En simulación devuelve el valor almacenado (o 0).
     * @param {string} address - p.ej. "40001", "%MW10", "DB1.DBW0"
     * @returns {Promise<{address, value}>}
     */
    function readRegister(address) {
        _assertConnected();
        if (state.config.mode === "simulation") {
            const value = Object.prototype.hasOwnProperty.call(state.registers, address)
                ? state.registers[address] : 0;
            return Promise.resolve({ address, value });
        }
        return _send({ fn: "read", address });
    }

    /**
     * Escribe un valor en un registro/dirección.
     * @param {string} address
     * @param {number|boolean} value
     * @returns {Promise<{address, value, ok}>}
     */
    function writeRegister(address, value) {
        _assertConnected();
        if (state.config.mode === "simulation") {
            state.registers[address] = value;
            _emit("write", { address, value });
            return Promise.resolve({ address, value, ok: true });
        }
        return _send({ fn: "write", address, value });
    }

    /**
     * Lee varios registros de una vez.
     * @param {string[]} addresses
     */
    function readMany(addresses) {
        _assertConnected();
        return Promise.all((addresses || []).map(a => readRegister(a)));
    }

    function _send(frame) {
        return new Promise((resolve, reject) => {
            if (!state.transport || typeof state.transport.send !== "function") {
                return reject(new Error("Transporte no disponible"));
            }
            try {
                state.transport.send(JSON.stringify(frame));
                // El gateway debe responder vía onmessage; aquí resolvemos optimista.
                resolve(Object.assign({ ok: true }, frame));
            } catch (e) {
                reject(e);
            }
        });
    }

    function getStatus() {
        return {
            status: state.status,
            config: state.config,
            lastError: state.lastError,
            connected: isConnected()
        };
    }

    return {
        validateConfig,
        connect,
        disconnect,
        isConnected,
        readRegister,
        writeRegister,
        readMany,
        getStatus,
        on,
        off,
        _state: state // expuesto para pruebas
    };
}

/**
 * Crea un transporte WebSocket por defecto (navegador).
 * @param {Object} cfg
 * @returns {WebSocket}
 */
function defaultTransportFactory(cfg) {
    if (typeof WebSocket === "undefined") {
        throw new Error("WebSocket no disponible en este entorno. Use modo 'simulation' o un gateway.");
    }
    const scheme = cfg.secure ? "wss" : "ws";
    const port = cfg.gatewayPort || cfg.port || 8080;
    return new WebSocket(`${scheme}://${cfg.host}:${port}`);
}

/**
 * Lista los protocolos soportados.
 * @returns {Array<{id, name, defaultPort}>}
 */
function getProtocols() {
    return Object.entries(PROTOCOLS).map(([id, p]) => ({ id, name: p.name, defaultPort: p.defaultPort }));
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { createConnection, getProtocols, PROTOCOLS, defaultTransportFactory };
}
