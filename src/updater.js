/**
 * Módulo de Actualización Automática
 *
 * - Compara la versión local con un version.json remoto.
 * - Integra el ciclo de actualización del Service Worker (PWA): detecta cuando
 *   hay un nuevo worker en espera y permite aplicarlo (skipWaiting + reload).
 * - En Electron, electron-updater gestiona la descarga del nuevo .exe.
 */

const APP_VERSION = "3.0.0";

/**
 * Compara dos versiones semánticas.
 * @param {string} a
 * @param {string} b
 * @returns {number} -1 si a<b, 0 si iguales, 1 si a>b
 */
function compareVersions(a, b) {
    const pa = String(a).split(".").map(n => parseInt(n, 10) || 0);
    const pb = String(b).split(".").map(n => parseInt(n, 10) || 0);
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
        const x = pa[i] || 0;
        const y = pb[i] || 0;
        if (x < y) return -1;
        if (x > y) return 1;
    }
    return 0;
}

/**
 * Comprueba si hay una versión más reciente disponible.
 * @param {Object} [opts]
 * @param {string} [opts.url="version.json"] - URL del manifiesto de versión
 * @param {string} [opts.current=APP_VERSION] - Versión actual instalada
 * @param {Function} [opts.fetchFn] - fetch inyectable (para pruebas)
 * @returns {Promise<{updateAvailable, current, latest, notes}>}
 */
function checkForUpdate(opts = {}) {
    const url = opts.url || "version.json";
    const current = opts.current || APP_VERSION;
    const fetchFn = opts.fetchFn || (typeof fetch !== "undefined" ? fetch : null);

    if (!fetchFn) {
        return Promise.reject(new Error("fetch no disponible en este entorno"));
    }

    return fetchFn(url, { cache: "no-store" })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(manifest => {
            const latest = manifest.version;
            const updateAvailable = compareVersions(current, latest) < 0;
            return {
                updateAvailable,
                current,
                latest,
                notes: manifest.notes || "",
                releaseDate: manifest.releaseDate || null
            };
        });
}

/**
 * Registra el Service Worker y vigila actualizaciones.
 * Llama a onUpdate(applyFn) cuando hay un worker nuevo en espera.
 * @param {Object} [opts]
 * @param {string} [opts.swPath="sw.js"]
 * @param {Function} [opts.onUpdate] - callback(applyUpdateFn)
 * @param {Object} [opts.navigatorRef] - navigator inyectable (pruebas)
 * @returns {Promise<Object|null>} registro del SW o null si no soportado
 */
function registerServiceWorker(opts = {}) {
    const nav = opts.navigatorRef || (typeof navigator !== "undefined" ? navigator : null);
    const swPath = opts.swPath || "sw.js";
    const onUpdate = opts.onUpdate || (() => {});

    if (!nav || !("serviceWorker" in nav)) {
        return Promise.resolve(null);
    }

    return nav.serviceWorker.register(swPath).then(registration => {
        registration.addEventListener && registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && nav.serviceWorker.controller) {
                    // Hay una versión nueva lista en espera
                    onUpdate(() => applyUpdate(registration));
                }
            });
        });
        return registration;
    });
}

/**
 * Aplica la actualización pendiente: indica al worker en espera que tome control
 * y recarga la página.
 * @param {Object} registration - ServiceWorkerRegistration
 * @param {Object} [opts] { reload }
 */
function applyUpdate(registration, opts = {}) {
    const doReload = opts.reload !== false;
    if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    if (doReload && typeof location !== "undefined" && location.reload) {
        location.reload();
    }
    return true;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        APP_VERSION,
        compareVersions,
        checkForUpdate,
        registerServiceWorker,
        applyUpdate
    };
}
