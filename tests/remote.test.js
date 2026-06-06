/**
 * Pruebas unitarias para el módulo de conexión remota (src/remote.js)
 */

const { createConnection, getProtocols, PROTOCOLS } = require("../src/remote.js");

describe("getProtocols", () => {
    test("lista protocolos con puerto por defecto", () => {
        const protos = getProtocols();
        expect(protos.length).toBeGreaterThanOrEqual(4);
        const modbus = protos.find(p => p.id === "modbus-tcp");
        expect(modbus.defaultPort).toBe(502);
    });

    test("PROTOCOLS incluye opc-ua y ethernet-ip", () => {
        expect(PROTOCOLS["opc-ua"]).toBeDefined();
        expect(PROTOCOLS["ethernet-ip"]).toBeDefined();
    });
});

describe("validateConfig", () => {
    const conn = createConnection();

    test("rechaza protocolo no soportado", () => {
        const v = conn.validateConfig({ protocol: "xyz", mode: "simulation" });
        expect(v.valid).toBe(false);
    });

    test("acepta simulación sin host", () => {
        const v = conn.validateConfig({ protocol: "modbus-tcp", mode: "simulation" });
        expect(v.valid).toBe(true);
    });

    test("requiere host en modo gateway", () => {
        const v = conn.validateConfig({ protocol: "modbus-tcp", mode: "gateway" });
        expect(v.valid).toBe(false);
        expect(v.errors.join(" ")).toMatch(/host/);
    });

    test("rechaza puerto fuera de rango", () => {
        const v = conn.validateConfig({ protocol: "modbus-tcp", mode: "gateway", host: "1.2.3.4", port: 99999 });
        expect(v.valid).toBe(false);
    });
});

describe("connect (simulación)", () => {
    test("conecta en modo simulación", async () => {
        const conn = createConnection();
        const res = await conn.connect({ protocol: "modbus-tcp", mode: "simulation" });
        expect(res.status).toBe("connected");
        expect(conn.isConnected()).toBe(true);
    });

    test("usa puerto por defecto del protocolo", async () => {
        const conn = createConnection();
        await conn.connect({ protocol: "opc-ua", mode: "simulation" });
        expect(conn.getStatus().config.port).toBe(4840);
    });

    test("rechaza configuración inválida", async () => {
        const conn = createConnection();
        await expect(conn.connect({ protocol: "bad", mode: "simulation" })).rejects.toThrow();
    });

    test("emite evento de estado al conectar", async () => {
        const conn = createConnection();
        const states = [];
        conn.on("status", s => states.push(s));
        await conn.connect({ protocol: "modbus-tcp", mode: "simulation" });
        expect(states).toContain("connected");
    });
});

describe("read/write (simulación)", () => {
    test("escribe y lee un registro", async () => {
        const conn = createConnection();
        await conn.connect({ protocol: "modbus-tcp", mode: "simulation" });
        await conn.writeRegister("40001", 123);
        const r = await conn.readRegister("40001");
        expect(r.value).toBe(123);
    });

    test("lee 0 en registro no escrito", async () => {
        const conn = createConnection();
        await conn.connect({ protocol: "modbus-tcp", mode: "simulation" });
        const r = await conn.readRegister("49999");
        expect(r.value).toBe(0);
    });

    test("readMany devuelve varios registros", async () => {
        const conn = createConnection();
        await conn.connect({ protocol: "modbus-tcp", mode: "simulation" });
        await conn.writeRegister("1", 10);
        await conn.writeRegister("2", 20);
        const res = await conn.readMany(["1", "2"]);
        expect(res.map(r => r.value)).toEqual([10, 20]);
    });

    test("falla leer si no está conectado", () => {
        const conn = createConnection();
        expect(() => conn.readRegister("1")).toThrow();
    });
});

describe("disconnect", () => {
    test("desconecta y actualiza estado", async () => {
        const conn = createConnection();
        await conn.connect({ protocol: "modbus-tcp", mode: "simulation" });
        const res = conn.disconnect();
        expect(res.status).toBe("disconnected");
        expect(conn.isConnected()).toBe(false);
    });
});

describe("modo gateway con transporte inyectado", () => {
    function fakeTransportFactory() {
        const t = { sent: [], onopen: null, onerror: null, onclose: null,
            send(d) { this.sent.push(d); }, close() { if (this.onclose) this.onclose(); } };
        // Simula apertura asíncrona exitosa
        setTimeout(() => t.onopen && t.onopen(), 0);
        return t;
    }

    test("conecta vía gateway con transporte simulado", async () => {
        const conn = createConnection({ transportFactory: fakeTransportFactory });
        const res = await conn.connect({ protocol: "modbus-tcp", mode: "gateway", host: "127.0.0.1", port: 8080 });
        expect(res.status).toBe("connected");
    });

    test("envía trama de escritura por el transporte", async () => {
        let transport;
        const factory = (cfg) => { transport = fakeTransportFactory(cfg); return transport; };
        const conn = createConnection({ transportFactory: factory });
        await conn.connect({ protocol: "modbus-tcp", mode: "gateway", host: "127.0.0.1" });
        await conn.writeRegister("40001", 7);
        expect(transport.sent.length).toBeGreaterThan(0);
        expect(transport.sent[0]).toMatch(/40001/);
    });

    test("propaga error de transporte", async () => {
        const factory = () => {
            const t = { onopen: null, onerror: null, onclose: null, send() {}, close() {} };
            setTimeout(() => t.onerror && t.onerror(new Error("rechazado")), 0);
            return t;
        };
        const conn = createConnection({ transportFactory: factory });
        await expect(conn.connect({ protocol: "modbus-tcp", mode: "gateway", host: "127.0.0.1" })).rejects.toThrow();
    });
});
