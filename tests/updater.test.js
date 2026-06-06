/**
 * Pruebas unitarias para el módulo de actualización (src/updater.js)
 */

const {
    APP_VERSION,
    compareVersions,
    checkForUpdate,
    registerServiceWorker,
    applyUpdate
} = require("../src/updater.js");

describe("compareVersions", () => {
    test("detecta versión mayor", () => {
        expect(compareVersions("1.0.0", "2.0.0")).toBe(-1);
        expect(compareVersions("2.0.0", "1.0.0")).toBe(1);
        expect(compareVersions("1.2.3", "1.2.3")).toBe(0);
    });

    test("compara por componentes", () => {
        expect(compareVersions("1.10.0", "1.9.0")).toBe(1);
        expect(compareVersions("1.0.1", "1.0.0")).toBe(1);
    });

    test("maneja longitudes distintas", () => {
        expect(compareVersions("1.0", "1.0.0")).toBe(0);
        expect(compareVersions("1.0.1", "1.0")).toBe(1);
    });
});

describe("checkForUpdate", () => {
    test("indica actualización disponible", async () => {
        const fetchFn = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ version: "9.9.9", notes: "nuevo" }) });
        const res = await checkForUpdate({ current: "3.0.0", fetchFn });
        expect(res.updateAvailable).toBe(true);
        expect(res.latest).toBe("9.9.9");
        expect(res.notes).toBe("nuevo");
    });

    test("indica que no hay actualización si versión igual", async () => {
        const fetchFn = () => Promise.resolve({ ok: true, json: () => Promise.resolve({ version: "3.0.0" }) });
        const res = await checkForUpdate({ current: "3.0.0", fetchFn });
        expect(res.updateAvailable).toBe(false);
    });

    test("rechaza si HTTP falla", async () => {
        const fetchFn = () => Promise.resolve({ ok: false, status: 404 });
        await expect(checkForUpdate({ current: "3.0.0", fetchFn })).rejects.toThrow();
    });

    test("rechaza si no hay fetch disponible", async () => {
        await expect(checkForUpdate({ current: "3.0.0", fetchFn: null })).rejects.toThrow();
    });
});

describe("registerServiceWorker", () => {
    test("devuelve null si serviceWorker no está soportado", async () => {
        const reg = await registerServiceWorker({ navigatorRef: {} });
        expect(reg).toBeNull();
    });

    test("registra el worker cuando está soportado", async () => {
        const fakeRegistration = { addEventListener: () => {} };
        const navigatorRef = {
            serviceWorker: { register: () => Promise.resolve(fakeRegistration) }
        };
        const reg = await registerServiceWorker({ navigatorRef });
        expect(reg).toBe(fakeRegistration);
    });

    test("dispara onUpdate cuando hay worker instalado", async () => {
        let updateFound;
        const newWorker = {
            state: "installed",
            addEventListener: (ev, fn) => { if (ev === "statechange") newWorker._fn = fn; }
        };
        const fakeRegistration = {
            installing: newWorker,
            addEventListener: (ev, fn) => { if (ev === "updatefound") updateFound = fn; }
        };
        const navigatorRef = {
            serviceWorker: { register: () => Promise.resolve(fakeRegistration), controller: {} }
        };
        let called = false;
        await registerServiceWorker({ navigatorRef, onUpdate: () => { called = true; } });
        updateFound();          // simula updatefound
        newWorker._fn();        // simula statechange -> installed
        expect(called).toBe(true);
    });
});

describe("applyUpdate", () => {
    test("envía SKIP_WAITING al worker en espera", () => {
        let posted = null;
        const registration = { waiting: { postMessage: (m) => { posted = m; } } };
        applyUpdate(registration, { reload: false });
        expect(posted).toEqual({ type: "SKIP_WAITING" });
    });

    test("no falla sin worker en espera", () => {
        expect(() => applyUpdate({}, { reload: false })).not.toThrow();
    });
});

describe("APP_VERSION", () => {
    test("está definida", () => {
        expect(typeof APP_VERSION).toBe("string");
        expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
});
